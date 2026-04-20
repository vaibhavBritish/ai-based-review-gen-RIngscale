import os
import anthropic
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend/.env
ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env', override=True)

api_key = os.environ.get('ANTHROPIC_API_KEY')
model_name = os.environ.get('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20240620')

print(f"Testing Anthropic API with model: {model_name}")

client = anthropic.Anthropic(api_key=api_key)

try:
    message = client.messages.create(
        model=model_name,
        max_tokens=10,
        messages=[
            {"role": "user", "content": "Hello"}
        ]
    )
    print("Success!")
    print(f"Response: {message.content[0].text}")
except Exception as e:
    print(f"Failed: {str(e)}")
