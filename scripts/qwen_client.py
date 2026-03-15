"""
Qwen client via Alibaba Coding Plan — replaces MiniMax for content generation.
"""
import json
import urllib.request
import time
import logging
from pathlib import Path

log = logging.getLogger(__name__)

def get_credentials():
    """Get Qwen credentials from auth profiles"""
    auth_path = Path.home() / '.openclaw/agents/main/agent/auth-profiles.json'
    with open(auth_path) as f:
        profiles = json.load(f)
    
    for key, p in profiles.get('profiles', {}).items():
        name = str(p.get('name','')).lower()
        provider = str(p.get('provider','')).lower()
        if any(x in name or x in provider for x in ['qwen', 'alibaba', 'coding', 'dashscope']):
            return p
    raise ValueError("No Qwen/Alibaba profile found")

creds = get_credentials()
BASE_URL = 'https://coding-intl.dashscope.aliyuncs.com/v1'
API_KEY = creds.get('api_key') or creds.get('token')
MODEL = 'qwen-plus'  # Use qwen-plus for reliability

def generate(system_prompt: str, user_prompt: str, 
             max_tokens: int = 4000, temperature: float = 0.7,
             retries: int = 3) -> str:
    """Call Qwen and return validated JSON."""
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    
    payload = {
        "model": MODEL,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system_prompt + " Output ONLY valid JSON. No markdown. No preamble."},
            {"role": "user", "content": user_prompt}
        ],
    }
    
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"{BASE_URL}/chat/completions",
                data=json.dumps(payload).encode(),
                headers=headers,
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=90) as response:
                data = json.loads(response.read().decode())
                text = data["choices"][0]["message"]["content"]
                
                # Clean and validate JSON
                text = text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                # Validate
                json.loads(text)
                return text
                
        except json.JSONDecodeError as e:
            log.warning(f"Invalid JSON attempt {attempt+1}: {e}")
            if attempt == retries - 1:
                raise
        except Exception as e:
            log.warning(f"API error attempt {attempt+1}: {e}")
            if attempt == retries - 1:
                raise
            time.sleep(2 * (attempt + 1))
    
    return None
