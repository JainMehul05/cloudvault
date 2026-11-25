# Search and RAG evaluation

All five fixed semantic cases in samples/expected_queries.json still rank the expected document first. Real scores and S3 evidence are in AWS_VERIFICATION_V2.json. Exact and hybrid phrase matching for “remotely managed” still finds object-storage.txt; a nonsense exact term yields no result. This small demonstration set is not a statistical benchmark.

Assistant retrieval adds FTS/BM25 and dense RRF, absolute/relative relevance gates, deduplication and multi-file diversity without replacing original vectors. Actual final questions retrieved encryption.txt and network-security.txt and generated complementary statements with their correct citations. The scoped water-conservation answer and natural-language follow-up also generated meaningful answers.

Absent revenue and unrelated cake questions abstained. A local malicious instruction fixture was ignored. Citation tests reject nonexistent IDs, invented quotations, unrelated quote content and unsafe URLs. Each generated atomic claim cites one source; the answer combines claims across documents.

Exploratory results exposed overcitation and weak passages. The final pipeline adds quote relevance and relative retrieval gates; exploratory outputs are retained separately from validated final runs in LOCAL_AI_INTEGRATION.json. Semantic relevance is not proof of entailment. Broader corpora, multilingual questions, ambiguous follow-ups and adversarial content require further evaluation.
