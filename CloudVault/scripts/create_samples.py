from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
samples = {
 'cloud-computing.txt': 'Cloud computing delivers on-demand computing resources over the internet. Customers rent capacity rather than owning every server. Elasticity adjusts resources to demand. Shared responsibility separates provider infrastructure security from customer data protection.',
 'object-storage.txt': 'Amazon S3 provides scalable object storage and remotely managed infrastructure. Digital documents, photographs and backups reside in buckets. Each object has a unique key and metadata. Applications retrieve original bytes through authenticated HTTPS requests. Sydney is the selected region for this CloudVault workspace.',
 'network-security.txt': 'Network security defends systems against intruders and malicious traffic. Firewalls filter connections, multifactor authentication reduces stolen-password risk, and least-privilege permissions restrict access. Regular patching closes known vulnerabilities. Monitoring can detect suspicious activity.',
 'encryption.txt': 'Encryption transforms readable information into ciphertext using cryptographic keys. TLS protects data in transit. AES protects data at rest. Authorized recipients need the correct keys to recover plaintext. Key management and rotation are essential controls.',
 'machine-learning.txt': 'Machine learning trains statistical models on example observations. During training an algorithm adjusts parameters to recognize patterns and generalize to unseen inputs. Supervised learning uses labeled examples. Sentence embeddings represent language as numerical vectors whose directions capture meaning.',
 'databases.txt': 'Relational databases organize structured records into tables with rows and columns. SQL queries select, filter and join information. Transactions preserve consistency and foreign keys enforce relationships. Indexes speed retrieval. SQLite stores a complete database in a local file.',
 'renewable-energy.txt': 'Renewable energy harnesses sunlight, wind and moving water to produce electricity. Solar panels and wind turbines reduce dependence on fossil fuels. Battery storage balances intermittent generation. Cleaner power can reduce greenhouse gas emissions and support a sustainable environment.',
 'academic-information.md': '# Academic calendar\nThe university research seminar takes place in the engineering auditorium. Students submit a project abstract, implementation report and practical demonstration. The assessment includes architecture discussion, testing evidence and an oral examination.',
}
for name, text in samples.items():
 (root/'samples'/name).write_text(text+'\n', encoding='utf-8')
expected = [
 {'query':'Where can I store my digital files remotely?', 'expected':'object-storage.txt'},
 {'query':'How can I protect information from hackers?', 'expected':'network-security.txt'},
 {'query':'How do computers learn from examples?', 'expected':'machine-learning.txt'},
 {'query':'How can structured information be stored and retrieved?', 'expected':'databases.txt'},
 {'query':'Which documents discuss environmentally friendly energy?', 'expected':'renewable-energy.txt'},
]
(root/'samples'/'expected_queries.json').write_text(json.dumps(expected,indent=2),encoding='utf-8')
print('Created 8 original non-sensitive documents and predefined expected queries.')
