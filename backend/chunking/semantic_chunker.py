import re
from typing import List, Dict, Any

class SemanticChunker:
    def __init__(self, max_chunk_words: int = 120, min_chunk_words: int = 25):
        self.max_chunk_words = max_chunk_words
        self.min_chunk_words = min_chunk_words
        self.sentence_regex = re.compile(r'([।|?!.\n\r]+)')

    def split_sentences(self, text: str) -> List[str]:
        parts = self.sentence_regex.split(text)
        sentences = []
        for i in range(0, len(parts), 2):
            s = parts[i].strip()
            punct = parts[i+1] if i+1 < len(parts) else ''
            full_s = (s + ' ' + punct).strip()
            if full_s:
                sentences.append(full_s)
        return sentences if sentences else [text]

    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        text = text.strip()
        if not text:
            return []
        
        sentences = self.split_sentences(text)
        chunks = []
        current_chunk = []
        current_word_count = 0

        for sentence in sentences:
            s_words = len(sentence.split())
            if current_word_count + s_words > self.max_chunk_words and current_chunk:
                chunk_str = ' '.join(current_chunk)
                chunks.append({
                    'text': chunk_str,
                    'parent_context': text,
                    'strategy': 'semantic',
                    **(metadata or {})
                })
                current_chunk = [sentence]
                current_word_count = s_words
            else:
                current_chunk.append(sentence)
                current_word_count += s_words

        if current_chunk:
            chunk_str = ' '.join(current_chunk)
            chunks.append({
                'text': chunk_str,
                'parent_context': text,
                'strategy': 'semantic',
                **(metadata or {})
            })

        return chunks
