# Lab demonstration guide

## Before leaving for the lab

Keep this laptop's `CloudVault/data` directory, including the model cache and SQLite database. Bring internet access for real S3 operations. Run `scripts/setup.ps1` once beforehand. Verify AWS login in Sydney, run `scripts/start.ps1`, and open http://127.0.0.1:8000. If AWS expires, run `aws login --profile default`, complete the browser login and retry the connection check. Do not change region or run upstream deployment scripts.

## Five-to-eight-minute presentation

1. **Introduce the objective:** “CloudVault is a hybrid cloud file manager. Original files are in private Amazon S3. The website, API and AI index run locally.”
2. **Show Settings:** bucket `cloudvault-d0c2b49b4347`, Sydney, actual connection, public access blocks, CPU MiniLM, measured dimension 384. Do not display AWS credential files.
3. **Upload:** select an original non-sensitive sample from `samples/`. The browser queue supports multiple files and measured transfer progress. Successful upload means stored in S3; pending/processing then describes local indexing. Duplicate filenames create different UUID objects.
4. **Verify S3:** copy the UUID key from the safe preview dialog; in the existing bucket's AWS console find `cloudvault/files/<UUID>/<filename>`. Explain bucket, object key, metadata, encryption and private access. Existing test-object keys are recorded in LIVE_VERIFICATION.json.
5. **Exact content:** select Exact keyword and enter `remotely managed`. Show the genuine highlighted snippet from object-storage.txt. This is literal case-insensitive phrase matching over complete extracted text.
6. **Semantic content:** select Semantic and ask “Where can I store my digital files remotely?” Explain that this exact phrase does not occur in the document. Show the actual cosine score and original file. Then try “How do computers learn from examples?” to retrieve machine-learning.txt.
7. **Retrieve original:** use Download original. Compare the bytes/hash with the source sample. If this browser blocks a local attachment, report the browser limit honestly and show the verified backend download endpoint instead; do not disable browser protection. Test normal downloads before the evaluation.
8. **File management:** filter filenames, sort, preview and rename. Show the deletion confirmation and cancel it; retain demonstration data. Unsupported binary files remain stored and downloadable, but are clearly marked unsupported for content search.
9. **Persistence:** stop and restart with the provided scripts. Search again: persisted vectors are reused. Only the model needs to load into memory; the corpus is not regenerated.
10. **Explain choices:** restricted Bedrock invocation led to free local embeddings. SQLite/NumPy keeps the system understandable. S3 still provides genuine cloud storage. No expensive extra services were introduced.

## Expected queries

| Mode | Query | Expected file |
|---|---|---|
| Semantic | Where can I store my digital files remotely? | object-storage.txt |
| Semantic | How can I protect information from hackers? | network-security.txt |
| Semantic | How do computers learn from examples? | machine-learning.txt |
| Semantic | How can structured information be stored and retrieved? | databases.txt |
| Semantic | Which documents discuss environmentally friendly energy? | renewable-energy.txt |
| Exact keyword | remotely managed | object-storage.txt |
| Hybrid | remotely managed | object-storage.txt |
| Filename | renewable | renewable-energy.txt |

Expected files were chosen before test execution. Their observed ranks/scores are evidence from this sample collection, not hardcoded application matches.

## Troubleshooting

| Symptom | Recovery |
|---|---|
| AWS unavailable/expired | Check internet; run aws login --profile default; retry Settings check. |
| Failed indexing | Open the error in My Files, fix the document/model/session issue and select Reindex. |
| Empty PDF | It may be scanned or password-protected; supply searchable text or an unlocked PDF. No OCR is claimed. |
| First query slow | CPU model loading; retain the cache. Startup setup checks the model beforehand. |
| Port 8000 occupied | Do not kill arbitrary processes. Stop the recorded CloudVault instance, or identify the other app. |
| Missing S3 original | Metadata is retained; use read-only reconciliation and restore the known original manually. |
| Lost local index | Restore the private SQLite backup; S3 originals alone do not reconstruct every local display name. |

Use TEST_REPORT.md for verified scope, LIMITATIONS.md for honest boundaries and VIVA_QUESTIONS.md for explanations. Avoid claiming that the local API or model runs in AWS.
