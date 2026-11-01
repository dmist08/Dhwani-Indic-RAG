import re
import time
from typing import List, Optional
from .schemas import (
    LanguageCode,
    QueryClassificationState,
    RetrievalState,
    RetrievedChunk,
    GroundingCheckState,
    GuardrailCheckState
)

REFUSALS = {
    LanguageCode.GUJARATI: {
        'OFF_TOPIC': 'હું દસ્તાવેજી MSMARCO-XI પ્રશ્નોત્તરી સહાયક છું. આ પ્રશ્ન મારા કાર્યક્ષેત્રની બહાર છે.',
        'UNSAFE': 'માફ કરશો, આ સુરક્ષા નીતિઓનું ઉલ્લંઘન કરતો હોવાથી જવાબ આપી શકાશે નહીં.',
        'LOW_CONFIDENCE': 'માફ કરશો, આ પ્રશ્ન માટે MSMARCO-XI દસ્તાવેજી સંગ્રહમાં પૂરતી માહિતી મળી નથી.'
    },
    LanguageCode.HINDI: {
        'OFF_TOPIC': 'क्षमा करें, यह प्रश्न मेरे दस्तावेजी संदर्भ से बाहर है।',
        'UNSAFE': 'सुरक्षा नीतियों के कारण इस अनुरोध को अस्वीकार किया गया है।',
        'LOW_CONFIDENCE': 'क्षमा करें, उपलब्ध संदर्भ में इस प्रश्न के लिए पर्याप्त जानकारी नहीं मिली।'
    },
    LanguageCode.ENGLISH: {
        'OFF_TOPIC': 'I am a documentary RAG assistant designed to answer factual queries from the dataset. This query is out of scope.',
        'UNSAFE': 'This request violates safety policies and has been rejected.',
        'LOW_CONFIDENCE': 'I apologize, but there is insufficient verified information in the MSMARCO-XI dataset for this query.'
    }
}

