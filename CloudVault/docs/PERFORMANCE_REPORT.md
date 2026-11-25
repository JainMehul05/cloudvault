# Measured performance and limits

Production build: initial JavaScript 241.66 kB (76.08 kB gzip), lazy workspace about 66.63 kB (19.71 kB gzip), lazy assistant about 13.19 kB (4.71 kB gzip), CSS 72.04 kB (14.05 kB gzip), genuine product answer image 79.17 kB. Inter is self-hosted. Native SVG charts avoid a chart dependency; route/component splitting preserves a lighter landing entry.

Final ten actual cloud semantic requests: first 4.532 s, remaining approximately 0.475–0.772 s, including local HTTP/retrieval work. The report records AWS-call latency separately. Cloud persistence is a meaningful architectural capability, not a claim to beat local RAM latency. Metadata uses a two-second collection cache and bounded pagination; pending writes remain visible through the local overlay.

Restored water scoped RAG took 11.181 s including 0.669 s retrieval and about 7.784 s model load. Historical validated warm local multi-file/follow-up requests took about 2.285/2.234 s; an early cold initialization took 141.963 s. These are different cache/hardware states, not interchangeable averages. AWS_RAG_VERIFICATION.json records another cold cloud-backed answer around 25 s. Use scripts/warmup.ps1 before an evaluation.

Inspected hardware: i5-13420H/12 logical CPUs, 16 GB RAM, RTX 4050 Laptop GPU with 6,141 MiB VRAM. Existing Qwen2.5 3B Q4_K_M is 1.9 GB; actual Ollama inspection showed 100% GPU and about 2.3 GB resident. One generation/model at a time, 6,144-token context and bounded evidence prevent unbounded memory use. MiniLM stays on CPU; no extra reranker or model downloaded.

The UI remains asynchronous with elapsed time, Stop, AbortController, explicit API cancellation and a one-answer lock. Historical actual cancellation returned in 0.19 s. Outbound AWS SDK calls run outside the UI event loop. Network/credential delays, model unloading, other GPU apps and large files can increase latency. No guaranteed SLA, fabricated Lighthouse score or invented load-test throughput is reported.

Final browser runs also recorded a cold99.539s answer (86.113s retrieval/import) and warm3.892/4.615s answers, with a2.4s follow-up before the stricter grounding pass. Later guarded generation/correction can take longer or return extracts. See FINAL_MODEL_VERIFICATION_V3.json and FINAL_GROUNDING_VERIFICATION_V3.json; these include experimental failures, not just successful timings.
