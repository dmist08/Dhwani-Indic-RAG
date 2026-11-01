import React, { useState } from 'react';

export default function ProvenanceLedger({ chunks }) {
  const [expandedChunkId, setExpandedChunkId] = useState(null);

  if (!chunks || chunks.length === 0) return null;

  const primaryChunk = chunks[0];
  const supportingChunks = chunks.slice(1);

  const toggleExpand = (id) => {
    setExpandedChunkId(expandedChunkId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dfd2bc] pb-2">
        <h3 className="font-serif text-sm font-bold text-[#12161f] tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a83226]" />
          <span>Source Documents & Provenance Ledger</span>
        </h3>
        <span className="font-mono text-xs text-[#64748b]">
          {chunks.length} passages retrieved
        </span>
      </div>

      {/* Primary Grounding Document (Dominant Source Folio) */}
      {primaryChunk && (
        <div className="p-6 rounded-2xl bg-[#fdfcf9] border-2 border-[#a83226]/40 shadow-md relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-3 border-b border-[#ede4d3] pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-[#a83226]/15 border border-[#a83226]/40 text-[#a83226]">
                [1] Primary Source
              </span>
              <span className="font-serif text-xs font-bold text-[#12161f]">
                MSMARCO Indic Gujarati Corpus
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#b87a28] bg-[#ede4d3]/70 px-2.5 py-0.5 rounded">
              {(primaryChunk.score * 100).toFixed(1)}% Match
            </span>
          </div>

          {/* Excerpt Body with Gujarati Vertical Metrics */}
          <div className="space-y-3">
            <p className="font-sans text-sm leading-[1.85] text-[#12161f] pb-1">
              {expandedChunkId === primaryChunk.chunk_id && primaryChunk.parent_context
                ? primaryChunk.parent_context
                : primaryChunk.text}
            </p>
          </div>

          {/* Context Expansion Trigger */}
          <div className="mt-4 pt-3 border-t border-[#ede4d3] flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#64748b]">
              Chunking Algorithm: {primaryChunk.chunk_strategy}
            </span>
            <button
              onClick={() => toggleExpand(primaryChunk.chunk_id)}
              className="font-serif text-xs font-bold text-[#a83226] hover:text-[#8e271d] transition-colors flex items-center gap-1.5 cursor-pointer bg-[#ede4d3]/50 hover:bg-[#ede4d3] px-3 py-1 rounded-lg"
            >
              <span>
                {expandedChunkId === primaryChunk.chunk_id
                  ? 'Collapse Context'
                  : 'Expand to Full Paragraph Envelope (Parent Context)'}
              </span>
              <span className="font-mono">{expandedChunkId === primaryChunk.chunk_id ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Supporting Documents (Rank 2, 3, 4) */}
      {supportingChunks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {supportingChunks.map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#fdfcf9] border border-[#dfd2bc] hover:border-[#b87a28]/60 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#ede4d3]">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#ede4d3] text-[#12161f]">
                    [{i + 2}] Supporting
                  </span>
                  <span className="font-mono text-[11px] text-[#b87a28] font-bold">
                    {(c.score * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="font-sans text-xs leading-[1.75] text-[#2d3748] line-clamp-4 hover:line-clamp-none transition-all pb-1">
                  {expandedChunkId === c.chunk_id && c.parent_context ? c.parent_context : c.text}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#ede4d3] flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#64748b]">{c.chunk_strategy}</span>
                <button
                  onClick={() => toggleExpand(c.chunk_id)}
                  className="font-serif text-[11px] font-bold text-[#b87a28] hover:text-[#9c641d] transition-colors cursor-pointer"
                >
                  {expandedChunkId === c.chunk_id ? 'Less' : 'More'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