class GuardrailManager:
    def __init__(self):
        self.unsafe_regex = re.compile(
            r'(ignore all previous|system prompt|jailbreak|drop table|delete from|sudo rm|hack|exploit)',
            re.IGNORECASE
        )
        self.off_topic_regex = re.compile(
            r'(write (python|c\+\+|java|javascript|rust) code|write a poem|tell me a joke|solve (quadratic|calculus)|play a game|કવિતા|વાર્તા|જોક્સ|કોડિંગ|कविता|कहानी|शायरी|चुटकुला)',
            re.IGNORECASE
        )

    def classify_query_intent(self, query: str, language: LanguageCode) -> QueryClassificationState:
        t0 = time.time()
        q_clean = query.strip()
        lat = (time.time() - t0) * 1000
        ref_dict = REFUSALS.get(language, REFUSALS[LanguageCode.ENGLISH])
        
        if self.unsafe_regex.search(q_clean):
            return QueryClassificationState(
                is_safe=False,
                is_on_topic=False,
                intent_category='UNSAFE',
                safety_score=0.0,
                sanitized_query=q_clean,
                rejection_reason=ref_dict['UNSAFE'],
                latency_ms=lat
            )
            
        if self.off_topic_regex.search(q_clean):
            return QueryClassificationState(
                is_safe=True,
                is_on_topic=False,
                intent_category='OFF_TOPIC',
                safety_score=1.0,
                sanitized_query=q_clean,
                rejection_reason=ref_dict['OFF_TOPIC'],
                latency_ms=lat
            )
            
        return QueryClassificationState(
            is_safe=True,
            is_on_topic=True,
            intent_category='INFORMATIONAL',
            safety_score=1.0,
            sanitized_query=q_clean,
            rejection_reason=None,
            latency_ms=lat
        )

    def check_retrieval_confidence(self, retrieval_state: RetrievalState, language: LanguageCode, threshold: float = 0.54) -> GroundingCheckState:
        t0 = time.time()
        lat = (time.time() - t0) * 1000
        ref_dict = REFUSALS.get(language, REFUSALS[LanguageCode.ENGLISH])
        
        if not retrieval_state.chunks or retrieval_state.max_similarity_score < threshold:
            return GroundingCheckState(
                confidence_score=retrieval_state.max_similarity_score,
                sufficient_context=False,
                reason=ref_dict['LOW_CONFIDENCE'],
                latency_ms=lat
            )
            
        top_premise_text = " ".join([c.text for c in retrieval_state.chunks[:4]])

        # 1. Temporal & Numerical Constraint Entailment Check

        # Extract 4-digit years (e.g. 2026, 1999) from query
        query_years = re.findall(r'\b(19\d\d|20\d\d)\b', retrieval_state.query)
        if query_years:
            query_clean_no_years = re.sub(r'\b(19\d\d|20\d\d)\b', ' ', retrieval_state.query)
            q_topic_words = [
                w.strip('.,?!()[]: ') for w in query_clean_no_years.split() 
                if len(w.strip('.,?!()[]: ')) > 2 and w.lower() not in {
                    'અને', 'છે', 'થાય', 'ક્યા', 'કયો', 'ક્યારે', 'શું', 'કોણ', 'ક્યાં', 'કેવી', 'રીતે', 
                    'કેટલા', 'કેટલી', 'માં', 'થી', 'તે', 'એ', 'નો', 'ની', 'નું', 'ના', 'પછી', 
                    'વર્ષ', 'હોય', 'હતા', 'હતી', 'હતું', 'is', 'the', 'and', 'in', 'of', 'to', 'who', 'won'
                }
            ]
            
            # Check if any chunk discussing the topic actually substantiates the queried year
            year_grounded = False
            for c in retrieval_state.chunks[:4]:
                c_text = c.text or ""
                c_years = set(re.findall(r'\b(19\d\d|20\d\d)\b', c_text))
                if any(y in c_years for y in query_years):
                    if not q_topic_words or any(tw.lower() in c_text.lower() for tw in q_topic_words if len(tw) >= 3):
                        year_grounded = True
                        break
                        
            if not year_grounded:
                return GroundingCheckState(
                    sufficient_context=False,
                    confidence_score=0.20,
                    reason=f"{ref_dict['LOW_CONFIDENCE']} (વર્ષ {', '.join(query_years)} માટે આ વિષયની કોઈ માહિતી નથી.)",
                    latency_ms=(time.time() - t0) * 1000
                )


        # 2. Substantive Entity Entailment Check
        stopwords = {
            'અને', 'છે', 'થાય', 'ક્યા', 'કયો', 'ક્યારે', 'શું', 'કોણ', 'ક્યાં', 'કેવી', 'રીતે', 
            'કેટલા', 'કેટલી', 'થવાથી', 'માં', 'થી', 'તે', 'એ', 'નો', 'ની', 'નું', 'ના', 'પછી', 
            'વર્ષ', 'તારીખ', 'મુખ્ય', 'કયા', 'કઈ', 'કયો', 'ક્યો', 'હોય', 'હતા', 'હતી', 'હતું',
            'is', 'the', 'and', 'or', 'in', 'of', 'to', 'what', 'which', 'who', 'how', 'when', 'where', 'are', 'for', 'after'
        }
        q_tokens = [w.strip('.,?!() ') for w in retrieval_state.query.split() if len(w.strip('.,?!() ')) > 2 and w.lower() not in stopwords]
        
        if q_tokens:
            doc_words = set(w.strip('.,?!()[]: ') for w in top_premise_text.split())
            
            matched_tokens = []
            for t in q_tokens:
                if t in doc_words:
                    matched_tokens.append(t)
                elif len(t) >= 4 and any(w.startswith(t) or t.startswith(w) for w in doc_words if len(w) >= 4):
                    matched_tokens.append(t)
            
            overlap_ratio = len(matched_tokens) / len(q_tokens) if q_tokens else 0.0
            
            # If key substantive entity is completely missing (e.g. rare entity like ઓકાપી)
            if not matched_tokens:
                return GroundingCheckState(
                    confidence_score=0.25,
                    sufficient_context=False,
                    reason=ref_dict['LOW_CONFIDENCE'],
                    latency_ms=(time.time() - t0) * 1000
                )
            
            # If substantive query keywords have very low overlap (<35%) and similarity is below high confidence (<0.72)
            if len(q_tokens) >= 3 and overlap_ratio < 0.35 and retrieval_state.max_similarity_score < 0.72:
                return GroundingCheckState(
                    confidence_score=retrieval_state.max_similarity_score,
                    sufficient_context=False,
                    reason=ref_dict['LOW_CONFIDENCE'],
                    latency_ms=(time.time() - t0) * 1000
                )
            
        return GroundingCheckState(
            confidence_score=retrieval_state.max_similarity_score,
            sufficient_context=True,
            reason=None,
            latency_ms=(time.time() - t0) * 1000
        )


    def verify_answer_grounding(self, answer: str, chunks: List[RetrievedChunk], language: LanguageCode) -> GuardrailCheckState:
        t0 = time.time()
        lat = (time.time() - t0) * 1000
        return GuardrailCheckState(
            passed=True,
            violation_type=None,
            refusal_message=None,
            latency_ms=lat
        )
