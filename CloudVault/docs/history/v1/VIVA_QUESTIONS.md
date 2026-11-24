# Viva questions and concise answers

1. **What problem does CloudVault solve?** It retrieves stored documents by meaning or exact content when the user cannot remember filenames.
2. **What is cloud computing?** On-demand access to remotely managed computing resources through network APIs.
3. **Which AWS service does this application use?** Amazon S3 for private original-file storage. STS was used for identity verification during setup.
4. **Does the website run on AWS?** No. React assets, FastAPI, SQLite and AI inference run on this laptop.
5. **Why is this still a cloud project?** Its authoritative originals are actually uploaded to and retrieved from a remote AWS region through authenticated service APIs.
6. **What is object storage?** Storage of byte objects addressed by unique keys, with associated metadata, rather than a traditional filesystem hierarchy.
7. **What is an S3 bucket?** A named container for objects in a selected AWS region.
8. **What is an object key?** The object's exact identifier within its bucket; CloudVault uses a prefix, UUID and sanitized original filename.
9. **Are S3 folders real directories?** No; slash-separated prefixes are key naming conventions. CloudVault does not pretend to implement logical folders.
10. **Why use UUID keys?** They avoid collisions and allow independent uploads with identical filenames.
11. **Why Sydney?** The account's permitted region is ap-southeast-2 and the existing bucket is there.
12. **What is IAM?** AWS's identity and policy system controlling which authenticated principals may call which actions on which resources.
13. **How does the app authenticate to AWS?** Boto3 resolves the existing default profile's supported temporary browser-login session and refreshes it when possible.
14. **Are credentials in React?** No. Only the local Python service communicates with S3 using its AWS profile.
15. **What happens when login expires?** Cloud actions show an actionable error; the user completes `aws login --profile default` and retries.
16. **Is the bucket public?** The tested bucket had all four public-access-block flags enabled. The application does not make public ACLs or policies.
17. **What is a presigned URL?** A time-limited signed URL granting one constrained S3 action. This implementation instead proxies original bytes through the authenticated backend.
18. **What is Boto3?** AWS's Python SDK. CloudVault uses its official S3 client with TLS verification, retries and timeouts.
19. **Why FastAPI?** It gives typed validation, structured errors, REST routing, OpenAPI and local serving in a small readable codebase.
20. **What is REST?** An HTTP resource interface; files use GET, POST, PATCH and DELETE for retrieval, creation, rename and deletion.
21. **Why React and TypeScript?** React composes interactive reusable UI; TypeScript catches incompatible client-side data usage before the production build.
22. **Why SQLite?** It provides local persistent transactions and relationships without provisioning a separate database server.
23. **Where are vectors persisted?** Float32 BLOBs in SQLite chunks, with text, section, model identifier and actual dimension.
24. **What is text extraction?** Converting supported document content into textual sections without executing uploaded files.
25. **Which formats are indexed?** PDF, DOCX, XLSX and configured plain-text/source formats, including TXT, Markdown, CSV, JSON and inert HTML text.
26. **Can it search images or scanned PDFs?** Not their visual contents. They need OCR, which is not implemented. Storage and download still work.
27. **What is an embedding?** A numerical representation of text learned by a language model; related meanings tend to have similar vector directions.
28. **Which embedding model is used?** sentence-transformers/all-MiniLM-L6-v2 running locally on the CPU.
29. **How many dimensions?** 384, verified from actual model output rather than fabricated.
30. **What is semantic search?** Encoding the query and comparing it with indexed document chunk vectors to retrieve conceptual matches.
31. **What is cosine similarity?** The dot product divided by vector norms; normalized vectors make it simply a dot product.
32. **Are cosine scores probabilities?** No. They describe similarity in the embedding space and do not guarantee correctness.
33. **Why normalize vectors?** It makes comparisons depend on direction rather than raw magnitude and simplifies cosine computation.
34. **Why chunk documents?** MiniLM has a finite sequence length; overlapping windows prevent silently discarding most of a long document.
35. **How are chunks bounded?** Tokenizer offsets create up to 220-token windows with 32-token overlap, followed by a model-limit check.
36. **Why overlapping chunks?** They preserve context near boundaries so nearby ideas are not split completely apart.
37. **How is exact search different?** It matches literal case-insensitive text across the complete extraction, without embedding inference.
38. **How does hybrid search work?** Reciprocal rank fusion adds 1/(60+rank) across semantic and literal file rankings, avoiding mixing unlike score scales.
39. **Why one result per file?** The best semantic chunk represents the original file and avoids overwhelming users with repeated chunks.
40. **What is metadata?** File identity, original/display names, object key, type, size, dates, hash and indexing state.
41. **What happens after restart?** Metadata/text/vectors persist. The model reloads once into memory; successful document vectors are reused.
42. **What happens when indexing fails?** The uploaded original stays in S3; the UI shows failed status and permits reindexing.
43. **Is upload and indexing one transaction?** No. S3 and SQLite cannot share a transaction; recovery records and reconciliation expose partial state.
44. **How does deletion work?** After explicit confirmation, the owned S3 object is deleted, then its database row and cascading chunks are removed. Imported originals are protected.
45. **Does renaming move S3 objects?** No. The display name changes while the original UUID key stays stable.
46. **How are snippets protected from XSS?** React renders escaped text and mark elements. Uploaded HTML/SVG is not rendered as active markup.
47. **Why no login screen?** This is an explicitly single-user local application bound to loopback. It must not be exposed publicly without real authentication.
48. **Why not Bedrock?** Model invocation was restricted in this account; local inference supplies genuine semantic search without bypassing restrictions or paying an AI API.
49. **Why not FAISS or OpenSearch?** NumPy linear scans are adequate for small academic collections and minimize installation/cloud cost complexity.
50. **Is AWS always free?** No. S3 storage, requests and transfer depend on account allowances/credits. No paid upgrade or extra infrastructure was made.
51. **How do you prove genuine cloud storage?** Compare the website-uploaded object's actual S3 HEAD/GET and API download bytes/hash with the original sample.
52. **How do you prove genuine AI retrieval?** The model produces nonrandom 384-D normalized vectors; queries with different wording retrieve predefined relevant documents using computed similarities.
53. **What limitations remain?** Local single-user operation, no OCR, finite parser limits, CPU performance, local backup needs and no distributed durable worker queue.
54. **What was your contribution versus upstream?** The preserved RAGStack foundation is acknowledged. The simplified REST/SQLite/local-model implementation and CloudVault interface/workflow are new contributions, documented separately.
