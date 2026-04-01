from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import schemas
import models
from dependencies import verify_api_key

router = APIRouter()

@router.get("", response_model=schemas.AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    consumer: models.Consumer = Depends(verify_api_key)
):
    total_products = db.query(models.Product).count()
    
    source_stats = db.query(
        models.Product.source, 
        func.count(models.Product.id).label("total")
    ).group_by(models.Product.source).all()
    
    by_source = [
        schemas.SourceAnalytics(source=s[0] or "Unknown", total_products=s[1])
        for s in source_stats
    ]
    
    category_stats = db.query(
        models.Product.category,
        func.avg(models.Product.latest_price).label("avg_price")
    ).group_by(models.Product.category).all()
    
    by_category = [
        schemas.CategoryAnalytics(category=c[0] or "Uncategorized", average_price=c[1] or 0.0)
        for c in category_stats
    ]
    
    return schemas.AnalyticsResponse(
        total_products=total_products,
        by_source=by_source,
        by_category=by_category
    )
