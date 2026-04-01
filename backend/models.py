from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    brand = Column(String, index=True)
    category = Column(String)
    latest_price = Column(Float)
    source = Column(String)
    image_url = Column(String)
    condition = Column(String)
    unique_product_key = Column(String, unique=True, index=True)

    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    price = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="price_history")

class Consumer(Base):
    __tablename__ = "consumers"

    id = Column(Integer, primary_key=True, index=True)
    api_key = Column(String, unique=True, index=True)
    request_count = Column(Integer, default=0)
