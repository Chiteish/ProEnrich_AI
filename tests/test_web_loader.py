import io
import unittest.mock as mock
import pytest
import requests

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from app.ingestion.web_loader import WebLoader
from app.ingestion.document_loader import chunk_documents


def _create_mock_pdf_bytes(pages_text: list[str]) -> bytes:
    doc = fitz.open()
    for text in pages_text:
        page = doc.new_page()
        page.insert_text((50, 50), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


SAMPLE_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Frigidaire PDSH4816AF Dishwasher</title>
    <link rel="canonical" href="https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF">
    <meta property="og:image" content="https://www.frigidaire.com/images/PDSH4816AF_hero.jpg">
</head>
<body>
    <h1>Frigidaire Professional Series Dishwasher PDSH4816AF</h1>
    <div class="gallery">
        <img src="/images/PDSH4816AF_alt1.jpg" alt="Interior View">
        <img src="/images/PDSH4816AF_alt2.jpg" alt="Control Panel">
        <img src="/images/PDSH4816AF_alt3.jpg" alt="Rack Detail">
        <img src="/images/PDSH4816AF_alt4.jpg" alt="Open Door View">
        <img src="/images/icon_star.png" alt="Star Icon">
    </div>
    <div class="downloads">
        <a href="https://www.frigidaire.com/manuals/PDSH4816AF_user_manual.pdf">User Manual (PDF)</a>
        <a href="https://www.frigidaire.com/specs/PDSH4816AF_specification_sheet.pdf">Specification Sheet</a>
        <a href="https://www.homedepot.com/p/Frigidaire-PDSH4816AF/12345">View on Home Depot</a>
        <a href="https://www.lowes.com/pd/Frigidaire-PDSH4816AF/67890">View on Lowes</a>
        <a href="https://www.grainger.com/product/PDSH4816AF">View on Grainger</a>
    </div>
    <table>
        <tr><th>Voltage</th><td>120 V</td></tr>
        <tr><th>Amperage</th><td>15 A</td></tr>
        <tr><th>Dimensions</th><td>33-7/16 in H x 23-7/8 in W x 22-5/8 in D</td></tr>
    </table>
</body>
</html>
"""


def test_extract_product_metadata_from_html():
    loader = WebLoader()
    meta = loader.extract_product_metadata_from_html(
        html_content=SAMPLE_HTML,
        base_url="https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF",
        manufacturer="Frigidaire",
        mpn="PDSH4816AF"
    )

    assert meta["mfr_url"] == "https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF"
    assert meta["product_image"] == "https://www.frigidaire.com/images/PDSH4816AF_hero.jpg"
    assert len(meta["alternate_images"]) == 4
    assert "https://www.frigidaire.com/images/PDSH4816AF_alt1.jpg" in meta["alternate_images"]
    assert "https://www.frigidaire.com/images/icon_star.png" not in meta["alternate_images"]

    assert meta["specification_sheet"] == "https://www.frigidaire.com/specs/PDSH4816AF_specification_sheet.pdf"
    assert meta["manual"] == "https://www.frigidaire.com/manuals/PDSH4816AF_user_manual.pdf"

    assert len(meta["ref_urls"]) >= 3
    assert any("homedepot.com" in u for u in meta["ref_urls"])
    assert any("lowes.com" in u for u in meta["ref_urls"])
    assert any("grainger.com" in u for u in meta["ref_urls"])

    assert "33-7/16 in H x 23-7/8 in W x 22-5/8 in D" in meta["text"]


def test_download_and_extract_pdf_mocked():
    pdf_bytes = _create_mock_pdf_bytes([
        "Page 1: Frigidaire Dishwasher Model PDSH4816AF Specifications.",
        "Page 2: Electrical requirements: 120V AC, 15A. Dimensions: 24 in W x 24 in D."
    ])

    mock_response = mock.Mock()
    mock_response.status_code = 200
    mock_response.content = pdf_bytes
    mock_response.headers = {"Content-Type": "application/pdf"}

    mock_session = mock.Mock()
    mock_session.get.return_value = mock_response
    mock_session.headers = {}

    loader = WebLoader(session=mock_session)
    docs = loader.download_and_extract_pdf(
        pdf_url_or_path="https://example.com/docs/PDSH4816AF_spec.pdf",
        product_id="PDSH4816AF",
        source_name="PDSH4816AF_spec.pdf"
    )

    assert len(docs) == 2
    assert docs[0]["page"] == 1
    assert "Model PDSH4816AF" in docs[0]["text"]
    assert docs[0]["source"] == "PDSH4816AF_spec.pdf"
    assert docs[0]["source_url"] == "https://example.com/docs/PDSH4816AF_spec.pdf"
    assert docs[0]["product_id"] == "PDSH4816AF"

    assert docs[1]["page"] == 2
    assert "120V AC" in docs[1]["text"]

    # Verify chunking preserves metadata
    chunks = chunk_documents(docs, chunk_size=500, overlap=50)
    assert len(chunks) >= 2
    assert chunks[0]["product_id"] == "PDSH4816AF"
    assert chunks[0]["source_url"] == "https://example.com/docs/PDSH4816AF_spec.pdf"


def test_discover_and_load_end_to_end_mocked():
    pdf_bytes = _create_mock_pdf_bytes(["Spec Sheet: Rated 120V, Weight 85 lbs."])

    def mock_get_handler(url, *args, **kwargs):
        resp = mock.Mock()
        resp.status_code = 200
        if url.endswith(".pdf"):
            resp.content = pdf_bytes
            resp.headers = {"Content-Type": "application/pdf"}
            resp.text = ""
        else:
            resp.content = SAMPLE_HTML.encode("utf-8")
            resp.headers = {"Content-Type": "text/html"}
            resp.text = SAMPLE_HTML
        return resp

    mock_session = mock.Mock()
    mock_session.get.side_effect = mock_get_handler
    mock_session.headers = {}

    loader = WebLoader(session=mock_session)
    result = loader.discover_and_load(
        mpn="PDSH4816AF",
        manufacturer="Frigidaire",
        candidate_urls=["https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF"],
        download_pdfs=True
    )

    assert result["mfr_url"] == "https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF"
    assert result["product_image"] == "https://www.frigidaire.com/images/PDSH4816AF_hero.jpg"
    assert len(result["alternate_images"]) == 4
    assert result["specification_sheet"] == "https://www.frigidaire.com/specs/PDSH4816AF_specification_sheet.pdf"
    assert result["manual"] == "https://www.frigidaire.com/manuals/PDSH4816AF_user_manual.pdf"
    assert len(result["documents"]) > 0


def test_web_discovery_search_mocked():
    search_html = """
    <html>
        <body>
            <a class="result__url" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.frigidaire.com%2Fpdsh4816af&rut=1">Frigidaire PDSH4816AF</a>
            <a class="result__url" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.homedepot.com%2Fp%2FFrigidaire-PDSH4816AF&rut=2">Home Depot</a>
        </body>
    </html>
    """

    mock_response = mock.Mock()
    mock_response.status_code = 200
    mock_response.text = search_html

    mock_session = mock.Mock()
    mock_session.get.return_value = mock_response
    mock_session.headers = {}

    loader = WebLoader(session=mock_session)
    links = loader.search_product("PDSH4816AF", "Frigidaire")

    assert "https://www.frigidaire.com/pdsh4816af" in links
    assert "https://www.homedepot.com/p/Frigidaire-PDSH4816AF" in links


def test_web_loader_timeout():
    mock_session = mock.Mock()
    mock_session.get.side_effect = requests.Timeout("Connection timed out")
    mock_session.headers = {}

    loader = WebLoader(session=mock_session, timeout=2.0)
    
    # search_product should not crash
    links = loader.search_product("PDSH4816AF", "Frigidaire")
    assert links == []
    
    # discover_and_load should not crash and return empty dictionary structure
    res = loader.discover_and_load(
        mpn="PDSH4816AF",
        manufacturer="Frigidaire",
        candidate_urls=["https://www.frigidaire.com/timeout"]
    )
    assert res["mfr_url"] is None
    assert res["documents"] == []


def test_web_loader_http_errors():
    mock_session = mock.Mock()
    # Mocking status code responses like 403, 429, 500
    mock_resp_403 = mock.Mock()
    mock_resp_403.status_code = 403
    mock_session.get.return_value = mock_resp_403
    mock_session.headers = {}

    loader = WebLoader(session=mock_session)
    res = loader.discover_and_load(
        mpn="PDSH4816AF",
        manufacturer="Frigidaire",
        candidate_urls=["https://www.frigidaire.com/forbidden"]
    )
    assert res["mfr_url"] is None
    assert res["documents"] == []


def test_web_loader_search_failure():
    mock_session = mock.Mock()
    mock_resp = mock.Mock()
    mock_resp.status_code = 404
    mock_session.get.return_value = mock_resp
    mock_session.headers = {}

    loader = WebLoader(session=mock_session)
    links = loader.search_product("UNKNOWN", "UNKNOWN")
    assert links == []


def test_web_loader_candidate_priority():
    # Verify that search_product prioritizes official manufacturer URLs
    search_html = """
    <html>
        <body>
            <a class="result__url" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.grainger.com%2Fpdsh4816af">Grainger</a>
            <a class="result__url" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.frigidaire.com%2Fpdsh4816af">Frigidaire</a>
        </body>
    </html>
    """
    mock_session = mock.Mock()
    mock_resp = mock.Mock()
    mock_resp.status_code = 200
    mock_resp.text = search_html
    mock_session.get.return_value = mock_resp
    mock_session.headers = {}

    loader = WebLoader(session=mock_session)
    links = loader.search_product("PDSH4816AF", "Frigidaire")
    
    # Official manufacturer URL (frigidaire.com) must come first!
    assert links[0] == "https://www.frigidaire.com/pdsh4816af"
    assert links[1] == "https://www.grainger.com/pdsh4816af"


def test_web_loader_pdf_bytes_and_errors():
    loader = WebLoader()
    
    # Test valid bytes PDF extraction (using empty/mock PDF bytes)
    pdf_bytes = _create_mock_pdf_bytes(["Spec Sheet: Part number ABC"])
    docs = loader.download_and_extract_pdf(pdf_bytes, product_id="ABC", source_name="spec.pdf")
    assert len(docs) == 1
    assert docs[0]["product_id"] == "ABC"
    assert "Spec Sheet" in docs[0]["text"]

    # Test invalid bytes PDF error handling
    invalid_docs = loader.download_and_extract_pdf(b"invalid pdf data", product_id="ABC")
    assert invalid_docs == []


def test_web_loader_image_filtering():
    html_content = """
    <html>
        <body>
            <img src="https://example.com/logo.png" />
            <img src="https://example.com/sprite.png" />
            <img src="https://example.com/favicon.ico" />
            <img src="https://example.com/banner.jpg" />
            <img src="https://example.com/tracker.gif" />
            <img src="https://example.com/actual_product_image.jpg" />
        </body>
    </html>
    """
    loader = WebLoader()
    meta = loader.extract_product_metadata_from_html(
        html_content=html_content,
        base_url="https://example.com/product",
        manufacturer="Frigidaire",
        mpn="ABC"
    )
    
    assert meta["product_image"] == "https://example.com/actual_product_image.jpg"
    assert "logo.png" not in meta["alternate_images"]
    assert "favicon.ico" not in meta["alternate_images"]
    assert "banner.jpg" not in meta["alternate_images"]

