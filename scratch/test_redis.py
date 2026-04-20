import os
import redis.asyncio as redis
import asyncio
from dotenv import load_dotenv
from pathlib import Path

async def test_redis():
    # Load env from backend/.env
    ROOT_DIR = Path(__file__).parent.parent / "backend"
    load_dotenv(ROOT_DIR / '.env', override=True)

    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    print(f"Testing Redis connection to: {redis_url}")

    try:
        client = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        await client.ping()
        print("Redis Success!")
        await client.close()
    except Exception as e:
        print(f"Redis Failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_redis())
