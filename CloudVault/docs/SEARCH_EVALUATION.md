# Search evaluation

Final predefined collection: ten cases in samples/expected_queries.json and samples/extended_queries.json. All ten expected documents ranked first through actual S3 Vectors; top-1, recall@5 and MRR@5 were 1.0 on this small curated set. Local comparison using the same stored vectors also ranked all ten first. This is a demonstration benchmark, not general 100% search accuracy.

Raw per-query results/provider/latency: RETRIEVAL_EVALUATION_V3.json. The first request took 4,532 ms including connection/credential overhead; remaining requests were about 475–772 ms. Timing excludes the separate comparison-process model load. No claim is made that cloud retrieval is faster than an already cached local matrix.

The earlier run scored 9/10 while water-conservation.txt was absent after an application deletion. That evidence remains in history/v3/retrieval-before-water-restoration.json. The user-requested normal upload restored it under a new UUID; it now ranks first. No corpus replacement or rewriting of expected answers was used to improve this score.

Actual generated multi-source security answers, scoped water answers, follow-ups, unrelated-question abstention and explicit fallback are recorded in AWS_RAG_VERIFICATION.json, AWS_WATER_RESTORATION_VERIFICATION.json and LOCAL_AI_INTEGRATION.json. CONTRADICTION_EVALUATION_V3.json records Qwen presenting both conflicting 30/90-day policies with distinct citations and no invented resolution. Manual evidence review is required alongside automated quote checks.

Retrieval changes: cloud scope/model prefilter, current-key validation, FTS/dense RRF, relative threshold, diversity and bounded context. A cross-encoder was not added: this set has no ranking misses to demonstrate a measured gain, and another model would consume memory/disk on a 16 GB laptop. Larger independent/adversarial/multilingual evaluation remains future work.
