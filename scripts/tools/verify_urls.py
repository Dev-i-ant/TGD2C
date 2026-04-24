import hashlib
import requests

items = [
    "Cosmetic_icon_Demon_Eater.png",
    "Cosmetic_icon_Feast_of_Abscession.png",
    "Cosmetic_icon_Guise_of_the_Winged_Bolt.png",
    "Cosmetic_icon_Empire_of_the_Pacifier.png",
    "Cosmetic_icon_Perception_of_the_First_Light.png",
    "Cosmetic_icon_Armor_of_the_Burning_Coalition.png",
    "Cosmetic_icon_Regalia_of_the_Crystalline_Queen.png",
    "Cosmetic_icon_The_Mourning_Mother.png",
    "Cosmetic_icon_Blessing_of_the_Crested_Dawn.png",
    "Cosmetic_icon_Jewels_of_the_Brine.png",
    "Cosmetic_icon_Stinger_of_the_Scorpion.png",
    "Cosmetic_icon_The_Spellbinder%27s_Shape_Set.png"
]

def get_liquipedia_url(filename):
    # Decode URL encoded filename for hashing
    decoded_name = filename.replace("%27", "'")
    m = hashlib.md5(decoded_name.encode('utf-8')).hexdigest()
    return f"https://liquipedia.net/commons/images/{m[0]}/{m[0:2]}/{filename}"

for item in items:
    url = get_liquipedia_url(item)
    try:
        r = requests.head(url, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200:
            print(f"[OK] {item} -> {url}")
        else:
            print(f"[FAIL] {item} (Status {r.status_code}) -> {url}")
    except Exception as e:
        print(f"[ERROR] {item}: {e}")
