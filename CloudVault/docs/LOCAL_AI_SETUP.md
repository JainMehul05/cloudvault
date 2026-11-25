# Existing local AI — 3.0 operation

The approved Qwen2.5 3B Q4_K_M and MiniLM are already present. **Do not download models again.** Normal startup is scripts/start.ps1 followed by scripts/warmup.ps1. The runtime stays loopback-only, one model/answer at a time; use scripts/stop-ai.ps1 only to stop the owned process.

Ollama's remote cloud features remain disabled. This does not mean AWS data services are disabled: 3.0 uses private S3/DynamoDB/S3 Vectors and bounded serverless processing. Embedding generation and Qwen inference remain local; full extracted text/conversations remain local except explicitly approved non-sensitive derived fixtures. Hardware/model/license details below remain applicable.


---

## Preserved implementation detail

# Local generation setup

The inspected machine has an Intel i5-13420H (12 logical CPUs), 16 GB RAM and an NVIDIA RTX 4050 Laptop GPU with 6,141 MiB VRAM. Initially about 3 GB host RAM, 5,397 MiB GPU memory and 19.9 GB disk were available.

Selected model: **qwen2.5:3b**, Q4_K_M, approximately **1.9 GB**, 3.09B parameters. It uses the Qwen research license; review its terms before redistribution or a different use. This is distinct from the Apache-licensed 1.5B variant. One model is used, with a 6,144-token runtime context, four CPU threads and one generation at a time. The GPU is preferred automatically; CPU operation is slower. Keep several GB of RAM and disk available; setup requires 8 GiB disk headroom for archive, extraction and weights.

## Commands (PowerShell, CloudVault directory)

```powershell
.\scripts\setup-ai.ps1
.\scripts\warmup.ps1
.\scripts\start.ps1
```

Setup downloads official portable Ollama v0.40.18 (approximately 1.72 GB archive), verifies SHA256, extracts it under .runtime/ollama and pulls the single approved model. Weights stay in data/ollama-models. Rerunning resumes downloads. Standard setup does not silently download generation weights.

Start binds Ollama to 127.0.0.1:11434 and the app to 127.0.0.1:8000. Cloud features are disabled. Startup can reuse an existing loopback runtime; it does not kill unrelated processes. scripts/stop.ps1 stops the owned app; scripts/stop-ai.ps1 stops only a separately tracked owned runtime. Stored files/search still work if generation is unavailable.

Settings shows actual runtime readiness. Use Ask CloudVault's Source excerpts only option for an explicit fallback. Warmup can take longer on first load. Do not expose either port publicly.

Official references: [model](https://ollama.com/library/qwen2.5:3b), [Windows runtime](https://docs.ollama.com/windows), [structured outputs](https://docs.ollama.com/capabilities/structured-outputs). Model licenses are also available through ollama show --license qwen2.5:3b.

