import time
import base64
import os
import io
import re
import asyncio
import concurrent.futures
from typing import Dict, List, Optional, Tuple
from .schemas import LanguageCode
from .config import settings

SARVAM_SPEAKER_MAP = {
    "sarvam_pooja": "pooja",
    "sarvam_ritu": "ritu",
    "sarvam_aditya": "aditya",
    "sarvam_kabir": "kabir",
    "sarvam_simran": "simran",
    "sarvam_shubh": "shubh",
    # Legacy aliases for UI backwards compatibility
    "sarvam_bulbul": "pooja",
    "sarvam_meera": "ritu",
    "sarvam_dhruv": "aditya",
    "sarvam_pavithra": "simran",
}

VOICE_MAP = {
    "sarvam_pooja": "gu-IN-DhwaniNeural",
    "sarvam_ritu": "gu-IN-DhwaniNeural",
    "sarvam_aditya": "gu-IN-NiranjanNeural",
    "sarvam_kabir": "hi-IN-MadhurNeural",
    "sarvam_simran": "hi-IN-SwaraNeural",
    "sarvam_shubh": "hi-IN-MadhurNeural",
    "sarvam_bulbul": "gu-IN-DhwaniNeural",
    "sarvam_meera": "gu-IN-DhwaniNeural",
    "sarvam_dhruv": "gu-IN-NiranjanNeural",
    "sarvam_pavithra": "hi-IN-SwaraNeural",
    "elevenlabs_rachel": "en-IN-NeerjaNeural",
    "elevenlabs_adam": "en-IN-PrabhatNeural",
    "browser_default": "gu-IN-DhwaniNeural"
}

_AUDIO_CACHE: Dict[str, bytes] = {}

class SpeakerInfo:
    def __init__(self, id: str, name: str, gender: str, language: str, description: str, sample_url: str = ""):
        self.id = id
        self.name = name
        self.gender = gender
        self.language = language
        self.description = description
        self.sample_url = sample_url

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "gender": self.gender,
            "language": self.language,
            "description": self.description,
            "sample_url": self.sample_url
        }

