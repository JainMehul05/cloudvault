# Local database

SQLite stores file identity, stable S3 object keys, names, hash, size/type, extraction state, extracted text and chunk/vector metadata. Original normalized 384-dimensional float32 vectors remain intact.

Schema version 2 is additive. Before migration an online backup is created. It adds files.starred, conversations (id, title, scope JSON, timestamps), exchanges (question, answer JSON, timestamp, conversation foreign key) and an FTS5 external-content index over chunks.text with insert/update/delete triggers. Successful old vectors are not regenerated. Conversations and exchanges are local and survive restart; deleting a conversation requires an explicit confirm flag and cascades to its exchanges.

The pre-v2 backup and vector/key SHA manifest are in data/backups/pre-v2 (private, ignored by Git). Migration checks confirmed original vector bytes and object keys unchanged. Database/schema tests use isolated temporary data and mocked S3 objects, with the actual cached MiniLM model. Maintain private backups of the database together with the S3 identity manifest; no cross-system transaction is claimed.

