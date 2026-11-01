import sys
sys.stdout.reconfigure(encoding='utf-8')
import time
import threading
from pathlib import Path
from typing import Optional, List, Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.schemas import (
        AudioInput,
        QueryInput,
        LanguageCode,
        ChunkingStrategy,
        PipelineStatus,
        StageLatencies,
        PipelineResponse,
        TTSResponse
    )
    from backend.stt_engine import SpeechToTextEngine
    from backend.guardrails import GuardrailManager
    from backend.vector_store import VectorStoreManager
    from backend.generator import ResponseGenerator
    from backend.tts_engine import TextToSpeechEngine
except ImportError:
    from schemas import (
        AudioInput,
        QueryInput,
        LanguageCode,
        ChunkingStrategy,
        PipelineStatus,
        StageLatencies,
        PipelineResponse,
        TTSResponse
    )
    from stt_engine import SpeechToTextEngine
    from guardrails import GuardrailManager
    from vector_store import VectorStoreManager
    from generator import ResponseGenerator
    from tts_engine import TextToSpeechEngine

class VoiceRAGPipeline:
    def __init__(self):
        print('Initializing High-Speed Voice RAG Pipeline...')
        self.stt = SpeechToTextEngine()
        self.guardrails = GuardrailManager()
        self.vector_store = VectorStoreManager(in_memory=True)
        self.generator = ResponseGenerator()
        self.tts = TextToSpeechEngine()
        self.tts_engine = self.tts
        
        try:
            if self.vector_store.preindexed_embeddings is not None:
                print(f"Pre-indexed corpus ready ({len(self.vector_store.preindexed_meta)} chunks). Skipping raw JSON parse for instant startup.")
                self.data = self.vector_store.preindexed_meta[:100]
            else:
                try:
                    from backend.dataset_loader import MSMARCODatasetLoader
                except ImportError:
                    from dataset_loader import MSMARCODatasetLoader
                loader = MSMARCODatasetLoader()
                self.data = loader.load_or_create_subsample()
                
                # Instant Synchronous Warmup
                print('Performing instant vector warmup...')
                for strat in ['contextual', 'parent_child', 'semantic', 'metadata_aware', 'fixed_overlap']:
                    self.vector_store.index_dataset(self.data, strategy=strat, max_docs=6)
        except Exception as e:
            print(f'Warning during index: {e}')
            
        print('Pipeline with Multi-Speaker TTS initialized successfully.')

    def run_text_query(self, input_data: QueryInput) -> PipelineResponse:
        t_start = time.time()
        latn = StageLatencies()
        
        # 1. Classify Query Intent & Safety (Guardrail Layer 1)
        class_state = self.guardrails.classify_query_intent(
            query=input_data.query_text,
            language=input_data.language
        )
        latn.classification_ms = class_state.latency_ms
        
        if not class_state.is_safe:
            refusal_text = class_state.rejection_reason or 'Unsafe query rejected.'
            tts_res = None
            if input_data.tts_enabled:
                tts_data = self.tts.synthesize(refusal_text, input_data.language, input_data.speaker_id, input_data.speech_rate, input_data.pitch)
                latn.tts_ms = tts_data["latency_ms"]
                tts_res = TTSResponse(**tts_data)

            latn.pipeline_total_ms = (time.time() - t_start) * 1000
            return PipelineResponse(
                status=PipelineStatus.REFUSED_UNSAFE,
                query=input_data.query_text,
                language=input_data.language,
                final_answer=refusal_text,
                refusal_reason='UNSAFE_CONTENT',
                stage_latencies=latn,
                audio_output=tts_res
            )
            
        if not class_state.is_on_topic:
            refusal_text = class_state.rejection_reason or 'Off-topic query rejected.'
            tts_res = None
            if input_data.tts_enabled:
                tts_data = self.tts.synthesize(refusal_text, input_data.language, input_data.speaker_id, input_data.speech_rate, input_data.pitch)
                latn.tts_ms = tts_data["latency_ms"]
                tts_res = TTSResponse(**tts_data)

            latn.pipeline_total_ms = (time.time() - t_start) * 1000
            return PipelineResponse(
                status=PipelineStatus.REFUSED_OFF_TOPIC,
                query=input_data.query_text,
                language=input_data.language,
                final_answer=refusal_text,
                refusal_reason='OFF_TOPIC_QUERY',
                stage_latencies=latn,
                audio_output=tts_res
            )

        # 2. Retrieve from Vector DB
        retrieval_state = self.vector_store.search(
            query=class_state.sanitized_query,
            strategy=input_data.chunking_strategy.value,
            top_k=input_data.top_k
        )
        latn.embedding_ms = retrieval_state.embedding_latency_ms
        latn.vector_search_ms = retrieval_state.search_latency_ms
        latn.retrieval_total_ms = retrieval_state.total_retrieval_latency_ms
        
        # 3. Grounding & Confidence Check (Guardrail Layer 2)
        ground_state = self.guardrails.check_retrieval_confidence(
            retrieval_state=retrieval_state,
            language=input_data.language,
            threshold=0.52
        )
        latn.grounding_check_ms = ground_state.latency_ms
        
        if not ground_state.sufficient_context and input_data.strict_grounding:
            refusal_text = ground_state.reason or 'Insufficient context in verified dataset.'
            tts_res = None
            if input_data.tts_enabled:
                tts_data = self.tts.synthesize(refusal_text, input_data.language, input_data.speaker_id, input_data.speech_rate, input_data.pitch)
                latn.tts_ms = tts_data["latency_ms"]
                tts_res = TTSResponse(**tts_data)

            latn.pipeline_total_ms = (time.time() - t_start) * 1000
            return PipelineResponse(
                status=PipelineStatus.REFUSED_LOW_CONFIDENCE,
                query=input_data.query_text,
                language=input_data.language,
                final_answer=refusal_text,
                refusal_reason='LOW_CONFIDENCE',
                retrieved_chunks=[],
                stage_latencies=latn,
                audio_output=tts_res
            )
            
        # 4. Generate Grounded Answer (with Citations)
        gen_state = self.generator.generate_answer(
            query=class_state.sanitized_query,
            chunks=retrieval_state.chunks,
            language=input_data.language
        )
        latn.ttft_ms = gen_state.time_to_first_token_ms
        latn.generation_total_ms = gen_state.total_generation_time_ms
        
        # 5. Guardrail Check (Guardrail Layer 3)
        guard_state = self.guardrails.verify_answer_grounding(
            answer=gen_state.generated_text,
            chunks=retrieval_state.chunks,
            language=input_data.language
        )
        latn.guardrail_check_ms = guard_state.latency_ms
        
        # 6. Synthesize Speech Output (TTS) with Selected Speaker
        tts_res = None
        if input_data.tts_enabled:
            tts_data = self.tts.synthesize(
                text=gen_state.generated_text,
                language=input_data.language,
                speaker_id=input_data.speaker_id,
                speech_rate=input_data.speech_rate,
                pitch=input_data.pitch
            )
            latn.tts_ms = tts_data["latency_ms"]
            tts_res = TTSResponse(**tts_data)

        latn.pipeline_total_ms = (time.time() - t_start) * 1000
        
        return PipelineResponse(
            status=PipelineStatus.SUCCESS,
            query=input_data.query_text,
            language=input_data.language,
            final_answer=gen_state.generated_text,
            citations=gen_state.citations,
            retrieved_chunks=retrieval_state.chunks,
            stage_latencies=latn,
            audio_output=tts_res
        )

    def run_voice_query(self, audio_input: AudioInput) -> PipelineResponse:
        t_start = time.time()
        latn = StageLatencies()
        
        stt_state = self.stt.transcribe(
            audio_base64=audio_input.audio_base64,
            language=audio_input.language,
            audio_format=audio_input.audio_format
        )
        latn.stt_ms = stt_state.latency_ms

        if not stt_state.transcript or not stt_state.transcript.strip():
            refusal_msg = {
                LanguageCode.GUJARATI: "કોઈ અવાજ સંભળાયો નથી. કૃપા કરીને ફરીથી સ્પષ્ટ રીતે બોલો.",
                LanguageCode.HINDI: "कोई आवाज़ सुनाई नहीं दी। कृपया पुनः स्पष्ट बोलें।",
                LanguageCode.ENGLISH: "No clear speech detected. Please speak into the mic again."
            }.get(audio_input.language, "No speech detected.")
            latn.pipeline_total_ms = (time.time() - t_start) * 1000
            return PipelineResponse(
                status=PipelineStatus.REFUSED_LOW_CONFIDENCE,
                query="",
                language=audio_input.language,
                final_answer=refusal_msg,
                refusal_reason="NO_SPEECH_DETECTED",
                stt_provider=stt_state.provider,
                stt_confidence=0.0,
                stage_latencies=latn
            )

        q = QueryInput(
            query_text=stt_state.transcript,
            language=audio_input.language,
            chunking_strategy=audio_input.chunking_strategy,
            speaker_id=audio_input.speaker_id,
            speech_rate=audio_input.speech_rate,
            pitch=audio_input.pitch,
            tts_enabled=audio_input.tts_enabled
        )
        res = self.run_text_query(q)
        res.stt_provider = stt_state.provider
        res.stt_confidence = stt_state.confidence
        res.stage_latencies.stt_ms = stt_state.latency_ms
        res.stage_latencies.pipeline_total_ms = (time.time() - t_start) * 1000
        return res
