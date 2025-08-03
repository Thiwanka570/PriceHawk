# aggregator.py
from scraper.daraz import scrape_daraz
from scraper.ebay import scrape_ebay
from scraper.amazon import scrape_amazon

async def aggregate_products(query: str):
    all_products = []
    
    try:
        all_products.extend(scrape_daraz(query))
    except Exception as e:
        print("Error scraping Daraz:", e)
    
    try:
        all_products.extend(scrape_ebay(query))
    except Exception as e:
        print("Error scraping eBay:", e)
        
    try:
        all_products.extend(scrape_amazon(query))
    except Exception as e:
        print("Error scraping Amazon:", e)
    
    return all_products
