from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from database import engine, Base, get_db
from routes.products import router as products_router
from routes.analytics import router as analytics_router
from services import product_service
import models
from dependencies import verify_api_key

app = FastAPI(
    title="Product Price Monitor API",
    description="API for accessing product data using SQLite",
    version="1.0.0"
)

# Exception handler for bad input
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": "Bad Input", "errors": exc.errors()},
    )

# Create database tables
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])

@app.on_event("startup")
def on_startup():
    print("Running startup events...")
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Guarantee default consumer exists for testing
        default_key = "dev-secret-key"
        if not db.query(models.Consumer).filter(models.Consumer.api_key == default_key).first():
            db.add(models.Consumer(api_key=default_key))
            db.commit()
            print("Default consumer dev-secret-key created.")

        success = product_service.load_data_from_json(db)
        if success:
            print("Initial data loaded successfully.")
    except Exception as e:
        print(f"Startup error: {e}")
    finally:
        db.close()

@app.post("/refresh")
def refresh_data(db: Session = Depends(get_db), consumer: models.Consumer = Depends(verify_api_key)):
    """Reload data from combined.json into database"""
    success = product_service.load_data_from_json(db)
    if success:
        return {"status": "success", "message": "Data reloaded mapping into database successfully"}
    raise HTTPException(status_code=500, detail="Failed to reload data")

@app.get("/")
def root():
    return {"message": "Welcome to the Product Price Monitor Backend (SQLite)!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    
