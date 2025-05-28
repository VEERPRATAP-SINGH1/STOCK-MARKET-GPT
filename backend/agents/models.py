import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# List available models
models = genai.list_models()
for model in models:
    print(model.name)
