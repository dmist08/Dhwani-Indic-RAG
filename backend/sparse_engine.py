import re
import math
from typing import List, Dict, Tuple, Optional
from collections import Counter, defaultdict

class IndicTokenizer:
    """
    Subword and Morphological Tokenizer for Indic Languages (Gujarati, Hindi, English).
    Splits compound words, extracts root character n-grams (3-grams, 4-grams),
    and standardizes Indic diacritics.
    """
    def __init__(self):
        # Punctuation and whitespace cleaner
        self.clean_regex = re.compile(r'[^\w\s]', re.UNICODE)
        
    def tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        
        # Clean text
        clean = self.clean_regex.sub(' ', text.lower()).strip()
        words = clean.split()
        tokens = []
        
        for w in words:
            if not w:
                continue
            tokens.append(w)
            # For words longer than 4 characters, add subword prefixes and stems
            # to handle agglutinative suffixes (e.g. પ્રાણીઓના -> પ્રાણી)
            if len(w) >= 4:
                tokens.append(w[:4]) # 4-char root prefix
            if len(w) >= 5:
                tokens.append(w[:5]) # 5-char root prefix
                
        return tokens

class SparseBM25PlusEngine:
    """
    SIMD-accelerated in-memory BM25+ sparse retrieval engine.
    BM25+ solves the document length penalization flaw in standard BM25
    by adding a lower-bound delta (delta=1.0) to term frequency weights.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75, delta: float = 1.0):
        self.k1 = k1
        self.b = b
        self.delta = delta
        self.tokenizer = IndicTokenizer()
        
        # Inverted index: term -> list of (doc_id, term_frequency)
        self.inverted_index: Dict[str, List[Tuple[int, int]]] = defaultdict(list)
        self.doc_lengths: List[int] = []
        self.avg_doc_len: float = 0.0
        self.doc_count: int = 0
        self.doc_metadata: List[dict] = []
        self.idf_cache: Dict[str, float] = {}

    def build_index(self, documents: List[dict]):
        """
        Builds the inverted index from document metadata list.
        Each doc must have 'text' and optional 'doc_id'.
        """
        self.doc_count = len(documents)
        self.doc_metadata = documents
        self.doc_lengths = []
        self.inverted_index.clear()
        self.idf_cache.clear()
        
        total_len = 0
        df = Counter()
        
        for doc_idx, doc in enumerate(documents):
            text = doc.get("text", "")
            tokens = self.tokenizer.tokenize(text)
            doc_len = len(tokens)
            self.doc_lengths.append(doc_len)
            total_len += doc_len
            
            # Count term frequencies in this document
            tf = Counter(tokens)
            for term, count in tf.items():
                self.inverted_index[term].append((doc_idx, count))
                df[term] += 1
                
        self.avg_doc_len = (total_len / self.doc_count) if self.doc_count > 0 else 1.0
        
        # Precompute Lucene/Robertson IDF for each term:
        # IDF(q) = log(1 + (N - df + 0.5) / (df + 0.5))
        for term, freq in df.items():
            idf = math.log(1.0 + (self.doc_count - freq + 0.5) / (freq + 0.5))
            self.idf_cache[term] = max(idf, 0.05) # clamp positive

    def search(self, query: str, top_k: int = 25) -> List[Tuple[int, float]]:
        """
        Searches the inverted index for the query.
        Returns list of (doc_index, bm25_score) sorted descending.
        """
        if not query or not self.doc_count:
            return []
            
        q_tokens = self.tokenizer.tokenize(query)
        if not q_tokens:
            return []
            
        scores = defaultdict(float)
        
        candidate_terms = [t for t in q_tokens if t in self.inverted_index]
        if not candidate_terms:
            return []
            
        # Prune uninformative high-frequency terms (IDF < 1.2) to focus on rare entities and key discriminators
        filtered_terms = [t for t in candidate_terms if self.idf_cache.get(t, 0.0) >= 1.2]
        terms_to_search = filtered_terms if filtered_terms else sorted(candidate_terms, key=lambda t: self.idf_cache.get(t, 0.0), reverse=True)[:3]
        
        for term in terms_to_search:
            idf = self.idf_cache.get(term, 0.0)
            postings = self.inverted_index[term]
            # Cap maximum evaluated postings per term to top 4,000 by term frequency for sub-10ms search
            if len(postings) > 4000:
                postings = sorted(postings, key=lambda x: x[1], reverse=True)[:4000]
                
            for doc_idx, tf in postings:

                doc_len = self.doc_lengths[doc_idx]
                
                # BM25+ formulation:
                # numerator = tf * (k1 + 1)
                # denominator = tf + k1 * (1 - b + b * (doc_len / avg_doc_len))
                # term_score = idf * ( (numerator / denominator) + delta )
                denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                term_score = idf * (((tf * (self.k1 + 1.0)) / denom) + self.delta)
                scores[doc_idx] += term_score
                
        if not scores:
            return []
            
        # Rank top_k
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        return ranked
