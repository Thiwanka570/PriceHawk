# scraper/amazon.py
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

def scrape_amazon(query: str):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=options)
    url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
    driver.get(url)
    time.sleep(5)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()
    
    products = []
    cards = soup.select("div.s-main-slot div.s-result-item")
    for card in cards:
        try:
            # Updated title selector
            title_tag = card.select_one("h2.a-size-medium")
            title = title_tag.text.strip() if title_tag else "No Title"
            
            price_whole = card.select_one("span.a-price-whole")
            price_frac = card.select_one("span.a-price-fraction")
            price = ""
            if price_whole:
                price = price_whole.text.strip()
                if price_frac:
                    price += price_frac.text.strip()
            if not price:
                price = "No Price"
                
            link_tag = card.select_one("a.a-link-normal.s-no-outline")
            link = "https://www.amazon.in" + link_tag.get("href", "") if link_tag else ""
            
            image_tag = card.select_one("img.s-image")
            image = image_tag.get("src", "") if image_tag else ""
            
            if title == "No Title":
                continue
            else:
                products.append({
                "title": title,
                "price": price,
                "link": link,
                "image": image,
                "source": "Amazon"
            })
        except Exception as e:
            print("Amazon error:", e)
            continue
    return products