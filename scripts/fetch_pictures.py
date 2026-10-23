#!/usr/bin/env python3
"""Downloads each word's picture from the lead photo of its Wikipedia article,
shrinks it to a small JPEG (never cropped), and records who made it and its license (a
credits page is needed for CC BY / CC BY-SA photos).
Usage: fetch_wiki.py OUT_DIR [slug ...]"""
import html, io, json, re, sys, time
import urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "DysCoverApp/1.0 (educational reading game for children; contact: gunitkaur006@gmail.com)"}
API = "https://en.wikipedia.org/w/api.php"

# slug -> Wikipedia article title
PICS = {
    "cat": "Cat", "dog": "Dog", "pig": "Pig", "frog": "Frog", "crab": "Crab", "duck": "Duck", "fox": "Red fox",
    "fish": "Fish", "bird": "Bird", "lion": "Lion", "clam": "Clam", "elephant": "Elephant", "wildlife": "Giraffe",
    "tiger": "Tiger", "rabbit": "Rabbit", "monkey": "Monkey", "puppy": "Puppy", "butterfly": "Butterfly",
    "dinosaur": "Tyrannosaurus", "kangaroo": "Kangaroo", "alligator": "American alligator", "caterpillar": "Caterpillar",
    "parrot": "Parrot", "panda": "Giant panda", "otter": "Otter", "goldfish": "Goldfish",
    "candy": "Candy", "pizza": "Pizza", "banana": "Banana", "tomato": "Tomato", "hamburger": "Hamburger",
    "watermelon": "Watermelon", "pineapple": "Pineapple", "dessert": "Dessert", "muffin": "Muffin", "plum": "Plum",
    "pencil": "Pencil", "basket": "Basket", "robot": "Robot", "computer": "Laptop", "umbrella": "Umbrella",
    "telephone": "Telephone", "helicopter": "Helicopter", "microscope": "Microscope", "astronaut": "Astronaut",
    "bicycle": "Bicycle", "skateboard": "Skateboard", "hat": "Cowboy hat", "cup": "Mug", "pen": "Pen", "bed": "Bed",
    "bag": "Bag", "map": "Map", "lamp": "Electric light", "clock": "Clock", "stone": "Pebble", "rocket": "Rocket",
    "castle": "Castle", "bridge": "Bridge", "bench": "Bench (furniture)", "store": "Shopping", "saw": "Saw",
    "cut": "Scissors", "stamp": "Postage stamp", "fabric": "Textile", "mitten": "Mitten", "button": "Button",
    "picnic": "Picnic basket", "treasure": "Treasure", "explore": "Compass", "discover": "Magnifying glass",
    "angle": "Protractor", "stationery": "Stationery", "crystal": "Crystal", "contest": "Trophy", "dig": "Shovel",
    "drip": "Drop (liquid)", "step": "Stairs", "play": "Playground", "challenge": "Rock climbing",
    "tree": "Tree", "forest": "Forest", "river": "River", "beach": "Beach", "desert": "Desert", "sun": "Sun",
    "sunset": "Sunset", "world": "Earth", "planet": "Planet", "garden": "Garden", "winter": "Winter", "jungle": "Jungle",
    "mountain": "Mountain", "volcano": "Volcano", "flower": "Flower", "trail": "Hiking", "vines": "Liana",
    "climb": "Mountaineering", "rain": "Drizzle", "mist": "Cloud forest", "sunshine": "Sunbeam", "rainforest": "Rainforest",
    "silver": "Silver", "angel": "Angel", "trunk": "Tree",
    "lizard": "Lizard", "cheetah": "Cheetah", "emerald": "Emerald", "citrine": "Citrine",
    "ruby": "Ruby", "sapphire": "Sapphire", "amethyst": "Amethyst", "topaz": "Topaz", "diamond": "Diamond", "opal": "Opal",
}

only = set(sys.argv[2:])
credits_path = OUT / "credits.json"
credits = json.loads(credits_path.read_text()) if credits_path.exists() else {}


def api(**params):
    q = urllib.parse.urlencode({"format": "json", "formatversion": 2, **params})
    req = urllib.request.Request(f"{API}?{q}", headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read())


def plain(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


for slug, title in PICS.items():
    if only and slug not in only:
        continue
    dest = OUT / f"{slug}.jpg"
    if dest.exists() and slug in credits:
        continue
    try:
        page = api(action="query", titles=title, prop="pageimages", piprop="name", redirects=1)["query"]["pages"][0]
        fname = page.get("pageimage")
        if not fname:
            print(slug, "no lead image", flush=True)
            continue
        info = api(action="query", titles=f"File:{fname}", prop="imageinfo", iiprop="url|extmetadata|mime", iiurlwidth=500)["query"]["pages"][0]["imageinfo"][0]
        if not info.get("mime", "").startswith("image/jpeg") and not info.get("mime", "").startswith("image/png"):
            print(slug, "not a photo:", info.get("mime"), flush=True)
            continue
        meta = info["extmetadata"]
        req = urllib.request.Request(info["thumburl"], headers=UA)
        img = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB")
    except Exception as e:
        print(slug, "failed:", str(e)[:70], flush=True)
        time.sleep(4)
        continue
    # keep the WHOLE photo (no cropping), just make it small: longest side 360px
    img.thumbnail((360, 360), Image.LANCZOS)
    img.save(dest, "JPEG", quality=74, optimize=True)
    credits[slug] = {
        "article": title,
        "file": fname,
        "artist": plain(meta.get("Artist", {}).get("value")) or "Wikimedia Commons contributor",
        "license": plain(meta.get("LicenseShortName", {}).get("value")) or "see source",
        "source": info.get("descriptionurl"),
    }
    credits_path.write_text(json.dumps(credits, indent=1))
    print("ok", slug, "|", fname[:40], "|", credits[slug]["license"], flush=True)
    time.sleep(0.6)
print("done", len(list(OUT.glob("*.jpg"))), "pictures")
