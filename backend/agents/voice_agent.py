# voice_agent.py

import os
import pyttsx3
import whisper

# -----------------------------------------------
# ✅ Initialize Whisper model for speech-to-text
# -----------------------------------------------
# Uses the base Whisper model; you can upgrade to 'medium' or 'large' if needed.
model = whisper.load_model("base")


# ------------------------------
# 🔊 Function: Speech-to-Text
# ------------------------------
def transcribe_audio(file_path):
    """
    Transcribes speech from an audio file (WAV/MP3/MP4/M4A) to text using Whisper.
    Args:
        file_path (str): Path to the audio file.
    Returns:
        str: Transcribed text or error message.
    """
    try:
        print("🧠 Transcribing audio using Whisper...")
        result = model.transcribe(file_path)
        return result["text"]
    except Exception as e:
        return f"❌ Error during transcription: {str(e)}"


# ------------------------------
# 🗣️ Function: Text-to-Speech
# ------------------------------
def speak_text(text):
    """
    Converts text to speech using pyttsx3.
    Args:
        text (str): The text to speak out loud.
    """
    try:
        print("🔈 Speaking out text...")
        engine = pyttsx3.init()
        engine.setProperty('rate', 175)      # Speed of speech
        engine.setProperty('volume', 1.0)    # Volume (0.0 to 1.0)
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"❌ Error during speech synthesis: {str(e)}")


# -------------------------------
# ✅ Example usage and testing
# -------------------------------
if __name__ == "__main__":
    # Example: Path to your recorded voice file
    audio_file = "sample_audio.wav"  # Make sure the file exists

    if os.path.exists(audio_file):
        # Step 1: Transcribe
        transcribed_text = transcribe_audio(audio_file)
        print("📝 Transcribed Text:\n", transcribed_text)

        # Step 2: Speak the result
        speak_text(transcribed_text)
    else:
        print(f"❌ File not found: {audio_file}")
