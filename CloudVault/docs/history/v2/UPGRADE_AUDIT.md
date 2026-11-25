# CloudVault 2.0 upgrade audit

Baseline commit 6e5d7024cb89fc143bdbefa341cb8367d64e0e7b is tagged cloudvault-v1-baseline. Before changes, 24 backend and 8 frontend tests passed, as did TypeScript and production build. Real Boto3 confirmed the existing Sydney bucket and all four public-access blocks. SQLite's online backup API saved a private database and ID/key/vector-digest manifest in data/backups/pre-v2. Existing models, configuration, S3 objects and historical JSON remain untouched. Earlier reports are archived under docs/history/v1.

## Findings from source and running interface

The storage/extraction/MiniLM/SQLite pipeline is a good foundation. The UI has oversized promotional space, small low-contrast metadata, repeated cards, hardcoded colors and no cohesive theme tokens. File actions work but lack grid/density/selection preferences and detailed previews. Navigation has no command palette, recent workspace, persistent collapse or assistant. Literal phrase matching must be retained; factual questions need richer chunk-level lexical ranking. Search reloads all vectors for each request and does not cache repeated queries. There is no context builder, diverse multi-file evidence, generation runtime, citation validation or follow-up retrieval. Native dialogs need scroll/focus review; mobile/desktop behavior needs systematic testing.

## Hardware and approved local inference

Intel i5-13420H, 12 logical CPUs, 16 GB host RAM (approximately 3 GB initially free), NVIDIA RTX 4050 with 6,141 MiB VRAM (5,397 MiB initially free), approximately 19.9 GB disk free. No existing Ollama runtime was found. User explicitly approved local inference after discussing alternatives. Select qwen2.5:3b Q4_K_M (1.9 GB) with a bounded context and one generation at a time; benchmark on the actual machine. This model has the Qwen research license, distinct from the Apache license of the 1.5B model. Use official portable Ollama v0.40.18 (1.72 GB archive) and verify the published SHA256. Do not send private context to external APIs. MiniLM remains unchanged for embeddings.

## Upgrade decisions

Keep the architecture and original vectors. Add a restrained ink/slate design system, readable self-hosted typography, responsive shell, list/grid explorer, light/dark/system themes, local preferences and keyboard navigation. Add additive SQLite migrations, chunk-level hybrid evidence retrieval, context budgets, genuine local synthesis, valid clickable sources, insufficient-evidence responses and explicit extractive fallback. Preserve storage independence and localhost security. Final reports must distinguish actual model tests, real AWS, browser observations and remaining limits.
