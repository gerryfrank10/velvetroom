from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import shutil
from PIL import Image, ImageDraw, ImageFont
import cv2
import subprocess
import aiofiles
from PIL import Image, ImageDraw, ImageFont
from fastapi import BackgroundTasks

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer()

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "user"  # user or admin
    verified_badge: bool = False
    vip_status: bool = False
    vip_expiry: Optional[datetime] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    token: str
    user: User

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str
    category: str
    phone: Optional[str] = None
    email: Optional[str] = None

class PricingTier(BaseModel):
    hours: float
    price: float

class Listing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    pricing_tiers: List[dict] = []  # [{"hours": 1, "price": 100}, {"hours": 2, "price": 180}]
    services: List[str] = []  # ["Massage", "Companionship", "Travel"]
    location: dict | str = {}  # {"country": "UK", "region": "Dorset", "city": "Bournemouth", "district": "Winton"} or "City, Country"
    category: str
    phone: Optional[str] = None
    email: Optional[str] = None
    images: List[str] = []
    videos: List[str] = []
    user_id: str
    user_name: str
    featured: bool = False
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    views: int = 0

class MessageCreate(BaseModel):
    to_user_id: str
    listing_id: str
    content: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    listing_id: str
    content: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    listing_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminAction(BaseModel):
    status: str  # approved or rejected

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    user_obj = User(**{k: v for k, v in user.items() if k != "password"})
    token = create_token(user["id"])
    return TokenResponse(token=token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user["created_at"], str):
        current_user["created_at"] = datetime.fromisoformat(current_user["created_at"])
    return User(**{k: v for k, v in current_user.items() if k != "password"})

# ============ FILE UPLOAD ============



def add_watermark_to_image(image_path: Path) -> Path:
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size

        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        watermark_text = "velvetroom.com"

        # Scale font nicely
        font_size = max(24, int(min(width, height) * 0.08))

        try:
            font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                font_size
            )
        except Exception:
            font = ImageFont.load_default()

        # ✅ Correct Pillow 10+ measurement
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        # ✅ CENTER POSITION
        x = (width - text_w) // 2
        y = (height - text_h) // 2

        # Semi-transparent background box (important for visibility)
        padding = 20
        draw.rectangle(
            (
                x - padding,
                y - padding,
                x + text_w + padding,
                y + text_h + padding
            ),
            fill=(0, 0, 0, 120)
        )

        # Watermark text
        draw.text(
            (x, y),
            watermark_text,
            fill=(255, 255, 255, 200),
            font=font
        )

        # Merge layers
        watermarked = Image.alpha_composite(img, overlay)

        # Save optimized (fast + good quality)
        watermarked.convert("RGB").save(
            image_path,
            quality=85,
            optimize=True
        )

        return image_path

    except Exception as e:
        logger.error(f"Image watermark failed: {e}")
        return image_path

def add_watermark_to_video(video_path: Path) -> Path:
    try:
        output_path = video_path.with_suffix(".wm.mp4")

        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-vf",
            "drawtext=text='VelvetRoom':x=w-tw-20:y=h-th-20:"
            "fontsize=24:fontcolor=white@0.7:box=1:boxcolor=black@0.4",
            "-preset", "veryfast",
            "-codec:a", "copy",
            "-y",
            str(output_path),
        ]

        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        video_path.unlink()
        output_path.rename(video_path)

        return video_path

    except Exception as e:
        logger.error(f"Video watermark failed: {e}")
        return video_path

@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user),
):
    file_ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOADS_DIR / filename

    chunk_size = 8 * 1024 * 1024  # 8MB

    async with aiofiles.open(file_path, "wb") as out_file:
        while chunk := await file.read(chunk_size):
            await out_file.write(chunk)

    # 🔥 Watermark in background (NON-BLOCKING)
    if file_ext in {".jpg", ".jpeg", ".png", ".webp"}:
        background_tasks.add_task(add_watermark_to_image, file_path)

    elif file_ext in {".mp4", ".mov", ".avi", ".webm"}:
        background_tasks.add_task(add_watermark_to_video, file_path)

    backend_url = os.environ.get("BACKEND_URL", "https://durexethiopia.com")

    return {
        "url": f"{backend_url}/uploads/{filename}",
        "type": "video" if file_ext in {".mp4", ".mov", ".avi", ".webm"} else "image",
    }

