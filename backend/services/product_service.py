import json
import os
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
import models

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_FILE_PATH = os.path.join(BASE_DIR, "data", "combined.json")

def load_data_from_json(db: Session):
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Data file not found at {DATA_FILE_PATH}")
        return False
    
    try:
        with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for item in data:
            unique_key = item.get("product_id") or item.get("id") or item.get("product_url")
            if not unique_key:
                continue
                
            price_val = item.get("price")
            if price_val is not None:
                try:
                    price_val = float(price_val)
                except ValueError:
                    price_val = 0.0
            else:
                price_val = 0.0
                
            image = ""
            if isinstance(item.get("main_images"), list) and len(item.get("main_images")) > 0:
                image_obj = item["main_images"][0]
                image = image_obj.get("url", "") if isinstance(image_obj, dict) else str(image_obj)
            elif isinstance(item.get("images"), list) and len(item.get("images")) > 0:
                image_obj = item["images"][0]
                image = image_obj.get("url", "") if isinstance(image_obj, dict) else str(image_obj)
            
            condition = item.get("condition", "")
            if not condition and item.get("metadata"):
                condition = item["metadata"].get("condition") or item["metadata"].get("condition_display") or item["metadata"].get("item_condition", "Not specified")

            product = db.query(models.Product).filter(models.Product.unique_product_key == str(unique_key)).first()
            
            if product:
                # Update logic
                if product.latest_price != price_val:
                    product.latest_price = price_val
                    db.commit()
                    # Insert new price history
                    new_history = models.PriceHistory(product_id=product.id, price=price_val)
                    db.add(new_history)
                    db.commit()
            else:
                # Insert logic
                new_product = models.Product(
                    name=item.get("model", ""),
                    brand=item.get("brand", ""),
                    category=item.get("category", ""),
                    latest_price=price_val,
                    source=item.get("product_url", ""),
                    image_url=image,
                    condition=condition,
                    unique_product_key=str(unique_key)
                )
                db.add(new_product)
                db.commit()
                db.refresh(new_product)
                
                # Mock historical price points (10 days back)
                base_time = datetime.now(timezone.utc)
                for i in range(10, 0, -1):
                    factor = 1 + random.uniform(-0.15, 0.15)
                    hist_price = max(0.01, round(price_val * factor, 2))
                    hist_time = base_time - timedelta(days=i)
                    db.add(models.PriceHistory(product_id=new_product.id, price=hist_price, timestamp=hist_time))
                
                # Current price point
                db.add(models.PriceHistory(product_id=new_product.id, price=price_val, timestamp=base_time))
                db.commit()
        return True
    except Exception as e:
        print(f"Error loading product data into DB: {e}")
        db.rollback()
        return False

def get_all_products(db: Session, search: str = None, brand: str = None, min_price: float = None, max_price: float = None):
    query = db.query(models.Product)
    if search:
        search_lower = f"%{search.lower()}%"
        query = query.filter(models.Product.name.ilike(search_lower))
    if brand:
        query = query.filter(models.Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(models.Product.latest_price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.latest_price <= max_price)
    return query.all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()
