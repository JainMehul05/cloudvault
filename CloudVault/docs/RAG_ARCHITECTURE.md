# Private document intelligence

CloudVault separates retrieval from generation. Original files stay in the existing private S3 bucket. Extraction, MiniLM embeddings, SQLite, question history and Qwen inference run on this laptop. No question or passage is sent to an external AI API.

## Pipeline

1. Validate the question and optional indexed-file scope. Allow one active answer.
2. For short/pronominal follow-ups, append the two most recent user questions. Retrieve again; previous generated answers are never treated as evidence.
3. Encode the bounded query with all-MiniLM-L6-v2. Compare normalized 384-dimensional vectors, retrieve FTS5/BM25 lexical candidates, and combine rankings using reciprocal rank fusion (k=60).
4. Gate weak matches (cosine >=0.28, or >=0.18 with two meaningful lexical overlaps). Deduplicate passages, prioritize different files, cap two chunks per file, seven sources and 10,000 context characters.
5. Send evidence IDs, filenames, section labels and passages to loopback Ollama. Qwen2.5 3B Q4_K_M returns structured claims, source IDs and exact supporting quotations.
6. Verify every cited ID and normalized exact quote against the retrieved passage. Reject generated URLs/citation markers. If every claim passes, the server adds citation markers and returns only cited sources.
7. Otherwise label the response as insufficient evidence or an explicit extractive fallback. Persist completed exchanges in local SQLite.

## Boundaries

Exact quotation validation proves provenance, not complete semantic entailment. A small model can still misinterpret a passage. Always inspect citations. Retrieval is a bounded sample, not proof that every page was read. Follow-up resolution uses recent questions rather than a separate rewriting model. There is no cross-encoder reranker or external agent/tool execution.

Responses are returned after completion rather than token streaming. The frontend remains usable, shows measured elapsed time, offers Stop, and aborts its request. The backend checks disconnection and cancels its inference HTTP task. Search/storage remain separate from inference. A cold MiniLM load can delay the first query; warm up before a demonstration.

