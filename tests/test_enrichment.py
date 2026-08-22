import unittest.mock as mock
from fastapi.testclient import TestClient
import pytest

from app.enrichment.enrichment_agent import EnrichmentAgent
from app import main


def test_enrichment_agent_multi_dimensional():
    agent = EnrichmentAgent()

    # Format 1: H x W x D with explicit labels
    text1 = "Dimensions: 33-7/16 in H x 23-7/8 in W x 22-5/8 in D"
    attrs1 = agent.extract_structured_attributes([text1])
    assert attrs1["HEIGHT"] == "33-7/16 in"
    assert attrs1["WIDTH"] == "23-7/8 in"
    assert attrs1["LENGTH"] == "22-5/8 in"

    # Format 2: W x D
    text2 = "Size: 24 in W x 24-1/4 in D"
    attrs2 = agent.extract_structured_attributes([text2])
    assert attrs2["WIDTH"] == "24 in"
    assert attrs2["LENGTH"] == "24-1/4 in"

    # Format 3: L x W x H in mm
    text3 = "Dimensions: 500 x 300 x 120 mm"
    attrs3 = agent.extract_structured_attributes([text3])
    assert attrs3["LENGTH"] == "500 mm"
    assert attrs3["WIDTH"] == "300 mm"
    assert attrs3["HEIGHT"] == "120 mm"

    # Format 4: Quotes format: 24"W x 24.25"D x 34"H
    text4 = 'Product size: 24"W x 24.25"D x 34"H'
    attrs4 = agent.extract_structured_attributes([text4])
    assert attrs4["WIDTH"] == "24 in"
    assert attrs4["LENGTH"] == "24.25 in"
    assert attrs4["HEIGHT"] == "34 in"


def test_enrichment_agent_weights_and_volumes():
    agent = EnrichmentAgent()

    text = "Product details: Weight: 85 lbs, Volume: 1.2 cu ft"
    attrs = agent.extract_structured_attributes([text])
    assert attrs["WEIGHT"] == "85 lbs"
    assert attrs["VOLUME"] == "1.2 cu ft"


def test_enrichment_agent_barcodes_and_identifiers():
    agent = EnrichmentAgent()

    text = "UPC: 012345678905 | GTIN-14: 10012345678902 | UNSPSC: 39121601"
    attrs = agent.extract_structured_attributes([text])
    assert attrs["UPC"] == "012345678905"
    assert attrs["GTIN"] == "10012345678902"
    assert attrs["UNSPSC"] == "39121601"


def test_enrichment_agent_no_hallucination():
    agent = EnrichmentAgent()

    # Text contains only basic description, nothing about dimensions or codes
    text = "Circuit breaker designed for industrial electrical panels."
    attrs = agent.extract_structured_attributes([text])

    for key, val in attrs.items():
        assert val is None, f"Expected {key} to be None, got {val}"


def test_enrichment_agent_backward_compatibility():
    agent = EnrichmentAgent()

    retrieved_chunks = [
        {"text": "Rated voltage: 415 V AC", "distance": 0.2}
    ]

    result = agent.enrich(
        product={"mpn": "ABC123"},
        attribute="voltage",
        retrieved_chunks=retrieved_chunks
    )

    assert result["status"] == "FOUND"
    assert "415 V AC" in result["value"]
    assert result["confidence"] > 0.0

    # Test empty chunks
    empty_result = agent.enrich(
        product={"mpn": "ABC123"},
        attribute="voltage",
        retrieved_chunks=[]
    )
    assert empty_result["status"] == "NOT_FOUND"
    assert empty_result["value"] is None


class MockRetriever:
    def retrieve(self, query, top_k, distance_threshold):
        if "UNKNOWN" in query:
            return []
        return [{
            "text": "PDSH4816AF Dishwasher: 33-7/16 in H x 23-7/8 in W x 22-5/8 in D. Weight: 85 lbs. UPC: 012345678905",
            "product_id": "PDSH4816AF",
            "source": "PDSH4816AF.csv",
            "source_url": "https://www.frigidaire.com/pdsh4816af",
            "page": 1,
            "distance": 0.05,
            "rank": 1
        }]


