from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

def scrape_ebay(query: str):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)
    url = f"https://www.ebay.com/sch/i.html?_nkw={query.replace(' ', '+')}"
    driver.get(url)
    time.sleep(5)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    products = []
    cards = soup.select("li.s-card")
    for card in cards:
        try:
            # Title inside su-styled-text inside su-link
            title_tag = card.select_one("div.s-card__title span.su-styled-text")
            title = title_tag.get_text(strip=True) if title_tag else "No Title"

            # Price from .s-card__price
            price_tag = card.select_one("span.s-card__price")
            price = price_tag.get_text(strip=True) if price_tag else "No Price"

            # Link from anchor wrapping the title
            link_tag = card.select_one("div.s-card__title a")
            link = link_tag.get("href", "") if link_tag else ""

            # Image from img inside su-media__image
            image_tag = card.select_one("div.su-media__image a img")
            image = image_tag.get("src", "") if image_tag else ""

            products.append({
                "title": title,
                "price": price,
                "link": link,
                "image": image,
                "source": "eBay"
            })
        except Exception as e:
            print("eBay parsing error:", e)
            continue

    return products
