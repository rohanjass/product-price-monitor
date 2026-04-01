from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PriceHistoryBase(BaseModel):
    price: float
    timestamp: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    latest_price: Optional[float] = None
    source: Optional[str] = None
    image_url: Optional[str] = None
    condition: Optional[str] = None
    unique_product_key: str

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    price_history: List[PriceHistoryBase] = []

    class Config:
        from_attributes = True

class SourceAnalytics(BaseModel):
    source: str
    total_products: int

class CategoryAnalytics(BaseModel):
    category: str
    average_price: float

class AnalyticsResponse(BaseModel):
    total_products: int
    by_source: List[SourceAnalytics]
    by_category: List[CategoryAnalytics]
