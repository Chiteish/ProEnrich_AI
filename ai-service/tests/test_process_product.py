from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_process_product_success():
    payload = {
        "mfg_part_num": "DCB518ASTS06G",
        "part_desc": "Diablo 1/2 in. x 18 in. Sanding Belt 6pc",
        "part_manuf": "Freud Inc",
        "e1_brand": "Diablo"
    }
    response = client.post("/ai/process-product", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == "DCB518ASTS06G"
    assert "missing_attributes" in data

# tests/test_process_product.py

def test_empty_description():
    response = client.post("/ai/process-product", json={"part_desc": ""})
    assert response.status_code in (400, 422)