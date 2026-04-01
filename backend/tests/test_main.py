import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import Base, get_db
import models

# Use in-memory SQLite for testing to avoid touching real data
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

headers = {"X-API-Key": "test-secret-key"}

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # 1. Setup mock consumer key
    db.add(models.Consumer(api_key="test-secret-key"))
    
    # 2. Add some test products
    p1 = models.Product(
        name="Sony WH-1000XM5", 
        brand="Sony", 
        category="Electronics", 
        latest_price=348.0, 
        unique_product_key="sony_1"
    )
    p2 = models.Product(
        name="Apple iPhone 15", 
        brand="Apple", 
        category="Electronics", 
        latest_price=799.0, 
        unique_product_key="apple_1"
    )
    db.add(p1)
    db.add(p2)
    db.commit()

    # 3. Add fake history to test /products/:id endpoint
    db.add(models.PriceHistory(product_id=p1.id, price=348.0))
    db.add(models.PriceHistory(product_id=p2.id, price=799.0))
    db.commit()
    db.close()
    
    yield
    Base.metadata.drop_all(bind=engine)


# --- Tests Start Here ---

# 1. Test GET /products returns data
def test_get_products_returns_data():
    response = client.get("/products", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert any(item["name"] == "Sony WH-1000XM5" for item in data)

# 2. Test filtering by brand works
def test_filter_products_by_brand():
    response = client.get("/products?brand=Apple", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["brand"] == "Apple"

# 3. Test filtering by price range works
def test_filter_products_by_price_range():
    response = client.get("/products?min_price=150&max_price=500", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Sony WH-1000XM5"

# 4. Test product detail endpoint works
def test_get_product_detail():
    # Fetch first to get a valid ID
    products_response = client.get("/products?brand=Sony", headers=headers)
    product_id = products_response.json()[0]["id"]
    
    detail_response = client.get(f"/products/{product_id}", headers=headers)
    assert detail_response.status_code == 200
    detail_data = detail_response.json()
    assert detail_data["name"] == "Sony WH-1000XM5"
    assert "price_history" in detail_data
    assert len(detail_data["price_history"]) == 1

# 5. Edge Case: Test invalid product ID returns 404
def test_get_invalid_product_id():
    response = client.get("/products/999999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

# 6. Edge Case: Test empty dataset handling (search for string that returns nothing)
def test_empty_dataset_handling():
    response = client.get("/products?search=NonExistentProductXYZ", headers=headers)
    assert response.status_code == 200
    assert response.json() == []

# 7. Edge Case: Test missing query parameters handled correctly (it simply lists all)
def test_missing_query_parameters():
    response = client.get("/products", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# 8. Edge Case: Test invalid price filters (min > max) -> Should return empty or handle safely
def test_invalid_price_filters():
    response = client.get("/products?min_price=1000&max_price=10", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 0

# Extra: Test Missing or Invalid API Key
def test_invalid_api_key_returns_401():
    response = client.get("/products", headers={"X-API-Key": "wrong-key"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or missing API Key"
