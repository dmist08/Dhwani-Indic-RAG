import time
from dataclasses import dataclass
import sys
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.generator import ResponseGenerator
from backend.schemas import RetrievedChunk, LanguageCode

@dataclass
class GeneratedAnswer:
    text: str
    grounded: bool
    generation_ms: float
    model: str = "dhvani-indic-rag"

try:
    from nltk.corpus import stopwords
    ENGLISH_STOPWORDS = set(stopwords.words("english"))
except Exception:
    ENGLISH_STOPWORDS = {"what", "is", "the", "in", "and", "of", "to", "a", "an", "how", "where", "who", "which", "are", "for", "on", "with", "as", "at", "by", "from", "much", "does", "it", "why", "when"}

_generator = ResponseGenerator()

def generate_answer(query: str, results: list) -> GeneratedAnswer:
    t0 = time.perf_counter()
    if not results:
        return GeneratedAnswer(
            text="The provided documents do not contain sufficient verified information.",
            grounded=False,
            generation_ms=(time.perf_counter() - t0) * 1000,
            model="dhvani-indic-rag"
        )
    
    top_score = getattr(results[0], "score", 0.0)
    
    # Clean text across all results
    cleaned_chunks = []
    for i, r in enumerate(results):
        txt = _generator.clean_context_prefix(getattr(r, "text", str(r)))
        src = getattr(r, "source", f"doc_{i}")
        if txt and len(txt) > 15:
            cleaned_chunks.append(RetrievedChunk(
                chunk_id=f"chk_{i}",
                doc_id=str(src),
                text=txt,
                score=getattr(r, "score", 0.8),
                chunk_strategy="contextual"
            ))

    if not cleaned_chunks:
        return GeneratedAnswer(
            text="The provided documents do not contain sufficient verified information.",
            grounded=False,
            generation_ms=(time.perf_counter() - t0) * 1000,
            model="dhvani-indic-rag"
        )

    clean_q = re.sub(r"\([^)]*\)", "", query).strip()
    q_indic = any("\u0900" <= c <= "\u0AFF" for c in query)
    target_q = clean_q if q_indic else query

    QUESTION_INTERROGATIVES = {"what", "when", "where", "who", "which", "why", "how", "does", "did", "can", "could", "would", "should", "makes", "special", "mean"}

    # Substantive query keywords with full Unicode Indic script support
    q_words = [w for w in re.findall(r"[\w\u0900-\u097F\u0A80-\u0AFF]+", target_q.lower()) if w not in ENGLISH_STOPWORDS and w not in QUESTION_INTERROGATIVES and len(w) > 1]
    if not q_words:
        q_words = [w for w in re.findall(r"[\w\u0900-\u097F\u0A80-\u0AFF]+", target_q.lower()) if w not in ENGLISH_STOPWORDS and len(w) > 1]

    # Prioritize chunks that match query script if available
    matching_chunks = [c for c in cleaned_chunks if any("\u0900" <= ch <= "\u0AFF" for ch in c.text) == q_indic]
    candidate_pool = matching_chunks if matching_chunks else cleaned_chunks

    best_cand_score = 0.0
    best_cand_text = ""
    best_doc_idx = 1
    best_matched_words = []
    best_cov = 0.0

    noise_pattern = re.compile(
        r"(rate this definition|wiktionary|definitions for|votes|\b0\.00\b|click here|all rights reserved|bedienungsanleitung|driver download|recent changes:|meanings and translations of the word|recent apps and files|please call:|call:\s*1-8|customercare@|store service customer support|ગ્રાહક સપોર્ટ માટે|કૉલ કરો:\s*1-8|કૉલ કરો:\s*1-800|कॉल करें:\s*1-8)",
        re.I
    )

    for c_idx, c in enumerate(candidate_pool[:3]):
        # Discard whole chunks that are purely metadata noise
        if noise_pattern.search(c.text) and len(c.text) < 220:
            continue

        sents = [s.strip() for s in re.split(r"(?<!\d)[.!?।|\n](?!\d)\s*", c.text) if len(s.strip()) > 15]
        for s in sents:
            s_lower = s.lower()
            # Ignore question sentences as answers
            if s.endswith("?") or s_lower.startswith(("can i", "how do i", "what is the best way")):
                continue
            if noise_pattern.search(s):
                continue

            s_words = set(re.findall(r"[\w\u0900-\u097F\u0A80-\u0AFF]+", s_lower))
            s_stems = {sw.rstrip("s").rstrip("ing").rstrip("ed") for sw in s_words}

            cand_indic = any("\u0900" <= c <= "\u0AFF" for c in s)
            is_cross = (q_indic != cand_indic)

            matched_words = [
                w for w in q_words 
                if w in s_words 
                or w.rstrip("s").rstrip("ing").rstrip("ed") in s_stems 
                or any(w in sw or sw in w for sw in s_words if len(w) >= 3)
            ]

            chunk_score = c.score if hasattr(c, "score") and c.score else 0.75

            if is_cross:
                def_boost = 0.25 if any(v in s for v in ["છે", "હોય છે", "કહેવાય છે", "એટલે", "છે.", "है", "होता है", "कहा जाता है", "अर्थात", "is", "refers to", "means"]) else 0.0
                score = (chunk_score * 2.0) + (0.4 / (c_idx + 1)) + def_boost
                cov = 1.0 if chunk_score >= 0.70 else 0.5
            else:
                cov = len(matched_words) / max(1, len(q_words))
                score = cov * 2.0 + (0.3 / (c_idx + 1))

            if score > best_cand_score:
                clean_s = re.sub(r"^[\s\)\]\}\.\,\-\:\;૧૨૩૪૫૬૭૮૯૦0-9]+", "", s).strip()
                best_cand_score = score
                best_cand_text = clean_s
                best_doc_idx = c_idx + 1
                best_matched_words = matched_words
                best_cov = cov

    cand_indic = any("\u0900" <= c <= "\u0AFF" for c in best_cand_text)
    is_cross_lingual = (q_indic != cand_indic)

    # For single-term queries (e.g. 'what is ruthenian'), the candidate sentence must directly define the term as a main subject
    is_valid_single_term = True
    if len(q_words) == 1 and not is_cross_lingual:
        term = q_words[0]
        term_def_pattern = re.compile(r"\b" + re.escape(term) + r"\b(?:\s+(?:is|are|means|refers|definition)|[:,])", re.I)
        if not term_def_pattern.search(best_cand_text):
            is_valid_single_term = False

    # Strict Grounding Decision:
    if is_cross_lingual:
        is_grounded = (top_score >= 0.70 and best_cand_score >= 1.20 and len(best_cand_text) >= 20)
    else:
        if len(q_words) >= 6:
            min_cov_req = 0.25 if top_score >= 0.60 else 0.40
        elif len(q_words) >= 4:
            min_cov_req = 0.35 if top_score >= 0.60 else 0.50
        elif len(q_words) == 3:
            min_cov_req = 0.50
        else:
            min_cov_req = 0.50

        is_grounded = (
            bool(best_matched_words) and
            is_valid_single_term and
            best_cov >= min_cov_req and 
            best_cand_score >= 0.70 and 
            top_score >= 0.40 and 
            len(best_cand_text) >= 20
        )

    if not is_grounded:
        return GeneratedAnswer(
            text="The provided documents do not contain sufficient verified information to answer this question.",
            grounded=False,
            generation_ms=(time.perf_counter() - t0) * 1000,
            model="dhvani-indic-rag"
        )

    is_gujarati = any("\u0A80" <= c <= "\u0AFF" for c in query)
    is_devanagari = any("\u0900" <= c <= "\u097F" for c in query)
    
    if is_gujarati:
        lang = LanguageCode.GUJARATI
    elif is_devanagari:
        lang = LanguageCode.HINDI
    else:
        lang = LanguageCode.ENGLISH
        
    state = _generator.generate_answer(query, cleaned_chunks, language=lang)
    
    return GeneratedAnswer(
        text=state.generated_text,
        grounded=True,
        generation_ms=(time.perf_counter() - t0) * 1000,
        model="dhvani-indic-rag"
    )