class TextToSpeechEngine:
    """
    High-Performance Indic & Multilingual Neural TTS Engine:
    - Primary: Sarvam AI Neural TTS (bulbul:v3) across Gujarati, Hindi, and English
    - Fallback: Microsoft Azure Neural Studio Voices via Edge-TTS
    - Zero-latency in-memory audio cache
    - Full sentence articulation without truncation
    """
    def __init__(self):
        self.sarvam_key = getattr(settings, "SARVAM_API_KEY", "")
        self.elevenlabs_key = getattr(settings, "ELEVENLABS_API_KEY", "")
        self.speakers: List[SpeakerInfo] = [
            SpeakerInfo("sarvam_pooja", "Pooja (Sarvam Gujarati/Indic Female)", "female", "gujarati", "Official Sarvam AI bulbul:v3 neural voice for Gujarati"),
            SpeakerInfo("sarvam_ritu", "Ritu (Sarvam Expressive Female)", "female", "gujarati", "Official Sarvam AI expressive neural voice"),
            SpeakerInfo("sarvam_aditya", "Aditya (Sarvam Indic Male)", "male", "gujarati", "Official Sarvam AI clear authoritative male voice"),
            SpeakerInfo("sarvam_kabir", "Kabir (Sarvam Hindi/Indic Male)", "male", "hindi", "Official Sarvam AI deep resonant male voice"),
            SpeakerInfo("sarvam_simran", "Simran (Sarvam Hindi Female)", "female", "hindi", "Official Sarvam AI conversational Hindi voice"),
            SpeakerInfo("sarvam_shubh", "Shubh (Sarvam Baritone Male)", "male", "hindi", "Official Sarvam AI narrative baritone voice"),
            SpeakerInfo("sarvam_bulbul", "Bulbul (Sarvam Indic Female 1)", "female", "gujarati", "Warm, conversational neural voice for Gujarati"),
            SpeakerInfo("sarvam_meera", "Meera (Sarvam Indic Female 2)", "female", "gujarati", "Clear, professional news-anchor cadence"),
            SpeakerInfo("sarvam_dhruv", "Dhruv (Sarvam Indic Male 1)", "male", "gujarati", "Deep, resonant baritone for technical responses"),
            SpeakerInfo("sarvam_pavithra", "Pavithra (Sarvam Indic Female 3)", "female", "hindi", "Melodic, expressive Indian accent for Hindi"),
            SpeakerInfo("elevenlabs_rachel", "Rachel (Global Female)", "female", "english", "Ultra-realistic neural voice for Indian & Global English"),
            SpeakerInfo("elevenlabs_adam", "Adam (Global Male)", "male", "english", "Deep narrative male voice for English"),
            SpeakerInfo("browser_default", "System Neural Voice", "neutral", "all", "High-speed multi-lingual neural voice")
        ]

    def get_available_speakers(self) -> List[Dict]:
        return [s.to_dict() for s in self.speakers]

    def get_voice_for_speaker_and_text(self, speaker_id: str, text: str, language: LanguageCode) -> str:
        # Detect script
        has_gujarati = bool(re.search(r"[\u0A80-\u0AFF]", text))
        has_devanagari = bool(re.search(r"[\u0900-\u097F]", text))

        if has_gujarati:
            if "dhruv" in speaker_id.lower() or "adam" in speaker_id.lower() or "male" in speaker_id.lower():
                return "gu-IN-NiranjanNeural"
            return "gu-IN-DhwaniNeural"
        elif has_devanagari:
            if "kabir" in speaker_id.lower() or "adam" in speaker_id.lower() or "male" in speaker_id.lower():
                return "hi-IN-MadhurNeural"
            return "hi-IN-SwaraNeural"
        
        # Fall back to speaker_id mapping
        voice = VOICE_MAP.get(speaker_id)
        if voice:
            return voice
            
        if language == LanguageCode.GUJARATI:
            return "gu-IN-DhwaniNeural"
        elif language == LanguageCode.HINDI:
            return "hi-IN-SwaraNeural"
        return "en-IN-NeerjaNeural"

    def synthesize_sarvam_bytes(
        self,
        text: str,
        language: LanguageCode = LanguageCode.GUJARATI,
        speaker_id: str = "sarvam_pooja",
        speech_rate: float = 1.0,
        pitch: float = 1.0
    ) -> Optional[bytes]:
        if not self.sarvam_key:
            return None

        # Map language to Sarvam target_language_code
        has_gujarati = bool(re.search(r"[\u0A80-\u0AFF]", text))
        has_devanagari = bool(re.search(r"[\u0900-\u097F]", text))

        if has_gujarati:
            target_lang = "gu-IN"
        elif has_devanagari:
            target_lang = "hi-IN"
        elif language == LanguageCode.GUJARATI:
            target_lang = "gu-IN"
        elif language == LanguageCode.HINDI:
            target_lang = "hi-IN"
        else:
            target_lang = "en-IN"

        sarvam_speaker = SARVAM_SPEAKER_MAP.get(speaker_id, "pooja")

        # Clamp pace to Sarvam supported range [0.5, 2.0]
        pace = max(0.5, min(2.0, float(speech_rate)))

        try:
            import requests
            url = "https://api.sarvam.ai/text-to-speech"
            headers = {
                "api-subscription-key": self.sarvam_key,
                "Content-Type": "application/json"
            }
            payload = {
                "inputs": [text],
                "target_language_code": target_lang,
                "speaker": sarvam_speaker,
                "pitch": 0,
                "pace": pace,
                "model": "bulbul:v3"
            }
            resp = requests.post(url, json=payload, headers=headers, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                audios = data.get("audios", [])
                if audios:
                    return base64.b64decode(audios[0])
            else:
                print(f"Sarvam TTS API returned status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"Sarvam TTS exception: {e}")
        return None

    def synthesize_bytes(
        self,
        text: str,
        language: LanguageCode = LanguageCode.GUJARATI,
        speaker_id: str = "sarvam_pooja",
        speech_rate: float = 1.0,
        pitch: float = 1.0
    ) -> Tuple[bytes, str, str]:
        """Returns (audio_bytes, format, provider)"""
        clean_text = re.sub(r"\[Doc \d+\]", "", text).strip()
        clean_text = re.sub(r"\s+", " ", clean_text)
        if not clean_text:
            return b"", "wav", "None"

        cache_key = f"{speaker_id}:{speech_rate}:{clean_text}"
        if cache_key in _AUDIO_CACHE:
            return _AUDIO_CACHE[cache_key], "wav", "Sarvam AI (bulbul:v3)"

        # 1. Primary: Genuine Sarvam AI Neural TTS
        sarvam_audio = self.synthesize_sarvam_bytes(
            text=clean_text,
            language=language,
            speaker_id=speaker_id,
            speech_rate=speech_rate,
            pitch=pitch
        )
        if sarvam_audio:
            if len(_AUDIO_CACHE) < 500:
                _AUDIO_CACHE[cache_key] = sarvam_audio
            return sarvam_audio, "wav", "Sarvam AI (bulbul:v3)"

        # 2. Fallback: Edge-TTS
        voice = self.get_voice_for_speaker_and_text(speaker_id, clean_text, language)
        rate_pct = int((speech_rate - 1.0) * 100)
        rate_str = f"+{rate_pct}%" if rate_pct >= 0 else f"{rate_pct}%"
        pitch_hz = int((pitch - 1.0) * 50)
        pitch_str = f"+{pitch_hz}Hz" if pitch_hz >= 0 else f"{pitch_hz}Hz"

        async def _fetch():
            import edge_tts
            comm = edge_tts.Communicate(clean_text, voice, rate=rate_str, pitch=pitch_str)
            chunks = []
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    chunks.append(chunk["data"])
            return b"".join(chunks)

        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        try:
            if loop.is_running():
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    edge_bytes = pool.submit(asyncio.run, _fetch()).result(timeout=8)
            else:
                edge_bytes = loop.run_until_complete(_fetch())
        except Exception as e:
            print(f"Edge-TTS generation fallback error: {e}")
            edge_bytes = b""

        if edge_bytes:
            if len(_AUDIO_CACHE) < 500:
                _AUDIO_CACHE[cache_key] = edge_bytes
            return edge_bytes, "mp3", "Edge-TTS Fallback"

        return b"", "wav", "None"

    def synthesize(
        self,
        text: str,
        language: LanguageCode = LanguageCode.GUJARATI,
        speaker_id: str = "sarvam_pooja",
        speech_rate: float = 1.0,
        pitch: float = 1.0
    ) -> Dict:
        t0 = time.time()
        clean_text = re.sub(r"\[Doc \d+\]", "", text).strip()

        audio_bytes, audio_fmt, provider = self.synthesize_bytes(
            text=clean_text,
            language=language,
            speaker_id=speaker_id,
            speech_rate=speech_rate,
            pitch=pitch
        )

        latency_ms = (time.time() - t0) * 1000

        if audio_bytes:
            b64 = base64.b64encode(audio_bytes).decode("ascii")
            return {
                "status": "SUCCESS",
                "speaker_id": speaker_id,
                "language": language,
                "audio_base64": b64,
                "audio_format": audio_fmt,
                "latency_ms": latency_ms,
                "provider": provider,
                "text_spoken": clean_text
            }

        return {
            "status": "FALLBACK",
            "speaker_id": speaker_id,
            "language": language,
            "audio_base64": None,
            "audio_format": "web_speech",
            "speech_rate": speech_rate,
            "pitch": pitch,
            "latency_ms": latency_ms,
            "provider": "Web Speech API",
            "text_spoken": clean_text
        }
