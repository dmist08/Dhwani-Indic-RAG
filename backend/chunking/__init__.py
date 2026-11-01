from .fixed_chunker import FixedSizeChunker
from .semantic_chunker import SemanticChunker
from .parent_child_chunker import ParentChildChunker
from .metadata_chunker import MetadataAwareChunker
from .contextual_chunker import ContextualChunker

def get_chunker(strategy: str):
    strategy = str(strategy).lower()
    if 'fixed' in strategy:
        return FixedSizeChunker()
    elif 'semantic' in strategy:
        return SemanticChunker()
    elif 'metadata' in strategy:
        return MetadataAwareChunker()
    elif 'contextual' in strategy:
        return ContextualChunker()
    elif 'parent' in strategy or 'ensemble' in strategy:
        return ParentChildChunker()
    else:
        return ParentChildChunker()
