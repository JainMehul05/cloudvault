# Measured performance

Evidence: BENCHMARK_BASELINE.json and BENCHMARK_V2.json. scripts/benchmark.py makes one first request plus five warm requests per endpoint against localhost and records milliseconds. These are small-corpus developer measurements, not production capacity claims.

| Endpoint | Baseline warm median ms | V2 warm median ms |
|---|---:|---:|
| Health | 3.61 | 5.02 |
| File listing | 12.15 | 19.69 |
| Exact keyword | 13.59 | 17.72 |
| Semantic | 38.02 | 21.11 |
| Hybrid | 36.19 | 19.95 |

V2's first semantic request took 22,303 ms because its process had not loaded MiniLM, while baseline was already warm. These first-request measurements are not comparable. The additional small endpoint overhead is visible above. Repeated semantic/hybrid requests benefit from a cached vector matrix and bounded query embedding LRU; file metadata/status/index changes invalidate the snapshot.

Frontend production build uses a lazy assistant chunk and self-hosted font subsets. Original preview images are bounded and re-encoded. File pagination limits DOM size, upload polling follows actual pending files, and inference runs over an async local HTTP request rather than blocking the event loop.

Generation timings and responsiveness must be read from the actual integration evidence produced after model installation, not inferred from parameter count. Context is capped, one model is resident and one generation runs at once. No latency SLA is claimed.

