from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class LanguageCode(str, Enum):
    GUJARATI = "gujarati"
    HINDI = "hindi"
    ENGLISH = "english"

class AudioFormat(str, Enum):
    WAV = "wav"
    WEBM = "webm"
    MP3 = "mp3"

class ChunkingStrategy(str, Enum):
    PARENT_CHILD = "parent_child"
    CONTEXTUAL = "contextual"
    SEMANTIC = "semantic"
    METADATA_AWARE = "metadata_aware"
    FIXED_OVERLAP = "fixed_overlap"
    ENSEMBLE = "ensemble"

class PipelineStatus(str, Enum):
    SUCCESS = "SUCCESS"
    REFUSED_UNSAFE = "REFUSED_UNSAFE"
    REFUSED_OFF_TOPIC = "REFUSED_OFF_TOPIC"
    REFUSED_LOW_CONFIDENCE = "REFUSED_LOW_CONFIDENCE"
    ERROR = "ERROR"

class StageLatencies(BaseModel):
    model_config = ConfigDict(extra="ignore")
    stt_ms: float = 0.0
    classification_ms: float = 0.0
    embedding_ms: float = 0.0
    vector_search_ms: float = 0.0
    retrieval_total_ms: float = 0.0
    grounding_check_ms: float = 0.0
    ttft_ms: float = 0.0
    generation_total_ms: float = 0.0
    guardrail_check_ms: float = 0.0
    tts_ms: float = 0.0
    pipeline_total_ms: float = 0.0

class LatencyPercentiles(BaseModel):
    model_config = ConfigDict(extra="ignore")
    metric_name: str
    p50_ms: float
    p70_ms: float
    p100_ms: float
    sample_size: int

class TranscriptionState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transcript: str
    confidence: float = 0.95
    detected_language: str = "gu-IN"
    provider: str = "Sarvam AI"
    latency_ms: float = 0.0

class QueryClassificationState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    is_safe: bool = True
    is_on_topic: bool = True
    category: str = "general"
    rejection_reason: Optional[str] = None
    sanitized_query: str = ""
    latency_ms: float = 0.0

class GroundingCheckState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sufficient_context: bool = True
    confidence_score: float = 0.85
    reason: Optional[str] = None
    latency_ms: float = 0.0

class GuardrailCheckState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    is_grounded: bool = True
    hallucination_score: float = 0.05
    latency_ms: float = 0.0

class RetrievedChunk(BaseModel):
    model_config = ConfigDict(extra="ignore")
    chunk_id: str = ""
    doc_id: str = "doc_0"
    parent_id: Optional[str] = ""
    text: str = ""
    english_text: Optional[str] = ""
    parent_context: Optional[str] = None
    score: float = 0.0
    dense_score: Optional[float] = 0.0
    sparse_score: Optional[float] = 0.0
    rrf_rank: Optional[int] = 0
    is_selected: int = 0
    query_type: str = "GENERAL"
    source_doc_id: int = 0
    chunk_strategy: str = "parent_child"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RetrievalState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    query: str = ""
    strategy: str = "parent_child"
    strategy_used: str = "parent_child"
    chunks: List[RetrievedChunk] = Field(default_factory=list)
    max_similarity_score: float = 0.0
    embedding_latency_ms: float = 0.0
    search_latency_ms: float = 0.0
    total_retrieval_latency_ms: float = 0.0

class GenerationState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    generated_text: str
    citations: List[str] = Field(default_factory=list)
    time_to_first_token_ms: float = 0.0
    total_generation_time_ms: float = 0.0
    token_count: int = 0
    model_name: str = "local-grounded-extractor"

class TTSInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    text: str
    language: LanguageCode = LanguageCode.GUJARATI
    speaker_id: str = "sarvam_bulbul"
    speech_rate: float = 1.0
    pitch: float = 1.0

class TTSResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    speaker_id: str = "sarvam_bulbul"
    language: Optional[LanguageCode] = LanguageCode.GUJARATI
    audio_base64: Optional[str] = None
    audio_url: Optional[str] = None
    audio_format: Optional[str] = "wav"
    speech_rate: float = 1.0
    pitch: float = 1.0
    duration_seconds: float = 1.0
    sample_rate: int = 22050
    latency_ms: float = 0.0
    provider: str = "sarvam"
    text_spoken: Optional[str] = None

class QueryInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    query_text: str
    language: LanguageCode = LanguageCode.GUJARATI
    chunking_strategy: ChunkingStrategy = ChunkingStrategy.CONTEXTUAL
    top_k: int = 4
    strict_grounding: bool = True
    speaker_id: str = "sarvam_bulbul"
    speech_rate: float = 1.0
    pitch: float = 1.0
    tts_enabled: bool = True

class AudioInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    audio_base64: str
    audio_format: AudioFormat = AudioFormat.WEBM
    language: LanguageCode = LanguageCode.GUJARATI
    chunking_strategy: ChunkingStrategy = ChunkingStrategy.CONTEXTUAL
    speaker_id: str = "sarvam_bulbul"
    speech_rate: float = 1.0
    pitch: float = 1.0
    tts_enabled: bool = True

class PipelineResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: PipelineStatus
    query: str
    language: LanguageCode
    final_answer: str
    citations: List[str] = Field(default_factory=list)
    retrieved_chunks: List[RetrievedChunk] = Field(default_factory=list)
    refusal_reason: Optional[str] = None
    stt_provider: Optional[str] = None
    stt_confidence: Optional[float] = None
    stage_latencies: StageLatencies = Field(default_factory=StageLatencies)
    audio_output: Optional[TTSResponse] = None
