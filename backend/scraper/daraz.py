from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

def scrape_daraz(query: str):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=options)

    search_url = f"https://www.daraz.lk/catalog/?q={query.replace(' ', '+')}"
    print("URL:", search_url)
    driver.get(search_url)
    time.sleep(5)  # wait for JS to load

    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    products = []
    cards = soup.select("div[data-qa-locator='product-item']")

    for card in cards:
        try:
            # Title
            title_tag = card.select_one("div.RfADt a")
            title = title_tag.get("title", "").strip()

            # Price
            price_tag = card.select_one("div.aBrP0 span")
            price = price_tag.text.strip() if price_tag else "No Price"

            # Product Link
            link_tag = card.select_one("a")
            href = link_tag.get("href", "")
            link = "https:" + href if href.startswith("//") else href

            # Image URL
            image_tag = card.select_one("img")
            image = image_tag.get("src", "") if image_tag else ""

            products.append({
                "title": title,
                "price": price,
                "link": link,
                "image": image,
                "source": "Daraz"
            })

        except Exception as e:
            print("Error:", e)
            continue

    return products
