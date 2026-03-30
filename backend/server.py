from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import anthropic

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Anthropic client
anthropic_client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    description: str
    industry: str
    key_features: List[str]
    gmb_link: str
    brand_color: str
    accent_color: str
    hero_image: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    slug: str
    name: str
    description: str
    industry: str
    key_features: List[str]
    gmb_link: str
    brand_color: str
    accent_color: str
    hero_image: str

class ReviewRequest(BaseModel):
    client_slug: str
    count: int = 5

class ReviewResponse(BaseModel):
    reviews: List[str]

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "ReviewGen API is running"}

@api_router.get("/clients/{slug}", response_model=Client)
async def get_client_by_slug(slug: str):
    client_doc = await db.clients.find_one({"slug": slug}, {"_id": 0})
    if not client_doc:
        raise HTTPException(status_code=404, detail="Client not found")
    if isinstance(client_doc.get('created_at'), str):
        client_doc['created_at'] = datetime.fromisoformat(client_doc['created_at'])
    return client_doc

@api_router.get("/clients", response_model=List[Client])
async def get_all_clients():
    clients = await db.clients.find({}, {"_id": 0}).to_list(100)
    for c in clients:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return clients

@api_router.post("/clients", response_model=Client)
async def create_client(input: ClientCreate):
    client_dict = input.model_dump()
    client_obj = Client(**client_dict)
    doc = client_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.clients.insert_one(doc)
    return client_obj

@api_router.post("/generate-reviews", response_model=ReviewResponse)
async def generate_reviews(request: ReviewRequest):
    # Get client info
    client_doc = await db.clients.find_one({"slug": request.client_slug}, {"_id": 0})
    if not client_doc:
        raise HTTPException(status_code=404, detail="Client not found")
    
    count = min(request.count, 10)  # Max 10 reviews
    
    prompt = f"""You are helping generate authentic, positive Google review suggestions for a business.

Business Name: {client_doc['name']}
Industry: {client_doc['industry']}
Description: {client_doc['description']}
Key Features: {', '.join(client_doc['key_features'])}

Generate exactly {count} unique, authentic-sounding positive reviews that a satisfied customer might write. 

Requirements:
- Each review should be 2-4 sentences
- Sound natural and personal, like a real customer wrote it
- Highlight different aspects of the business
- Include specific details that make reviews feel genuine
- Vary the tone: some professional, some casual, some enthusiastic
- Do NOT use generic phrases like "highly recommend" in every review
- Make each review distinctly different

Return ONLY the reviews, one per line, separated by "|||" delimiter. No numbering, no quotes, no extra text."""

    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = message.content[0].text
        reviews = [r.strip() for r in response_text.split("|||") if r.strip()]
        
        return ReviewResponse(reviews=reviews[:count])
    except Exception as e:
        logging.error(f"Error generating reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate reviews: {str(e)}")

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Seed data endpoint
@api_router.post("/seed-clients")
async def seed_clients():
    clients_data = [
        {
            "slug": "british-english-academy",
            "name": "British English Academy",
            "description": "Premier English language school offering immersive British English courses for students of all levels. Experienced native British tutors, modern facilities, and proven curriculum.",
            "industry": "Education / Language School",
            "key_features": [
                "Native British tutors",
                "Small class sizes",
                "IELTS & Cambridge exam preparation",
                "Modern learning facilities",
                "Flexible scheduling",
                "Online and in-person options"
            ],
            "gmb_link": "https://share.google/iHIyjhCOab53qVTfv",
            "brand_color": "#1E3A8A",
            "accent_color": "#EFF6FF",
            "hero_image": "https://images.unsplash.com/photo-1770888844836-8d4617f299af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxicml0aXNoJTIwc3R1ZGVudCUyMGNsYXNzcm9vbSUyMGxvbmRvbnxlbnwwfHx8fDE3NzM3NzQwNjR8MA&ixlib=rb-4.1.0&q=85"
        },
        {
            "slug": "uniconnect-immigration",
            "name": "Uniconnect Immigration Services",
            "description": "Trusted immigration consultancy helping individuals and families navigate visa applications, work permits, and citizenship processes. Expert guidance through every step of your immigration journey.",
            "industry": "Immigration Services / Legal Consultancy",
            "key_features": [
                "Licensed immigration consultants",
                "Visa application assistance",
                "Work permit processing",
                "Family sponsorship",
                "Student visa support",
                "Citizenship applications"
            ],
            "gmb_link": "https://share.google/zkTdVH1k8mYibButO",
            "brand_color": "#0F766E",
            "accent_color": "#F0FDFA",
            "hero_image": "https://images.unsplash.com/photo-1487637419635-a2a471ff5c7b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxwYXNzcG9ydCUyMHRyYXZlbCUyMGltbWlncmF0aW9uJTIwYWlycG9ydCUyMGZhbWlseXxlbnwwfHx8fDE3NzM3NzQwNjV8MA&ixlib=rb-4.1.0&q=85"
        }
    ]
    
    for client_data in clients_data:
        existing = await db.clients.find_one({"slug": client_data["slug"]})
        if not existing:
            client_obj = Client(**client_data)
            doc = client_obj.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.clients.insert_one(doc)
    
    return {"message": "Clients seeded successfully", "count": len(clients_data)}

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