# ============ LISTING ROUTES ============

@api_router.post("/listings", response_model=Listing)
async def create_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    images: List[str] = Form([]),
    videos: List[str] = Form([]),
    pricing_tiers: str = Form("[]"),
    services: str = Form("[]"),
    current_user: dict = Depends(get_current_user)
):
    import json
    location_obj = json.loads(location) if location else {}
    
    listing = Listing(
        title=title,
        description=description,
        price=price,
        location=location_obj,
        category=category,
        phone=phone,
        email=email,
        images=images if images else [],
        videos=videos if videos else [],
        pricing_tiers=json.loads(pricing_tiers) if pricing_tiers else [],
        services=json.loads(services) if services else [],
        user_id=current_user["id"],
        user_name=current_user["name"]
    )
    
    listing_dict = listing.model_dump()
    listing_dict["created_at"] = listing_dict["created_at"].isoformat()
    
    await db.listings.insert_one(listing_dict)
    return listing

@api_router.get("/listings", response_model=List[Listing])
async def get_listings(
    status: str = "approved",
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 50
):
    query = {"status": status}
    
    if category:
        query["category"] = category
    if location:
        query["$or"] = [
            {"location.city": {"$regex": location, "$options": "i"}},
            {"location.district": {"$regex": location, "$options": "i"}},
            {"location.region": {"$regex": location, "$options": "i"}},
            {"location.country": {"$regex": location, "$options": "i"}},
        ]
    if min_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min_price
    if max_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max_price
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if featured is not None:
        query["featured"] = featured
    
    listings = await db.listings.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for listing in listings:
        if isinstance(listing["created_at"], str):
            listing["created_at"] = datetime.fromisoformat(listing["created_at"])
    
    return listings

@api_router.get("/listings/{listing_id}", response_model=Listing)
async def get_listing(listing_id: str):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Increment views
    await db.listings.update_one({"id": listing_id}, {"$inc": {"views": 1}})
    
    if isinstance(listing["created_at"], str):
        listing["created_at"] = datetime.fromisoformat(listing["created_at"])
    
    return Listing(**listing)

@api_router.get("/listings/user/me", response_model=List[Listing])
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    listings = await db.listings.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for listing in listings:
        if isinstance(listing["created_at"], str):
            listing["created_at"] = datetime.fromisoformat(listing["created_at"])
    
    return listings

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.listings.delete_one({"id": listing_id})
    return {"message": "Listing deleted"}

@api_router.put("/listings/{listing_id}", response_model=Listing)
async def update_listing(
    listing_id: str,
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    images: List[str] = Form([]),
    videos: List[str] = Form([]),
    pricing_tiers: str = Form("[]"),
    services: str = Form("[]"),
    current_user: dict = Depends(get_current_user)
):
    import json
    
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    location_obj = json.loads(location) if location else {}
    
    update_data = {
        "title": title,
        "description": description,
        "price": price,
        "location": location_obj,
        "category": category,
        "phone": phone,
        "email": email,
        "images": images if images else [],
        "videos": videos if videos else [],
        "pricing_tiers": json.loads(pricing_tiers) if pricing_tiers else [],
        "services": json.loads(services) if services else []
    }
    
    await db.listings.update_one({"id": listing_id}, {"$set": update_data})
    
    updated_listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if isinstance(updated_listing["created_at"], str):
        updated_listing["created_at"] = datetime.fromisoformat(updated_listing["created_at"])
    
    return Listing(**updated_listing)

# ============ FAVORITES ============

@api_router.post("/favorites")
async def add_favorite(listing_id: str = Form(...), current_user: dict = Depends(get_current_user)):
    # Check if already favorited
    existing = await db.favorites.find_one({"user_id": current_user["id"], "listing_id": listing_id}, {"_id": 0})
    if existing:
        return {"message": "Already favorited"}
    
    favorite = Favorite(user_id=current_user["id"], listing_id=listing_id)
    favorite_dict = favorite.model_dump()
    favorite_dict["created_at"] = favorite_dict["created_at"].isoformat()
    
    await db.favorites.insert_one(favorite_dict)
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{listing_id}")
async def remove_favorite(listing_id: str, current_user: dict = Depends(get_current_user)):
    await db.favorites.delete_one({"user_id": current_user["id"], "listing_id": listing_id})
    return {"message": "Removed from favorites"}

