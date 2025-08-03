import re

def normalize_product(title, price, link, image, source):
    # Convert Rs. 74,999 → 74999
    price_number = int(re.sub(r"[^\d]", "", price))
    return {
        "title": title,
        "price": price_number,
        "link": link,
        "image": image,
        "source": source
    }