class MockWebLoader:
    def discover_and_load(self, mpn, manufacturer, description="", candidate_urls=None, download_pdfs=True):
        if "UNKNOWN" in mpn:
            return {
                "mfr_url": None,
                "ref_urls": [],
                "product_image": None,
                "alternate_images": [],
                "specification_sheet": None,
                "manual": None,
                "documents": []
            }

        return {
            "mfr_url": "https://www.frigidaire.com/pdsh4816af",
            "ref_urls": [
                "https://www.homedepot.com/p/PDSH4816AF",
                "https://www.lowes.com/pd/PDSH4816AF"
            ],
            "product_image": "https://www.frigidaire.com/images/hero.jpg",
            "alternate_images": [
                "https://www.frigidaire.com/images/alt1.jpg",
                "https://www.frigidaire.com/images/alt2.jpg"
            ],
            "specification_sheet": "https://www.frigidaire.com/specs/spec.pdf",
            "manual": "https://www.frigidaire.com/manuals/user_manual.pdf",
            "documents": [
                {
                    "source": "spec.pdf",
                    "page": 1,
                    "text": "Volume: 1.5 cu ft. UNSPSC: 39121601",
                    "source_url": "https://www.frigidaire.com/specs/spec.pdf",
                    "product_id": mpn
                }
            ]
        }


