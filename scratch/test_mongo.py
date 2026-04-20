import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv
from pathlib import Path

async def test_mongo():
    # Load env from backend/.env
    ROOT_DIR = Path(__file__).parent.parent / "backend"
    load_dotenv(ROOT_DIR / '.env', override=True)

    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    print(f"Testing MongoDB connection to: {db_name}")

    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        # Try a simple fetch
        count = await db.clients.count_documents({})
        print(f"MongoDB Success! Found {count} clients.")
        client.close()
    except Exception as e:
        print(f"MongoDB Failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_mongo())
