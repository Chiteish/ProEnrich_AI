import os

try:
    import pymupdf
except ImportError:
    import fitz as pymupdf


def extract_pdf_text(file_path: str):
    if not file_path or not os.path.exists(file_path):
        return []

    try:
        with pymupdf.open(file_path) as document:
            pages = []

            for page_number, page in enumerate(document):
                text = page.get_text("text")

                if text and text.strip():
                    pages.append({
                        "page": page_number + 1,
                        "text": text
                    })

            return pages
    except Exception:
        return []
    