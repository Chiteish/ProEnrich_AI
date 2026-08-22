import io
import os
import re
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import requests

try:
    import pymupdf
except ImportError:
    import fitz as pymupdf

from app.ingestion.pdf_processor import extract_pdf_text


class WebLoader:

    def __init__(self, session=None, timeout=20.0):
        self.session = session or requests.Session()
        self.timeout = timeout
        if "User-Agent" not in self.session.headers:
            self.session.headers.update({
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            })

    def search_product(self, mpn: str, manufacturer: str) -> list[str]:
        if not mpn and not manufacturer:
            return []

        queries = [
            f"{manufacturer} {mpn}".strip(),
            f"{manufacturer} {mpn} product".strip(),
            f"{mpn} specification".strip(),
            f"{mpn} manual".strip()
        ]

        discovered_urls = []

        for query in queries:
            search_urls = [
                f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}",
                f"https://lite.duckduckgo.com/lite/?q={requests.utils.quote(query)}"
            ]

            for search_url in search_urls:
                try:
                    response = self.session.get(
                        search_url,
                        timeout=self.timeout
                    )
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, "html.parser")
                        for a_tag in soup.find_all("a", href=True):
                            href = a_tag["href"]
                            # Handle DuckDuckGo redirect uddg parameter
                            if "uddg=" in href:
                                match = re.search(r"uddg=([^&]+)", href)
                                if match:
                                    actual_url = requests.utils.unquote(match.group(1))
                                    if actual_url.startswith(("http://", "https://")):
                                        discovered_urls.append(actual_url)
                            elif href.startswith(("http://", "https://")):
                                # Skip search engine domains
                                domain = urlparse(href).netloc.lower()
                                if not any(se in domain for se in ["duckduckgo", "google", "bing", "yahoo"]):
                                    discovered_urls.append(href)
                except requests.Timeout:
                    print(f"[WebLoader] Timeout fetching search results: {search_url}")
                    continue
                except requests.RequestException as e:
                    print(f"[WebLoader] Request failed for search: {search_url} - {str(e)}")
                    continue
                except Exception as e:
                    print(f"[WebLoader] Generic search error: {search_url} - {str(e)}")
                    continue

            if len(discovered_urls) >= 10:
                break

        # Remove duplicates while preserving order
        unique_urls = []
        seen = set()
        for url in discovered_urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        # Sort so that manufacturer URLs come first
        mfr_slug = re.sub(r"[^a-zA-Z0-9]", "", manufacturer.lower()) if manufacturer else ""
        if mfr_slug:
            def is_mfr(url):
                try:
                    netloc = urlparse(url).netloc.lower()
                    return mfr_slug in netloc.replace("-", "").replace(".", "")
                except Exception:
                    return False
            mfr_urls = [u for u in unique_urls if is_mfr(u)]
            other_urls = [u for u in unique_urls if not is_mfr(u)]
            unique_urls = mfr_urls + other_urls

        return unique_urls

    def extract_product_metadata_from_html(
        self,
        html_content: str,
        base_url: str = "",
        manufacturer: str = "",
        mpn: str = ""
    ) -> dict:
        soup = BeautifulSoup(html_content, "html.parser")

        # 1. MFR URL and Ref URLs
        mfr_url = None
        ref_urls = []

        # Check canonical or og:url
        canonical_link = soup.find("link", rel="canonical")
        canonical_url = canonical_link["href"] if (canonical_link and canonical_link.get("href")) else None
        og_url_meta = soup.find("meta", property="og:url") or soup.find("meta", attrs={"name": "og:url"})
        og_url = og_url_meta["content"] if (og_url_meta and og_url_meta.get("content")) else None

        current_url = canonical_url or og_url or base_url

        mfr_slug = re.sub(r"[^a-zA-Z0-9]", "", manufacturer.lower()) if manufacturer else ""

        def _is_mfr(url):
            if not url or not mfr_slug:
                return False
            netloc = urlparse(url).netloc.lower()
            return mfr_slug in netloc.replace("-", "").replace(".", "")

        if current_url and current_url.startswith(("http://", "https://")):
            if _is_mfr(current_url):
                mfr_url = current_url
            else:
                ref_urls.append(current_url)

        # Scan page links
        spec_sheet_url = None
        manual_url = None

        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if not href or href.startswith(("#", "javascript:", "mailto:")):
                continue

            full_url = urljoin(base_url, href) if base_url else href
            if not full_url.startswith(("http://", "https://")):
                continue

            link_text = " ".join([a.get_text(strip=True), a.get("title", ""), a.get("aria-label", ""), href]).lower()

            # Spec sheet check
            is_pdf = full_url.lower().endswith(".pdf") or ".pdf?" in full_url.lower() or "document" in full_url.lower()
            if not spec_sheet_url:
                if any(kw in link_text for kw in ["spec sheet", "specification sheet", "datasheet", "data sheet", "cutsheet", "specs", "technical data"]):
                    spec_sheet_url = full_url
                elif is_pdf and any(kw in full_url.lower() for kw in ["spec", "datasheet", "data_sheet"]):
                    spec_sheet_url = full_url

            # Manual check
            if not manual_url:
                if any(kw in link_text for kw in ["owner manual", "user manual", "owners manual", "installation manual", "instruction manual", "user guide", "service manual", "manual"]):
                    manual_url = full_url
                elif is_pdf and any(kw in full_url.lower() for kw in ["manual", "installation", "guide", "instructions"]):
                    manual_url = full_url

            # Check if this link is manufacturer URL or reference URL
            if _is_mfr(full_url) and not mfr_url:
                mfr_url = full_url
            elif full_url not in ref_urls and full_url != mfr_url and full_url != spec_sheet_url and full_url != manual_url:
                ref_urls.append(full_url)

        # 2. Product Image and Alternate Images
        product_image = None
        alternate_images = []

        # Check og:image or twitter:image
        og_image_meta = (
            soup.find("meta", property="og:image")
            or soup.find("meta", attrs={"name": "og:image"})
            or soup.find("meta", property="twitter:image")
            or soup.find("meta", attrs={"name": "twitter:image"})
        )
        if og_image_meta and og_image_meta.get("content"):
            img_src = og_image_meta["content"].strip()
            product_image = urljoin(base_url, img_src) if base_url else img_src

        # Find images in body
        for img in soup.find_all("img"):
            src = (
                img.get("src")
                or img.get("data-src")
                or img.get("data-original")
                or img.get("data-lazy-src")
            )
            if not src or src.startswith("data:"):
                continue

            full_img_url = urljoin(base_url, src.strip()) if base_url else src.strip()
            img_lower = full_img_url.lower()

            # Filter out non-product images (icons, logos, trackers, badges)
            if any(junk in img_lower for junk in [
                "icon", "logo", "pixel", "tracker", "badge", "spacer", "blank.gif", "avatar", "social", "spinner", "star",
                "favicon", "sprite", "banner", "placeholder"
            ]):
                continue

            if not product_image:
                product_image = full_img_url
            elif full_img_url != product_image and full_img_url not in alternate_images:
                if len(alternate_images) < 4:
                    alternate_images.append(full_img_url)

        # 3. Clean Text Extraction for RAG
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            element.decompose()

        # Extract text sections and table rows
        text_parts = []
        for table in soup.find_all("table"):
            rows = []
            for tr in table.find_all("tr"):
                cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
                if cells:
                    rows.append(" : ".join(cells))
            if rows:
                text_parts.append("\n".join(rows))

        for dl in soup.find_all("dl"):
            items = []
            dts = dl.find_all("dt")
            dds = dl.find_all("dd")
            for dt, dd in zip(dts, dds):
                items.append(f"{dt.get_text(strip=True)}: {dd.get_text(strip=True)}")
            if items:
                text_parts.append(" | ".join(items))

        body_text = soup.get_text(" ", strip=True)
        if body_text:
            text_parts.append(body_text)

        clean_text = "\n\n".join(text_parts)

        return {
            "mfr_url": mfr_url,
            "ref_urls": ref_urls[:5],
            "product_image": product_image,
            "alternate_images": alternate_images[:4],
            "specification_sheet": spec_sheet_url,
            "manual": manual_url,
            "text": clean_text
        }

    def download_and_extract_pdf(
        self,
        pdf_url_or_path,
        product_id: str = "",
        source_name: str = ""
    ) -> list[dict]:
        if not pdf_url_or_path:
            return []

        # Support raw bytes input directly
        if isinstance(pdf_url_or_path, bytes):
            try:
                doc_name = source_name or "document.pdf"
                pdf_bytes = io.BytesIO(pdf_url_or_path)
                pages = []
                with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
                    for page_number, page in enumerate(document):
                        text = page.get_text("text")
                        if text and text.strip():
                            pages.append({
                                "source": doc_name,
                                "page": page_number + 1,
                                "text": text,
                                "source_url": None,
                                "product_id": product_id
                            })
                return pages
            except Exception as e:
                print(f"[WebLoader] Generic PDF bytes parsing error: {str(e)}")
                return []

        # Local file path
        try:
            if isinstance(pdf_url_or_path, str) and os.path.exists(pdf_url_or_path):
                pages = extract_pdf_text(pdf_url_or_path)
                doc_name = source_name or os.path.basename(pdf_url_or_path)
                return [
                    {
                        "source": doc_name,
                        "page": page["page"],
                        "text": page["text"],
                        "source_url": None,
                        "product_id": product_id
                    }
                    for page in pages
                ]
        except Exception as e:
            print(f"[WebLoader] Local PDF read error: {pdf_url_or_path} - {str(e)}")
            return []

        # Remote URL
        if isinstance(pdf_url_or_path, str) and pdf_url_or_path.startswith(("http://", "https://")):
            try:
                response = self.session.get(pdf_url_or_path, timeout=self.timeout)
                if response.status_code == 200:
                    doc_name = source_name or os.path.basename(urlparse(pdf_url_or_path).path) or "document.pdf"
                    pdf_bytes = io.BytesIO(response.content)
                    pages = []
                    with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
                        for page_number, page in enumerate(document):
                            text = page.get_text("text")
                            if text and text.strip():
                                pages.append({
                                    "source": doc_name,
                                    "page": page_number + 1,
                                    "text": text,
                                    "source_url": pdf_url_or_path,
                                    "product_id": product_id
                                })
                    return pages
            except requests.Timeout:
                print(f"[WebLoader] Timeout fetching PDF: {pdf_url_or_path}")
            except requests.RequestException as e:
                print(f"[WebLoader] Request failed for PDF: {pdf_url_or_path} - {str(e)}")
            except Exception as e:
                print(f"[WebLoader] Generic PDF URL parsing error: {pdf_url_or_path} - {str(e)}")

        return []

    def discover_and_load(
        self,
        mpn: str,
        manufacturer: str,
        description: str = "",
        candidate_urls: list[str] = None,
        download_pdfs: bool = True
    ) -> dict:
        input_candidates = list(candidate_urls) if candidate_urls else []
        
        # Deduplicate candidates
        seen_candidates = set()
        deduped_candidates = []
        for url in input_candidates:
            if url and url not in seen_candidates:
                seen_candidates.add(url)
                deduped_candidates.append(url)

        # Do not require live search if a valid candidate URL already exists
        if not deduped_candidates:
            discovered = self.search_product(mpn, manufacturer)
        else:
            discovered = []

        # Combine candidate_urls + discovered URLs
        urls_to_check = []
        seen = set()
        for url in deduped_candidates + discovered:
            if url and url not in seen:
                seen.add(url)
                urls_to_check.append(url)

        mfr_url = None
        ref_urls = []
        product_image = None
        alternate_images = []
        spec_sheet_url = None
        manual_url = None
        documents = []

        for url in urls_to_check:
            try:
                response = self.session.get(url, timeout=self.timeout)
                if response.status_code != 200:
                    print(f"[WebLoader] Non-200 response fetching: {url} - Status: {response.status_code}")
                    continue

                print(f"[WebLoader] Parsed product page: {url}")
                content_type = response.headers.get("Content-Type", "").lower()
                if "application/pdf" in content_type or url.lower().endswith(".pdf"):
                    # Direct PDF
                    pdf_docs = self.download_and_extract_pdf(
                        url,
                        product_id=mpn,
                        source_name=os.path.basename(urlparse(url).path)
                    )
                    documents.extend(pdf_docs)
                    if not spec_sheet_url and any(kw in url.lower() for kw in ["spec", "datasheet"]):
                        spec_sheet_url = url
                    elif not manual_url and any(kw in url.lower() for kw in ["manual", "guide"]):
                        manual_url = url
                    continue

                # HTML page
                meta = self.extract_product_metadata_from_html(
                    response.text,
                    base_url=url,
                    manufacturer=manufacturer,
                    mpn=mpn
                )

                if meta.get("mfr_url") and not mfr_url:
                    mfr_url = meta["mfr_url"]

                for ref in meta.get("ref_urls", []):
                    if ref not in ref_urls and ref != mfr_url:
                        ref_urls.append(ref)

                if meta.get("product_image") and not product_image:
                    product_image = meta["product_image"]

                for alt_img in meta.get("alternate_images", []):
                    if alt_img not in alternate_images and alt_img != product_image:
                        alternate_images.append(alt_img)

                if meta.get("specification_sheet") and not spec_sheet_url:
                    spec_sheet_url = meta["specification_sheet"]

                if meta.get("manual") and not manual_url:
                    manual_url = meta["manual"]

                if meta.get("text"):
                    documents.append({
                        "source": urlparse(url).netloc or "web_page",
                        "page": 1,
                        "text": meta["text"],
                        "source_url": url,
                        "product_id": mpn
                    })

            except requests.Timeout:
                print(f"[WebLoader] Timeout fetching: {url}")
                continue
            except requests.RequestException as e:
                print(f"[WebLoader] Request failed: {url} - {str(e)}")
                continue
            except Exception as e:
                print(f"[WebLoader] Generic parsing error: {url} - {str(e)}")
                continue

        # If PDFs were discovered and downloading is enabled, fetch them
        if download_pdfs:
            for pdf_link in [spec_sheet_url, manual_url]:
                if pdf_link and pdf_link.startswith(("http://", "https://")):
                    pdf_docs = self.download_and_extract_pdf(
                        pdf_link,
                        product_id=mpn,
                        source_name=os.path.basename(urlparse(pdf_link).path)
                    )
                    documents.extend(pdf_docs)

        return {
            "mfr_url": mfr_url,
            "ref_urls": ref_urls[:5],
            "product_image": product_image,
            "alternate_images": alternate_images[:4],
            "specification_sheet": spec_sheet_url,
            "manual": manual_url,
            "documents": documents
        }