@api_router.get("/favorites", response_model=List[Listing])
async def get_favorites(current_user: dict = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    listing_ids = [f["listing_id"] for f in favorites]
    
    listings = await db.listings.find({"id": {"$in": listing_ids}}, {"_id": 0}).to_list(1000)
    
    for listing in listings:
        if isinstance(listing["created_at"], str):
            listing["created_at"] = datetime.fromisoformat(listing["created_at"])
    
    return listings

# ============ MESSAGES ============

@api_router.post("/messages", response_model=Message)
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    message = Message(
        from_user_id=current_user["id"],
        to_user_id=message_data.to_user_id,
        listing_id=message_data.listing_id,
        content=message_data.content
    )
    
    message_dict = message.model_dump()
    message_dict["created_at"] = message_dict["created_at"].isoformat()
    
    await db.messages.insert_one(message_dict)
    return message

@api_router.get("/messages", response_model=List[Message])
async def get_messages(current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [{"from_user_id": current_user["id"]}, {"to_user_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    for message in messages:
        if isinstance(message["created_at"], str):
            message["created_at"] = datetime.fromisoformat(message["created_at"])
    
    return messages

@api_router.get("/messages/conversation/{listing_id}", response_model=List[Message])
async def get_conversation(listing_id: str, current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {
            "listing_id": listing_id,
            "$or": [{"from_user_id": current_user["id"]}, {"to_user_id": current_user["id"]}]
        },
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    
    for message in messages:
        if isinstance(message["created_at"], str):
            message["created_at"] = datetime.fromisoformat(message["created_at"])
    
    return messages

# ============ ADMIN ROUTES ============

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(1000)
    
    for user in users:
        if isinstance(user.get("created_at"), str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        if isinstance(user.get("last_active"), str):
            user["last_active"] = datetime.fromisoformat(user["last_active"])
        if user.get("vip_expiry") and isinstance(user["vip_expiry"], str):
            user["vip_expiry"] = datetime.fromisoformat(user["vip_expiry"])
    
    return users

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Delete user's listings
    await db.listings.delete_many({"user_id": user_id})
    # Delete user's messages
    await db.messages.delete_many({"$or": [{"from_user_id": user_id}, {"to_user_id": user_id}]})
    # Delete user's favorites
    await db.favorites.delete_many({"user_id": user_id})
    # Delete user
    await db.users.delete_one({"id": user_id})
    
    return {"message": "User and all associated data deleted"}

@api_router.post("/admin/users/{user_id}/vip")
async def toggle_vip_status(
    user_id: str,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    vip_expiry = datetime.now(timezone.utc) + timedelta(days=days)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"vip_status": True, "vip_expiry": vip_expiry.isoformat()}}
    )
    
    return {"message": f"VIP status granted for {days} days"}

@api_router.get("/admin/listings", response_model=List[Listing])
async def get_admin_listings(
    status: str = "pending",
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    listings = await db.listings.find({"status": status}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for listing in listings:
        if isinstance(listing["created_at"], str):
            listing["created_at"] = datetime.fromisoformat(listing["created_at"])
    
    return listings

@api_router.post("/admin/listings/{listing_id}/status")
async def update_listing_status(
    listing_id: str,
    action: AdminAction,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.listings.update_one(
        {"id": listing_id},
        {"$set": {"status": action.status}}
    )
    return {"message": f"Listing {action.status}"}

# ============ STATS ============

@api_router.get("/locations")
async def get_locations():
    """Get hierarchical location data"""
    import json
    locations_file = ROOT_DIR / "locations.json"
    with open(locations_file, 'r') as f:
        return json.load(f)

@api_router.get("/stats")
async def get_stats():
    total_listings = await db.listings.count_documents({"status": "approved"})
    total_users = await db.users.count_documents({})
    
    return {
        "total_listings": total_listings,
        "total_users": total_users
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()