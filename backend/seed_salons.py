"""Seed Bangalore salon data for AURA.

Usage:
  python seed_salons.py

What it does:
  - Upserts 20-30 Bangalore salons by slug.
  - Enriches data from public APIs when available.
  - Generates 4-6 before/after photo pairs per salon.
  - Generates 3-5 staff profiles, services, amenities, tags, and Hinglish reviews.
  - Exports salons_seed.json for frontend mock/storybook usage.

The script is idempotent: rerunning it updates the same salons by slug.
"""

from __future__ import annotations

import json
import os
import random
import re
import sys
import textwrap
import uuid
from dataclasses import dataclass
from datetime import datetime
from html import unescape
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import parse_qs, urlparse

import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import SessionLocal, engine
from app.models.models import Base, Salon, Transformation, User

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dependency
    load_dotenv = None

if load_dotenv:
    load_dotenv(Path(__file__).with_name(".env"))

Base.metadata.create_all(bind=engine)


class SalonSeedRecord(Base):
    __tablename__ = "salon_seed_records"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id"), nullable=False, unique=True)
    salon_name = Column(String, nullable=False)
    area = Column(String, nullable=False)
    source = Column(String, nullable=False)
    payload_json = Column(Text, nullable=False)

    salon = relationship("Salon")


Base.metadata.create_all(bind=engine)

ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"
IMAGES_DIR = STATIC_DIR / "images"
EXPORT_PATH = ROOT / "salons_seed.json"

