# Video Presentation Scripts and Storyboards

This document contains complete, timed scripts and screen-recording storyboards for both the 90-Second Technical Process Video and the Full Demo Video for Hackathon Task 2 (Voice-Enabled Indic RAG).

---

## 1. 90-Second Technical Process Video Script

**Target Duration**: 90 Seconds
**Goal**: Explain the architectural engineering, the Indic chunking ablation study, the low-latency vector retrieval system, and the 3-layer guardrail defense.

### Scene 1: The Problem and Indic Morphological Challenge (0:00 to 0:15)
- **Visual**: Screen recording showing Indic script tokenization challenges in Gujarati and Hindi, highlighting compound characters (ligatures) and virama boundaries.
- **Voiceover**: Indic languages present unique challenges for voice RAG systems: morphological complexity, sentence boundary ambiguities, and acoustic transcription noise in Indic speech. For Hackathon Task 2, we engineered Dhvani-RAG, an Indic-first voice retrieval system designed for sub-100 millisecond retrieval and zero-hallucination grounding.

### Scene 2: 5-Way Chunking Strategy Ablation (0:15 to 0:40)
- **Visual**: Screen showing the 5-Way Ablation Table on the UI (frontend) and the Python benchmark harness (backend/ablation.py). Highlighting the Contextual Prefix (82.5% Precision) and Semantic Boundary methods.
- **Voiceover**: We conducted an empirical ablation across five chunking strategies on three thousand Gujarati MSMARCO documents. Standard fixed-window chunking severed Indic phrase boundaries, yielding only 67.5% Precision. Our Contextual Prefix strategy achieved 82.5% Precision and 100% Recall by prepending document metadata, while Semantic Boundary chunking delivered the lowest latency at 56.2 milliseconds.

### Scene 3: Low-Latency Telemetry (P50 / P70 / P100) (0:40 to 0:65)
- **Visual**: Live Latency HUD on the dashboard demonstrating P50, P70, and P100 metrics. Showing in-memory Qdrant HNSW vector search executing in 1.00 ms and dense multilingual embeddings in 62.2 ms.
- **Voiceover**: Retrieval speed is critical for natural voice interaction. Using dense multilingual embeddings and an in-memory Qdrant HNSW index, our vector search completes in just 1 millisecond. Combined with Sarvam AI Indic STT and fast LLM generation, our entire retrieval stage hits a P50 of 63.3 milliseconds, well within our real-time budget.

### Scene 4: 3-Layer Guardrail Defense and Refusal Engine (0:65 to 0:85)
- **Visual**: Demonstration of the 1-click test queries: Off-topic coding injection blocked in 0 milliseconds, Gujarati creative poetry safely refused, and out-of-domain quantum query filtered via cosine confidence thresholding.
- **Voiceover**: To guarantee safety and grounding, we built a 3-layer guardrail system: Layer 1 blocks jailbreaks and off-topic requests in 0 milliseconds. Layer 2 rejects low-confidence, out-of-domain queries via cosine similarity thresholding. Layer 3 verifies document citations, ensuring answers cite verified grounding docs.

### Scene 5: Wrap-up and Open-Source Artifacts (0:85 to 0:90)
- **Visual**: Full dashboard overview and GitHub repository structure.
- **Voiceover**: Dhvani-RAG delivers fast, grounded, and safe voice search for Indic languages. Full code, benchmark datasets, and evaluation scripts are available on GitHub.

---

## 2. 3-Minute Comprehensive Demo Video Script

**Target Duration**: 180 Seconds (3 Minutes)
**Goal**: Live walkthrough of the full application, testing voice queries, switching chunking strategies, exploring grounding cards, and verifying telemetry.

### Act 1: Live Voice Query Execution in Gujarati (0:00 to 0:45)
- **Action**: Open http://localhost:5173. Click the Sarvam AI Microphone button. Speak or trigger the Gujarati MSMARCO query: વોશિંગ્ટન રાજ્યમાં થોર્પ હાઇવે ક્યાં છે (Where is Thorpe Highway in Washington State?). Observe the dynamic Web Audio visualizer reacting to the voice stream. Inspect the generated response with inline source attribution: [Doc 1].
- **Narration**: Welcome to the Dhvani-RAG live demonstration. Let us start with a natural spoken query in Gujarati. Notice the live audio waveform visualizer capturing speech. The audio streams directly to our Indic voice pipeline. Within 220 milliseconds total latency, the system retrieves the top four grounding passages, verifies grounding, and generates a factual Gujarati response with verified document citations.

### Act 2: Expandable Passage Cards and Document Attribution (0:45 to 1:15)
- **Action**: Scroll through the retrieved grounding document cards below the answer. Point out the Document ID [Doc 1], similarity score (e.g. 74.8%), and chunking strategy. Click Expand Parent Context to reveal the full parent context envelope around the matched chunk.
- **Narration**: Underneath the answer, judges can inspect every retrieved passage. Each card displays the similarity score, chunk strategy, and an expandable Parent Context view. This Parent-Child architecture ensures the vector search matches exact sentences while providing the language model with full paragraph context.

### Act 3: Language Switching and Chunking Strategy Picker (1:15 to 1:45)
- **Action**: Use the top navigation bar to switch between Gujarati, Hindi, and English. Change the chunking strategy dropdown from Parent-Child to Contextual Prefix and Semantic Boundary. Run a query in Hindi or English and observe language alignment.
- **Narration**: Dhvani-RAG supports multilingual Indic interactions. We can switch between Gujarati, Hindi, and English with one click. We can also dynamically swap chunking algorithms in real time to compare how Contextual Prefix and Semantic Boundary strategies adapt to different document corpora.

### Act 4: Live Telemetry and Ablation Tab Walkthrough (1:45 to 2:15)
- **Action**: Click on the P50 / P70 / P100 Latency tab. Show the progress bars and exact percentiles (Multilingual Embedding P50: 62.2ms, Vector Search P50: 1.0ms, Combined Retrieval P50: 63.3ms). Click on the 5-Way Ablation tab to review the empirical benchmark across Precision, Recall, and MRR.
- **Narration**: In the Latency Tab, we expose real-time percentiles for every pipeline component. The HNSW vector search takes only 1 millisecond, and dense multilingual embedding runs in 62 milliseconds. In the Ablation tab, judges can inspect the full empirical benchmark across 3,000 documents, confirming why Contextual and Semantic chunking outperform naive fixed-length windows.

### Act 5: Adversarial Guardrail and Safety Verification (2:15 to 3:00)
- **Action**: Click on the Guardrail Defense tab. Click the quick demo button Off-Topic Code Attack -> Verify immediate refusal with explanation. Click Gujarati Poetry Attack -> Verify safety refusal in Gujarati. Click System Jailbreak Attack -> Verify Layer 1 regex block. Click Out-of-Domain Query -> Verify Layer 2 cosine confidence rejection.
- **Narration**: Finally, let us test the 3-layer guardrail defense against adversarial attacks. When we submit a prompt injection attempt, Layer 1 intercepts and blocks it in 0 milliseconds. When we ask for creative poetry, the system politely refuses, preserving its grounding purpose. When an out-of-domain quantum equation is submitted, Layer 2 identifies low cosine similarity and safely rejects it. All five test cases pass with 100% reliability, providing an enterprise-grade, Indic voice RAG system.
