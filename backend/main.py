from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from agents.api_agent import get_full_market_brief
from agents.language_agent import generate_market_summary, generate_response_from_prompt
from agents.voice_agent import transcribe_audio, speak_text
import os
import shutil

app = FastAPI(
    title="Multi-Agent Finance Assistant",
    description="Fetches stock data, generates summaries using Gemini, and supports voice input/output.",
    version="1.1.0"
)

# -------------------------------------
# ✅ Enable CORS for React frontend
# -------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origin like ["http://localhost:5173"] for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------
# ✅ Health Check
# -------------------------------------
@app.get("/")
def home():
    return {"message": "🚀 Finance Assistant with Gemini, Whisper, and TTS is running."}


# -------------------------------------
# ✅ Market Summary from Stock Symbol
# -------------------------------------
@app.get("/summary")
def get_summary(ticker: str = Query(..., description="Stock symbol like AAPL, TSLA, GOOGL")):
    """
    Fetches market data for a stock and returns a Gemini-generated summary.
    """
    try:
        market_data = get_full_market_brief(ticker)
        summary = generate_market_summary(market_data)

        return {
            "ticker": ticker.upper(),
            "summary": summary,
            "raw_data": market_data
        }

    except Exception as e:
        return {"error": f"Error processing request: {str(e)}"}


# -------------------------------------
# ✅ Generic Prompt-to-Text (Free-form AI)
# -------------------------------------
@app.get("/prompt")
def ask_prompt(prompt: str = Query(..., description="Any question or instruction to Gemini AI")):
    """
    Sends a free-text prompt to Gemini and returns its response.
    """
    try:
        ai_response = generate_response_from_prompt(prompt)
        return {"prompt": prompt, "response": ai_response}

    except Exception as e:
        return {"error": f"AI prompt handling failed: {str(e)}"}


# -------------------------------------
# ✅ Audio Transcription via Whisper
# -------------------------------------
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Accepts an audio file and transcribes it using Whisper.
    """
    try:
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        transcription = transcribe_audio(file_path)
        os.remove(file_path)

        return {"transcription": transcription}

    except Exception as e:
        return {"error": f"Transcription failed: {str(e)}"}


# -------------------------------------
# ✅ Text-to-Speech (TTS) Endpoint
# -------------------------------------
@app.post("/speak")
def speak(text: str = Query(..., description="Text to convert to speech")):
    """
    Converts text to speech using local TTS engine.
    """
    try:
        speak_text(text)
        return {"message": "✅ Speaking completed."}

    except Exception as e:
        return {"error": f"Speech synthesis failed: {str(e)}"}