for directory in [STATIC_DIR, IMAGES_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

SEED_COUNT = 24
TARGET_BBOX = {
    "min_lat": 12.85,
    "min_lon": 77.45,
    "max_lat": 13.08,
    "max_lon": 77.78,
}

NEIGHBORHOODS = [
    {"name": "Koramangala", "lat": 12.9352, "lon": 77.6245},
    {"name": "Indiranagar", "lat": 12.9719, "lon": 77.6412},
    {"name": "HSR Layout", "lat": 12.9121, "lon": 77.6446},
    {"name": "Whitefield", "lat": 12.9698, "lon": 77.7500},
    {"name": "Jayanagar", "lat": 12.9308, "lon": 77.5838},
    {"name": "JP Nagar", "lat": 12.9082, "lon": 77.5855},
    {"name": "Malleshwaram", "lat": 13.0033, "lon": 77.5690},
    {"name": "Bannerghatta Road", "lat": 12.8738, "lon": 77.6035},
    {"name": "Hebbal", "lat": 13.0358, "lon": 77.5970},
    {"name": "Electronic City", "lat": 12.8458, "lon": 77.6603},
    {"name": "Marathahalli", "lat": 12.9592, "lon": 77.6974},
    {"name": "Basavanagudi", "lat": 12.9417, "lon": 77.5759},
]

SERVICE_POOL = [
    ("Haircut", (499, 1499), (30, 70)),
    ("Hair Color", (1999, 7999), (90, 180)),
    ("Balayage", (3999, 12999), (120, 210)),
    ("Keratin Treatment", (4999, 15999), (120, 240)),
    ("Hair Spa", (799, 2999), (30, 60)),
    ("Blowout", (699, 2299), (30, 45)),
    ("Bridal Styling", (3999, 17999), (120, 240)),
    ("Beard Trim", (199, 799), (15, 30)),
    ("Protein Treatment", (1499, 4999), (45, 90)),
    ("Smoothening", (3999, 13999), (120, 210)),
    ("Scalp Detox", (999, 2999), (30, 45)),
    ("Extensions", (5999, 24999), (150, 300)),
]

AMENITIES_POOL = [
    "Wi-Fi",
    "Air Conditioning",
    "Parking",
    "Wheelchair Access",
    "Women Staff",
    "Card Payments",
    "Private Styling Chairs",
    "Refreshments",
    "Kids Friendly",
    "Bridal Suite",
    "Air Purifier",
    "Sanitized Tools",
]

TAGS_POOL = [
    "premium",
    "budget-friendly",
    "family-friendly",
    "bridal",
    "curly-specialist",
    "color-expert",
    "unisex",
    "women-only",
    "walk-in",
    "appointment-only",
    "modern-interior",
    "vip-service",
]

REVIEW_NAMES = [
    "Aditi", "Nisha", "Pooja", "Rohan", "Kavya", "Sneha", "Arjun", "Maya",
    "Priyanka", "Rahul", "Shreya", "Vikram", "Isha", "Neha", "Tanvi", "Kiran",
]

HINGLISH_SNIPPETS = [
    "Bas full paisa vasool lag raha tha",
    "Mujhe service kaafi smooth lagi",
    "Stylist ne exact same vibe capture ki",
    "Thoda wait tha but result worth it tha",
    "Colour tone bahut natural aur clean aaya",
    "Staff bohot polite aur helpful tha",
    "Mujhe overall experience kaafi premium laga",
    "Yeh salon definitely repeat visit deserve karta hai",
    "Mere curls ka shape bohot achha nikla",
    "Blowdry ke baad look kaafi fresh lag raha tha",
]

SERVICE_DESCRIPTORS = {
    "Haircut": "sharp finish, face-framing layers, clean silhouette",
    "Hair Color": "rich tone correction, glossy color depth",
    "Balayage": "soft blended lightening with sun-kissed dimension",
    "Keratin Treatment": "frizz control with smooth reflective shine",
    "Hair Spa": "deep nourishment and scalp relaxation",
    "Blowout": "bouncy volume and polished movement",
    "Bridal Styling": "elegant long-wear styling for events",
    "Beard Trim": "clean, defined grooming and sharp edging",
    "Protein Treatment": "repair-focused strengthening and softness",
    "Smoothening": "sleek, manageable hair with reduced flyaways",
    "Scalp Detox": "refreshing scalp reset and product build-up removal",
    "Extensions": "added length and fullness with seamless blend",
}

SALON_WORDS = [
    "Atelier", "Studio", "Haus", "Glow", "Tress", "Mirror", "Canvas", "Nest",
    "Loom", "Craft", "Belle", "Mane", "Forma", "Aura", "Shear", "Salon",
]

SALON_SUFFIXES = ["Salon", "Studio", "Lab", "House", "Bar", "Collective", "Lounge"]

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OPENCAGE_URL = "https://api.opencagedata.com/geocode/v1/json"
GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
DUCKDUCKGO_URL = "https://html.duckduckgo.com/html/"


@dataclass
class StaffProfile:
    name: str
    role: str
    specialization: str
    experience_years: int
    avatar_url: str


@dataclass
class ServiceProfile:
    name: str
    price_inr: int
    duration_minutes: int
    description: str


@dataclass
class ReviewProfile:
    author: str
    avatar_url: str
    rating: int
    text: str
    created_at: str


@dataclass
class PhotoPairProfile:
    before_url: str
    after_url: str
    service_type: str
    caption: str


@dataclass
class SalonProfile:
    slug: str
    name: str
    tagline: str
    area: str
    city: str
    latitude: float
    longitude: float
    price_range: str
    opening_hours: dict[str, str]
    services: list[ServiceProfile]
    staff: list[StaffProfile]
    amenities: list[str]
    tags: list[str]
    reviews: list[ReviewProfile]
    photo_pairs: list[PhotoPairProfile]
    data_source: str
    description: str


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-")


def jitter_coordinate(value: float, rng: random.Random) -> float:
    return round(value + rng.uniform(-0.002, 0.002), 6)


def money_range(min_value: int, max_value: int) -> str:
    return f"₹{min_value:,}–₹{max_value:,}"


def safe_get_json(url: str, *, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None, timeout: int = 18) -> Any:
    try:
        response = requests.get(url, params=params, headers=headers or {}, timeout=timeout)
        response.raise_for_status()
        if "application/json" in response.headers.get("content-type", ""):
            return response.json()
        return response.text
    except Exception:
        return None


def safe_post_json(url: str, *, data: dict[str, Any] | None = None, headers: dict[str, str] | None = None, timeout: int = 25) -> Any:
    try:
        response = requests.post(url, data=data or {}, headers=headers or {}, timeout=timeout)
        response.raise_for_status()
        if "application/json" in response.headers.get("content-type", ""):
            return response.json()
        return response.text
    except Exception:
        return None


def parse_duckduckgo_redirect(href: str) -> str:
    parsed = urlparse(href)
    query = parse_qs(parsed.query)
    if parsed.path == "/l/" and query.get("uddg"):
        return unescape(query["uddg"][0])
    return href


def fetch_google_places(area_name: str, lat: float, lon: float) -> list[dict[str, Any]]:
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        return []
    params = {
        "location": f"{lat},{lon}",
        "radius": 1800,
        "keyword": f"hair salon {area_name}",
        "type": "beauty_salon",
        "key": api_key,
    }
    payload = safe_get_json(GOOGLE_PLACES_URL, params=params, timeout=20)
    if not isinstance(payload, dict):
        return []
    results = []
    for item in payload.get("results", [])[:12]:
        geometry = item.get("geometry", {}).get("location", {})
        results.append({
            "name": item.get("name"),
            "address": item.get("vicinity") or item.get("formatted_address"),
            "latitude": geometry.get("lat"),
            "longitude": geometry.get("lng"),
            "source": "google_places",
        })
    return results


def fetch_duckduckgo_salons(area_name: str) -> list[dict[str, Any]]:
    query = f"hair salon {area_name} Bangalore"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    payload = safe_get_json(DUCKDUCKGO_URL, params={"q": query}, headers=headers, timeout=20)
    if not isinstance(payload, str):
        return []

    results: list[dict[str, Any]] = []
    blocks = re.findall(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>(?:.*?<a class="result__snippet">(.*?)</a>)?', payload, flags=re.S)
    for href, title_html, snippet_html in blocks[:10]:
        title = re.sub(r"<.*?>", "", unescape(title_html)).strip()
        if not title:
            continue
        results.append({
            "name": title,
            "address": re.sub(r"<.*?>", "", unescape(snippet_html or "")).strip() or None,
            "url": parse_duckduckgo_redirect(href),
            "source": "duckduckgo",
        })
    return results


def fetch_overpass_salons() -> list[dict[str, Any]]:
    query = textwrap.dedent(
        f"""
        [out:json][timeout:25];
        (
          node["amenity"="hairdresser"]({TARGET_BBOX['min_lat']},{TARGET_BBOX['min_lon']},{TARGET_BBOX['max_lat']},{TARGET_BBOX['max_lon']});
          way["amenity"="hairdresser"]({TARGET_BBOX['min_lat']},{TARGET_BBOX['min_lon']},{TARGET_BBOX['max_lat']},{TARGET_BBOX['max_lon']});
          relation["amenity"="hairdresser"]({TARGET_BBOX['min_lat']},{TARGET_BBOX['min_lon']},{TARGET_BBOX['max_lat']},{TARGET_BBOX['max_lon']});
        );
        out center tags;
        """
    ).strip()
    payload = safe_post_json(OVERPASS_URL, data={"data": query}, timeout=30)
    if not isinstance(payload, dict):
        return []

    salons = []
    for element in payload.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name") or tags.get("brand")
        if not name:
            continue
        center = element.get("center") or element
        salons.append({
            "name": name,
            "address": tags.get("addr:full") or ", ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:suburb")])) or None,
            "latitude": center.get("lat"),
            "longitude": center.get("lon"),
            "source": "overpass",
            "tags": tags,
        })
    return salons


