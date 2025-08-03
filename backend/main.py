from fastapi import FastAPI, Query
from scraper.daraz import scrape_daraz
from services.aggregator import aggregate_products
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Allow requests only from these origins
    allow_credentials=True,       # Allow cookies, authorization headers, etc.
    allow_methods=["*"],          # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],          # Allow all headers
)


@app.get("/search")
async def search_products(q: str = Query(..., description="Search query")):
    products = await aggregate_products(q)
    return {"results": sorted(products, key=lambda x: x["price"])}
