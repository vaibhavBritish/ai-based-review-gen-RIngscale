import os
import anthropic
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

try:
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=10,
        messages=[
            {"role": "user", "content": "Hello"}
        ]
    )
    print(f"Success! Response: {message.content[0].text}")
except Exception as e:
    print(f"Error: {str(e)}")