def geocode_nominatim(name: str, area_name: str) -> dict[str, Any] | None:
    params = {
        "q": f"{name}, {area_name}, Bangalore, Karnataka, India",
        "format": "jsonv2",
        "limit": 1,
    }
    headers = {"User-Agent": "AURA-seed-salons/1.0 (demo@aura.local)"}
    payload = safe_get_json(NOMINATIM_URL, params=params, headers=headers, timeout=20)
    if isinstance(payload, list) and payload:
        first = payload[0]
        return {
            "address": first.get("display_name"),
            "latitude": float(first.get("lat")),
            "longitude": float(first.get("lon")),
            "source": "nominatim",
        }
    return None


def reverse_opencage(lat: float, lon: float) -> dict[str, Any] | None:
    api_key = os.getenv("OPENCAGE_API_KEY")
    if not api_key:
        return None
    params = {"q": f"{lat},{lon}", "key": api_key, "language": "en", "pretty": 1}
    payload = safe_get_json(OPENCAGE_URL, params=params, timeout=20)
    if isinstance(payload, dict):
        results = payload.get("results", [])
        if results:
            item = results[0]
            geometry = item.get("geometry", {})
            return {
                "address": item.get("formatted"),
                "latitude": geometry.get("lat", lat),
                "longitude": geometry.get("lng", lon),
                "source": "opencage",
            }
    return None


