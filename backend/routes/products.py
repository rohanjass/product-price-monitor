from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import schemas
from services import product_service
from dependencies import verify_api_key

router = APIRouter()

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search by product name"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    db: Session = Depends(get_db),
    consumer = Depends(verify_api_key)
):
    try:
        products = product_service.get_all_products(
            db=db, search=search, brand=brand, min_price=min_price, max_price=max_price
        )
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", response_model=schemas.ProductDetailResponse)
def get_product(
    product_id: int, 
    db: Session = Depends(get_db),
    consumer = Depends(verify_api_key)
):
    product = product_service.get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
