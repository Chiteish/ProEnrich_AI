from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():

    response = client.get(
        "/health"
    )

    assert response.status_code == 200

    assert response.json()["status"] == "ok"


def test_process_product():

    payload = {
        "mfg_part_num":
            "DCB518ASTS06G",

        "part_desc":
            "DCB518ASTS06G Diablo 1/2 x 18 - Sanding Belt 6pc",

        "e1_brand":
            "-- Unbranded --",

        "unilog_brand":
            "-- No Unilog Brand --",

        "dib_brand":
            "-- No DIB Brand --",

        "part_manuf":
            "Freud Inc (2435)"
    }

    response = client.post(
        "/ai/process-product",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()

    assert data["product_id"] == \
        "DCB518ASTS06G"

    assert "identity" in data

    assert "understanding" in data