def unique_by_slug(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in items:
        slug = slugify(item["name"])
        if slug in seen:
            continue
        seen.add(slug)
        unique.append(item)
    return unique


def place_name_candidates() -> list[dict[str, Any]]:
    candidates = []
    candidates.extend(fetch_overpass_salons())
    if len(candidates) < 10:
        for neighborhood in NEIGHBORHOODS:
            geocoded = geocode_nominatim(neighborhood["name"], neighborhood["name"])
            if not geocoded:
                geocoded = reverse_opencage(neighborhood["lat"], neighborhood["lon"])
            if geocoded:
                candidates.append({
                    "name": f"{neighborhood['name']} Hair Studio",
                    "address": geocoded.get("address"),
                    "latitude": geocoded["latitude"],
                    "longitude": geocoded["longitude"],
                    "source": geocoded.get("source", "nominatim"),
                })
    if len(candidates) < 20:
        for neighborhood in NEIGHBORHOODS:
            for item in fetch_duckduckgo_salons(neighborhood["name"]):
                candidates.append({
                    "name": item["name"],
                    "address": item.get("address"),
                    "latitude": neighborhood["lat"],
                    "longitude": neighborhood["lon"],
                    "source": item.get("source", "duckduckgo"),
                    "url": item.get("url"),
                })
    candidates = unique_by_slug(candidates)
    return candidates


def choose_salon_name(area_name: str, index: int, existing: set[str]) -> str:
    base_words = [
        f"{random.choice(SALON_WORDS)} {random.choice(SALON_SUFFIXES)}",
        f"{area_name} {random.choice(SALON_WORDS)}",
        f"{random.choice(SALON_WORDS)} by {area_name}",
        f"{area_name} {random.choice(SALON_SUFFIXES)}",
    ]
    for candidate in base_words:
        slug = slugify(candidate)
        if slug not in existing:
            return candidate
    return f"{area_name} Beauty Studio {index + 1}"


def choose_services(rng: random.Random, count: int) -> list[ServiceProfile]:
    choices = rng.sample(SERVICE_POOL, k=count)
    services = []
    for service_name, price_bounds, duration_bounds in choices:
        low_price, high_price = price_bounds
        low_duration, high_duration = duration_bounds
        price = rng.randint(low_price, high_price)
        duration = rng.randint(low_duration, high_duration)
        services.append(
            ServiceProfile(
                name=service_name,
                price_inr=price,
                duration_minutes=duration,
                description=f"{service_name} service focused on {SERVICE_DESCRIPTORS[service_name].lower()}",
            )
        )
    services.sort(key=lambda item: item.price_inr)
    return services


def choose_opening_hours(rng: random.Random) -> dict[str, str]:
    weekday_open = rng.choice(["09:00", "09:30", "10:00"])
    weekday_close = rng.choice(["19:30", "20:00", "20:30"])
    weekend_open = rng.choice(["09:00", "10:00"])
    weekend_close = rng.choice(["18:30", "19:00", "20:00"])
    return {
        "mon": f"{weekday_open}–{weekday_close}",
        "tue": f"{weekday_open}–{weekday_close}",
        "wed": f"{weekday_open}–{weekday_close}",
        "thu": f"{weekday_open}–{weekday_close}",
        "fri": f"{weekday_open}–{weekday_close}",
        "sat": f"{weekend_open}–{weekend_close}",
        "sun": f"{weekend_open}–{weekend_close}",
    }


def choose_staff(rng: random.Random, salon_name: str) -> list[StaffProfile]:
    roles = ["Founder", "Senior Stylist", "Color Specialist", "Bridal Stylist", "Junior Stylist", "Assistant"]
    specializations = [
        "balayage", "curly cuts", "keratin", "bridal styling", "men's grooming", "hair repair", "blowouts",
    ]
    staff_count = rng.randint(3, 5)
    staff: list[StaffProfile] = []
    for idx in range(staff_count):
        name = f"{rng.choice(['Asha', 'Ritika', 'Nidhi', 'Pallavi', 'Zoya', 'Rohit', 'Farah', 'Mansi'])} {rng.choice(['Sharma', 'Iyer', 'Kapoor', 'Nair', 'Singh', 'Mehta', 'Bose'])}"
        role = roles[idx] if idx < len(roles) else rng.choice(roles)
        specialization = rng.choice(specializations)
        avatar_url = f"https://api.dicebear.com/7.x/personas/svg?seed={requests.utils.quote(name)}"
        staff.append(
            StaffProfile(
                name=name,
                role=role,
                specialization=specialization,
                experience_years=rng.randint(3, 16),
                avatar_url=avatar_url,
            )
        )
    return staff


def choose_amenities(rng: random.Random) -> list[str]:
    return sorted(rng.sample(AMENITIES_POOL, k=rng.randint(4, 7)))


def choose_tags(rng: random.Random, area_name: str) -> list[str]:
    tags = set(rng.sample(TAGS_POOL, k=rng.randint(4, 6)))
    tags.add(area_name.lower().replace(" ", "-"))
    return sorted(tags)


def review_text(rng: random.Random, salon_name: str, area_name: str) -> str:
    opener = rng.choice(HINGLISH_SNIPPETS)
    closer = rng.choice([
        f"{salon_name} in {area_name} is genuinely worth the hype.",
        f"Next time bhi yahin aungi for touch-up.",
        f"Stylist understood the brief without too much explanation.",
        f"Price thoda premium hai but quality makes sense.",
        f"Ambience clean tha aur staff super attentive tha.",
    ])
    return f"{opener}. {closer}"


def choose_reviews(rng: random.Random, salon_name: str, area_name: str) -> list[ReviewProfile]:
    count = rng.randint(8, 15)
    reviews: list[ReviewProfile] = []
    sampled_names = rng.sample(REVIEW_NAMES, k=min(len(REVIEW_NAMES), count))
    while len(sampled_names) < count:
        sampled_names.append(f"Guest {len(sampled_names) + 1}")
    for idx in range(count):
        name = sampled_names[idx]
        avatar = f"https://ui-avatars.com/api/?name={requests.utils.quote(name)}&background=F6F1EA&color=3E2C2A&size=128"
        reviews.append(
            ReviewProfile(
                author=name,
                avatar_url=avatar,
                rating=rng.choice([4, 4, 5]),
                text=review_text(rng, salon_name, area_name),
                created_at=(datetime.utcnow()).isoformat(),
            )
        )
    return reviews


def choose_photo_pairs(rng: random.Random, salon_slug: str, services: list[ServiceProfile], photo_index: int) -> list[PhotoPairProfile]:
    pair_count = rng.randint(4, 6)
    pairs: list[PhotoPairProfile] = []
    keywords = [
        "balayage", "keratin", "haircut", "blowout", "bridal", "color", "smoothening", "curly",
    ]
    for idx in range(pair_count):
        service = services[idx % len(services)]
        keyword = rng.choice(keywords)
        seed_base = f"{salon_slug}-{photo_index}-{idx}-{keyword}"
        before_url = build_hair_image_url(seed_base + "-before", keyword, "before")
        after_url = build_hair_image_url(seed_base + "-after", keyword, "after")
        caption = f"{service.name} transformation with {service.description.lower()}"
        pairs.append(
            PhotoPairProfile(
                before_url=before_url,
                after_url=after_url,
                service_type=service.name,
                caption=caption,
            )
        )
    return pairs


def build_hair_image_url(seed: str, keyword: str, variant: str) -> str:
    unsplash = f"https://source.unsplash.com/800x600/?hair,{keyword}&sig={uuid.uuid5(uuid.NAMESPACE_URL, seed)}"
    try:
        response = requests.get(unsplash, timeout=12)
        if response.status_code == 200:
            return unsplash
    except Exception:
        pass
    return f"https://picsum.photos/seed/{slugify(seed)}-{variant}/800/600"


def build_salon_profiles() -> list[SalonProfile]:
    rng = random.Random(20240619)
    source_candidates = place_name_candidates()
    chosen_sources = source_candidates[:SEED_COUNT]

    profiles: list[SalonProfile] = []
    used_slugs: set[str] = set()

    for index in range(SEED_COUNT):
        neighborhood = NEIGHBORHOODS[index % len(NEIGHBORHOODS)]
        source = chosen_sources[index] if index < len(chosen_sources) else None

        google_places = fetch_google_places(neighborhood["name"], neighborhood["lat"], neighborhood["lon"])
        premium_place = google_places[0] if google_places else None

        base_name = (
            premium_place["name"]
            if premium_place and premium_place.get("name")
            else source["name"] if source and source.get("name") else choose_salon_name(neighborhood["name"], index, used_slugs)
        )
        if index % 5 == 0:
            base_name = f"{neighborhood['name']} {rng.choice(SALON_SUFFIXES)}"
        slug = slugify(base_name)
        while slug in used_slugs:
            base_name = f"{base_name} {index + 1}"
            slug = slugify(base_name)
        used_slugs.add(slug)

        area_name = neighborhood["name"]
        source_lat = premium_place.get("latitude") if premium_place and premium_place.get("latitude") is not None else (source.get("latitude") if source else neighborhood["lat"])
        source_lon = premium_place.get("longitude") if premium_place and premium_place.get("longitude") is not None else (source.get("longitude") if source else neighborhood["lon"])
        lat = jitter_coordinate(float(source_lat), rng)
        lon = jitter_coordinate(float(source_lon), rng)

        services = choose_services(rng, rng.randint(5, 8))
        opening_hours = choose_opening_hours(rng)
        staff = choose_staff(rng, base_name)
        amenities = choose_amenities(rng)
        tags = choose_tags(rng, area_name)
        reviews = choose_reviews(rng, base_name, area_name)
        photo_pairs = choose_photo_pairs(rng, slug, services, index)

        low_price = min(service.price_inr for service in services)
        high_price = max(service.price_inr for service in services)
        price_range = money_range(low_price, high_price)
        tagline = rng.choice([
            f"Bangalore's {area_name} destination for polished, camera-ready hair.",
            f"Modern cuts, rich colour work, and bridal styling in {area_name}.",
            f"High-touch hair care with trend-led styling in {area_name}.",
            f"Trusted by {area_name} regulars for transformations that still feel wearable.",
        ])
        description = rng.choice([
            f"A curated salon experience in {area_name} with specialists in transformation work, everyday grooming, and event-ready styling.",
            f"A local favourite for clean fades, dimensional colour, keratin smoothing, and bridal preparation.",
            f"Bright interiors, trained stylists, and a service menu built for premium but practical beauty maintenance.",
        ])

        data_source = (
            "google_places"
            if premium_place
            else (source.get("source", "synthetic") if source else "synthetic")
        )

        profiles.append(
            SalonProfile(
                slug=slug,
                name=base_name,
                tagline=tagline,
                area=area_name,
                city="Bangalore",
                latitude=lat,
                longitude=lon,
                price_range=price_range,
                opening_hours=opening_hours,
                services=services,
                staff=staff,
                amenities=amenities,
                tags=tags,
                reviews=reviews,
                photo_pairs=photo_pairs,
                data_source=data_source,
                description=description,
            )
        )

    return profiles


def ensure_owner(db) -> User:
    owner = db.query(User).filter(User.email == "creator@aura.demo").first()
    if owner:
        return owner
    owner = User(
        name="AURA Seed Creator",
        email="creator@aura.demo",
        password_hash="$2b$12$seedplaceholderseedplaceholderseedplac",
        role="creator",
    )
    db.add(owner)
    db.flush()
    return owner


def upsert_salon(db, owner: User, profile: SalonProfile) -> tuple[Salon, bool]:
    seed_record = db.query(SalonSeedRecord).filter(SalonSeedRecord.slug == profile.slug).first()
    created = False

    if seed_record:
        salon = db.query(Salon).filter(Salon.id == seed_record.salon_id).first()
    else:
        salon = None

    if not salon:
        salon = Salon(
            owner_id=owner.id,
            name=profile.name,
            city=profile.city,
            neighborhood=profile.area,
            description=profile.description,
        )
        db.add(salon)
        db.flush()
        if seed_record:
            seed_record.salon_id = salon.id
            seed_record.salon_name = profile.name
            seed_record.area = profile.area
            seed_record.source = profile.data_source
            seed_record.payload_json = seed_record.payload_json or "{}"
        else:
            seed_record = SalonSeedRecord(
                slug=profile.slug,
                salon_id=salon.id,
                salon_name=profile.name,
                area=profile.area,
                source=profile.data_source,
                payload_json="{}",
            )
            db.add(seed_record)
        created = True
    else:
        salon.owner_id = owner.id
        salon.name = profile.name
        salon.city = profile.city
        salon.neighborhood = profile.area
        salon.description = profile.description
        if not seed_record:
            seed_record = SalonSeedRecord(
                slug=profile.slug,
                salon_id=salon.id,
                salon_name=profile.name,
                area=profile.area,
                source=profile.data_source,
                payload_json="{}",
            )
            db.add(seed_record)

    db.flush()
    return salon, created


def service_summary(services: list[ServiceProfile]) -> str:
    return ", ".join(service.name for service in services[:5]) + (f" +{len(services) - 5}" if len(services) > 5 else "")


def seed() -> list[dict[str, Any]]:
    db = SessionLocal()
    export_rows: list[dict[str, Any]] = []
    try:
        owner = ensure_owner(db)
        profiles = build_salon_profiles()

        print("Seeding Bangalore salons...\n")
        header = f"{'NAME':34} {'AREA':18} {'SERVICES':30} {'PAIRS':5} {'SOURCE':14}"
        print(header)
        print("-" * len(header))

        for profile in profiles:
            salon, created = upsert_salon(db, owner, profile)

            existing_transformations = db.query(Transformation).filter(Transformation.salon_id == salon.id).all()
            existing_by_signature = {(item.service_type, item.before_image_url, item.after_image_url): item for item in existing_transformations}

            for pair in profile.photo_pairs:
                signature = (pair.service_type, pair.before_url, pair.after_url)
                matched = existing_by_signature.get(signature)
                if matched:
                    matched.artist_name = profile.staff[0].name
                    matched.service_type = pair.service_type
                    matched.before_image_url = pair.before_url
                    matched.after_image_url = pair.after_url
                    matched.style_description = pair.caption
                else:
                    db.add(
                        Transformation(
                            salon_id=salon.id,
                            artist_name=profile.staff[0].name,
                            service_type=pair.service_type,
                            hair_texture_tag=random.choice(["straight", "wavy", "curly", "coily"]),
                            before_image_url=pair.before_url,
                            after_image_url=pair.after_url,
                            style_description=pair.caption,
                            try_on_count=random.randint(0, 60),
                        )
                    )

            db.flush()

            seed_record = db.query(SalonSeedRecord).filter(SalonSeedRecord.slug == profile.slug).first()
            if seed_record:
                seed_record.payload_json = json.dumps(
                    {
                        "slug": profile.slug,
                        "name": profile.name,
                        "area": profile.area,
                        "city": profile.city,
                        "price_range": profile.price_range,
                        "services": [service.__dict__ for service in profile.services],
                    },
                    ensure_ascii=False,
                )
                seed_record.salon_name = profile.name
                seed_record.area = profile.area
                seed_record.source = profile.data_source

            payload = {
                "slug": profile.slug,
                "name": profile.name,
                "tagline": profile.tagline,
                "area": profile.area,
                "city": profile.city,
                "coordinates": {"lat": profile.latitude, "lon": profile.longitude},
                "price_range": profile.price_range,
                "opening_hours": profile.opening_hours,
                "services": [service.__dict__ for service in profile.services],
                "staff": [staff.__dict__ for staff in profile.staff],
                "amenities": profile.amenities,
                "tags": profile.tags,
                "reviews": [review.__dict__ for review in profile.reviews],
                "photo_pairs": [pair.__dict__ for pair in profile.photo_pairs],
                "data_source": profile.data_source,
                "description": profile.description,
                "created": created,
            }
            export_rows.append(payload)

            print(
                f"{profile.name[:33]:34} {profile.area[:18]:18} {service_summary(profile.services):30} {len(profile.photo_pairs):5d} {profile.data_source[:14]:14}"
            )

        db.commit()

        export_payload = {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "count": len(export_rows),
            "salons": export_rows,
        }
        EXPORT_PATH.write_text(json.dumps(export_payload, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nExported {EXPORT_PATH.name} with {len(export_rows)} salons.")
        return export_rows
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()