def test_api_enrich_endpoint(monkeypatch):
    monkeypatch.setattr(main, "retriever", MockRetriever())
    monkeypatch.setattr(main, "web_loader", MockWebLoader())

    client = TestClient(main.app)

    payload = {
        "mpn": "PDSH4816AF",
        "manufacturer": "Frigidaire",
        "description": "Built-in Dishwasher",
        "missing_attributes": ["HEIGHT", "WIDTH", "LENGTH", "WEIGHT", "VOLUME", "UPC", "UNSPSC"]
    }

    response = client.post("/enrich", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "FOUND"
    assert data["product"]["mpn"] == "PDSH4816AF"
    assert len(data["retrieved_evidence"]) > 0

    # Check structured attributes
    attrs = data["structured_attributes"]
    assert attrs["HEIGHT"] == "33-7/16 in"
    assert attrs["WIDTH"] == "23-7/8 in"
    assert attrs["LENGTH"] == "22-5/8 in"
    assert attrs["WEIGHT"] == "85 lbs"
    assert attrs["VOLUME"] == "1.5 cu ft"
    assert attrs["UPC"] == "012345678905"
    assert attrs["UNSPSC"] == "39121601"

    # Check web discovery
    web = data["web_discovery"]
    assert web["mfr_url"] == "https://www.frigidaire.com/pdsh4816af"
    assert len(web["ref_urls"]) == 2
    assert web["product_image"] == "https://www.frigidaire.com/images/hero.jpg"
    assert len(web["alternate_images"]) == 2
    assert web["specification_sheet"] == "https://www.frigidaire.com/specs/spec.pdf"
    assert web["manual"] == "https://www.frigidaire.com/manuals/user_manual.pdf"


def test_api_enrich_endpoint_not_found(monkeypatch):
    monkeypatch.setattr(main, "retriever", MockRetriever())
    monkeypatch.setattr(main, "web_loader", MockWebLoader())

    client = TestClient(main.app)

    payload = {
        "mpn": "UNKNOWN999",
        "manufacturer": "Unknown Brand",
        "description": "Nonexistent item",
        "missing_attributes": ["HEIGHT", "WIDTH", "LENGTH", "WEIGHT", "VOLUME", "UPC", "GTIN", "UNSPSC"]
    }

    response = client.post("/enrich", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "NOT_FOUND"
    assert len(data["retrieved_evidence"]) == 0
    assert data["web_discovery"]["mfr_url"] is None
    assert data["web_discovery"]["ref_urls"] == []
    assert data["web_discovery"]["product_image"] is None
    assert data["web_discovery"]["alternate_images"] == []
    assert data["web_discovery"]["specification_sheet"] is None
    assert data["web_discovery"]["manual"] is None

    for k, v in data["structured_attributes"].items():
        assert v is None


def test_enrichment_more_dimensions():
    agent = EnrichmentAgent()

    # Test optional dots in units
    text_dot = "Dimensions: 24 in. W x 24-1/4 in. D"
    attrs = agent.extract_structured_attributes([text_dot])
    assert attrs["WIDTH"] == "24 in"
    assert attrs["LENGTH"] == "24-1/4 in"
    assert attrs["HEIGHT"] is None

    # Test weight / volume variants
    text_wv = "Weight: 38.5 kg | Volume: 20 L"
    attrs_wv = agent.extract_structured_attributes([text_wv])
    assert attrs_wv["WEIGHT"] == "38.5 kg"
    assert attrs_wv["VOLUME"] == "20 L"


def test_enrichment_placeholder_filtering():
    agent = EnrichmentAgent()

    # Test placeholder brand values and other strings are cleaned
    text = "WIDTH: -- No DIB Brand -- | LENGTH: -- Unbranded -- | HEIGHT: -- No Unilog Brand --"
    attrs = agent.extract_structured_attributes([text])
    assert attrs["WIDTH"] is None
    assert attrs["LENGTH"] is None
    assert attrs["HEIGHT"] is None


class MockTimeoutWebLoader:
    def discover_and_load(self, mpn, manufacturer, description="", candidate_urls=None, download_pdfs=True):
        # Emulate timeout/failure by returning empty discoveries
        return {
            "mfr_url": None,
            "ref_urls": [],
            "product_image": None,
            "alternate_images": [],
            "specification_sheet": None,
            "manual": None,
            "documents": []
        }


class MockRAGOnlyRetriever:
    def retrieve(self, query, top_k, distance_threshold):
        return [{
            "text": "MFR URL: https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF | Product Image: FRIGIDAIRE_PDSH4816AF.jpg | Specification Sheet: FRIGIDAIRE_PDSH4816AF_Specification_Sheet.pdf | LENGTH: 24-1/4 in | WIDTH: 24 in",
            "product_id": "PDSH4816AF",
            "source": "Unihack_ Sample Dataset - Input.csv",
            "source_url": "https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF",
            "page": 1,
            "distance": 0.05,
            "rank": 1
        }]


def test_regression_live_web_discovery_failure_preserves_rag(monkeypatch):
    monkeypatch.setattr(main, "retriever", MockRAGOnlyRetriever())
    monkeypatch.setattr(main, "web_loader", MockTimeoutWebLoader())

    client = TestClient(main.app)

    payload = {
        "mpn": "PDSH4816AF",
        "manufacturer": "Frigidaire",
        "description": "Built-in Dishwasher",
        "missing_attributes": ["HEIGHT", "WIDTH", "LENGTH", "WEIGHT", "VOLUME", "UPC", "UNSPSC"]
    }

    response = client.post("/enrich", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Even if web discovery fails, status should still be FOUND because RAG has evidence
    assert data["status"] == "FOUND"
    
    # Check that structured attributes are derived from RAG evidence
    attrs = data["structured_attributes"]
    assert attrs["WIDTH"] == "24 in"
    assert attrs["LENGTH"] == "24-1/4 in"
    assert attrs["HEIGHT"] is None  # Not in evidence

    # Check that web discovery falls back to RAG evidence
    web = data["web_discovery"]
    assert web["mfr_url"] == "https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF"
    assert web["product_image"] == "FRIGIDAIRE_PDSH4816AF.jpg"
    assert web["specification_sheet"] == "FRIGIDAIRE_PDSH4816AF_Specification_Sheet.pdf"

