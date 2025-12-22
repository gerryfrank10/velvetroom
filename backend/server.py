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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class Listing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    location: str
    category: str
    phone: Optional[str] = None
    email: Optional[str] = None
    images: List[str] = []
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

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOADS_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8001')
    return {"url": f"{backend_url}/uploads/{filename}"}

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
    current_user: dict = Depends(get_current_user)
):
    listing = Listing(
        title=title,
        description=description,
        price=price,
        location=location,
        category=category,
        phone=phone,
        email=email,
        images=images if images else [],
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
        query["location"] = {"$regex": location, "$options": "i"}
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