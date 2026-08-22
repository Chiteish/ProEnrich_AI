from fastapi.testclient import TestClient

from app import main


class FakeRetriever:

    def retrieve(self, query, top_k, distance_threshold):
        if "UNKNOWN999" in query:
            return []

        return [{
            "text": "Product ABC123 has a rated voltage of 415 V AC.",
            "product_id": "ABC123",
            "source": "ABC123.pdf",
            "source_url": "https://example.test/ABC123.pdf",
            "page": 1,
            "distance": 0.1,
            "rank": 1
        }]


def test_query_endpoint_returns_grounded_answer(monkeypatch):
    monkeypatch.setattr(main, "retriever", FakeRetriever())
    client = TestClient(main.app)

    response = client.post("/query", json={
        "query": "What is the voltage of ABC123?"
    })

    body = response.json()
    assert response.status_code == 200
    assert body["status"] == "FOUND"
    assert body["query_type"] == "attribute"
    assert body["evidence"][0]["source_url"] == "https://example.test/ABC123.pdf"


def test_query_endpoint_rejects_missing_information(monkeypatch):
    monkeypatch.setattr(main, "retriever", FakeRetriever())
    client = TestClient(main.app)

    response = client.post("/query", json={
        "query": "What is the voltage of UNKNOWN999?"
    })

    assert response.status_code == 200
    assert response.json()["status"] == "NOT_FOUND"
    assert response.json()["answer"] is None


def test_health_endpoint():
    client = TestClient(main.app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"