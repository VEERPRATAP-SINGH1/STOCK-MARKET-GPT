import os
import google.generativeai as genai
from dotenv import load_dotenv

# -------------------------------
# ✅ Load Gemini API Key
# -------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


# -------------------------------------------------------
# 🔄 Format structured market data into bullet-point text
# -------------------------------------------------------
def format_market_data(market_data):
    """
    Convert structured market JSON into plain-text bullet points for Gemini.
    """
    summary = market_data.get("summary", {})
    earnings = market_data.get("earnings", {})

    lines = []

    # Summary Section
    lines.append(f"Stock: {summary.get('shortName', 'N/A')} ({summary.get('symbol', '')})")
    lines.append(f"Current Price: {summary.get('currentPrice')} {summary.get('currency')}")
    lines.append(f"Open: {summary.get('open')}, High: {summary.get('high')}, Low: {summary.get('low')}")
    lines.append(f"Previous Close: {summary.get('previousClose')}")
    lines.append(f"Exchange: {summary.get('exchange', 'N/A')}, Industry: {summary.get('industry', 'N/A')}")
    lines.append("")

    # Earnings Section
    if "message" not in earnings:
        lines.append("Earnings Report:")
        lines.append(f"Date: {earnings.get('date')}")
        lines.append(f"Estimated EPS: {earnings.get('epsEstimate')}, Actual EPS: {earnings.get('actualEPS')}")
        lines.append(f"Earnings Surprise: {earnings.get('surprise')}")
    else:
        lines.append("No earnings data available.")

    return "\n".join(lines)


# -----------------------------------------------------
# 🧠 Generate Gemini-based summary from market data
# -----------------------------------------------------
def generate_market_summary(market_data):
    """
    Uses Gemini Pro to generate a concise 2–3 sentence market summary.
    """
    try:
        prompt_data = format_market_data(market_data)

        prompt = (
            "You are a financial assistant. Based on the following market data, "
            "generate a short 2–3 sentence market summary highlighting price trends, "
            "earnings, and financial sentiment:\n\n"
            f"{prompt_data}"
        )

        model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
        response = model.generate_content(prompt)

        return response.text.strip()

    except Exception as e:
        return f"❌ Error generating summary using Gemini: {str(e)}"


# -----------------------------------------------------
# 🧠 Generate Gemini-based response from any prompt
# -----------------------------------------------------
def generate_response_from_prompt(prompt: str) -> str:
    """
    Accepts any user-defined prompt and returns Gemini's response.
    """
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
        response = model.generate_content(prompt)

        return response.text.strip()

    except Exception as e:
        return f"❌ Error generating response from prompt: {str(e)}"


# -----------------------------------------------------
# ✅ Optional CLI Test (run directly)
# -----------------------------------------------------
if __name__ == "__main__":
    # Test: Random prompt mode
    user_prompt = input("📝 Enter your prompt: ")
    print("\n🤖 Gemini's Response:\n")
    print(generate_response_from_prompt(user_prompt))
