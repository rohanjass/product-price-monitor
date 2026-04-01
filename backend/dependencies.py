from fastapi import Security, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from database import get_db
import models

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

def verify_api_key(
    api_key: str = Security(api_key_header),
    db: Session = Depends(get_db)
) -> models.Consumer:
    consumer = db.query(models.Consumer).filter(models.Consumer.api_key == api_key).first()
    if not consumer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    # Track usage per request
    consumer.request_count += 1
    db.commit()
    return consumer
