# Schema 3 and cloud durability

Schema 3 is additive, with a preserved online pre-migration backup. SQLite retains files/chunks/FTS/stars/conversations/exchanges and adds cloud_outbox for conditional-revision metadata retries. No original vector recomputation or destructive rebuild was used. The pre-v3 backup is in data/backups/pre-v3.

DynamoDB stores workspace file metadata, tombstones and job histories; it does not store complete private extracted text/conversations. Pending local revisions overlay cloud listing/detail results. Active local chunk hashes gate cloud vector matches; scoped stale-key cleanup avoids unrelated vectors. Current preservation verifies 10 unaffected documents and 59 original vectors, plus prior conversations/exchanges. A user-deleted non-sensitive water fixture was restored through normal upload under a new ID, not by overwriting the backup database.


---

## Preserved implementation detail

# Local database

SQLite stores file identity, stable S3 object keys, names, hash, size/type, extraction state, extracted text and chunk/vector metadata. Original normalized 384-dimensional float32 vectors remain intact.

Schema version 2 is additive. Before migration an online backup is created. It adds files.starred, conversations (id, title, scope JSON, timestamps), exchanges (question, answer JSON, timestamp, conversation foreign key) and an FTS5 external-content index over chunks.text with insert/update/delete triggers. Successful old vectors are not regenerated. Conversations and exchanges are local and survive restart; deleting a conversation requires an explicit confirm flag and cascades to its exchanges.

The pre-v2 backup and vector/key SHA manifest are in data/backups/pre-v2 (private, ignored by Git). Migration checks confirmed original vector bytes and object keys unchanged. Database/schema tests use isolated temporary data and mocked S3 objects, with the actual cached MiniLM model. Maintain private backups of the database together with the S3 identity manifest; no cross-system transaction is claimed.

