from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

def scrape_flipkart(query: str):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)

    search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '+')}"
    print("🔍 Searching:", search_url)
    driver.get(search_url)
    time.sleep(5)  # wait for JS content to load

    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    products = []

    # Product containers can vary slightly depending on category, so we'll try both major ones
    cards = soup.select("div._1AtVbE")  # Outer containers
    print(f"🛒 Found {len(cards)} cards")

    for card in cards:
        try:
            title_tag = card.select_one("div._4rR01T") or card.select_one("a.s1Q9rs")
            title = title_tag.text.strip() if title_tag else "No Title"

            price_tag = card.select_one("div._30jeq3")
            price = price_tag.text.strip() if price_tag else "No Price"

            link_tag = card.select_one("a._1fQZEK") or card.select_one("a.s1Q9rs")
            href = link_tag.get("href", "") if link_tag else ""
            link = "https://www.flipkart.com" + href if href.startswith("/") else href

            image_tag = card.select_one("img._396cs4") or card.select_one("img._2r_T1I")
            image = image_tag.get("src", "") if image_tag else ""

            if title != "No Title" and price != "No Price":
                products.append({
                    "title": title,
                    "price": price,
                    "link": link,
                    "image": image,
                    "source": "Flipkart"
                })

        except Exception as e:
            print("❌ Error parsing product:", e)
            continue

    return products
