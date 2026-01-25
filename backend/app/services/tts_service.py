# backend/app/services/tts_service.py
import os
from google.cloud import texttospeech

class TTSService:
    def __init__(self):
        # Assumes GOOGLE_APPLICATION_CREDENTIALS is set or default auth works
        try:
            self.client = texttospeech.TextToSpeechClient()
        except Exception as e:
            print(f"⚠️ TTS Init Error: {e}")
            self.client = None

    def synthesize_speech(self, text: str, voice_name: str = "en-US-Neural2-F") -> bytes:
        """
        Synthesizes text to speech using Google Cloud Neural2 voices.
        Returns audio bytes (MP3).
        """
        if not self.client:
            print("⚠️ TTS Client not initialized, returning empty bytes.")
            return b""

        input_text = texttospeech.SynthesisInput(text=text)

        # "en-US-Neural2-F" is a high quality female voice.
        # We can make this dynamic later if needed.
        # Language code usually matches the voice name prefix.
        language_code = "-".join(voice_name.split("-")[:2]) # e.g., "en-US"

        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        try:
            response = self.client.synthesize_speech(
                input=input_text, voice=voice, audio_config=audio_config
            )
            return response.audio_content
        except Exception as e:
            print(f"⚠️ TTS Synthesis Error: {e}")
            return b""
