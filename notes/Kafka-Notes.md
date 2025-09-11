# 📘 Kafka Detailed Notes

## 1. Why Kafka? (Use Cases & Problems it Solves)

-   **Traditional problem**: Apps directly writing logs/events into DBs
    → performance bottlenecks, tight coupling, risk of losing data on
    crash.
-   **Kafka solution**:
    -   Decoules **producers** (data sources) and **consumers**
        (services that use/process data).\
    -   High-throughput distributed **commit log** for streaming data.\
    -   Scalability (partitioning), fault tolerance (replication),
        reprocessing capability (replay old messages).

🔹 **Use cases**:\
- Centralized **logging pipelines** (e.g., app logs → Kafka → ELK/DB).\
- **Event-driven architectures** (user signup → multiple microservices
notified).\
- **Real-time analytics** (clickstream → Kafka → Spark/Flink →
dashboards).\
- **Data lake sync** (Kafka Connect pushing data to/from DBs, S3, etc.).

------------------------------------------------------------------------

## 2. Core Components of Kafka

-   **Broker** → A Kafka server. Manages topics partitions and its clients (producer, consumer).\
-   **Topic** → Named logical category of messages (no physical storage happens here).\
-   **Partition** → physical storage of a topic (secondary storage). Ensures parallelism. Each
    partition is an **ordered, immutable log**.\ Order is promised within a partition but not across partions
-   **Replication Factor (RF)** → Number of copies of each partition
    across brokers.\
-   **Leader** → The partion responsible for all reads/writes.\
-   **Follower** → Keeps a synced copy of the leader.\
-   **ISR (In-Sync Replicas)** → Set of replicas fully caught up with
    leader.\ After leader how many other followers you want to be synced synchronously. 
-   **Producer** → Publishes messages to Kafka.\
-   **Consumer** → Reads messages from Kafka.\
-   **Consumer Group** → Multiple consumers working together to process
    partitions of a topic. All consumers belongs to same consumer group id forms a consumer group
-   **Kafka clusture** → Multiple brokers forms a clusture.\


------------------------------------------------------------------------

## 3. Replication, Partitions, and Edge Cases

### Example: `brokers = 3, partitions = 2, RF = 2, ISR = 2`

-   Topic has 2 partitions → each has **1 leader + 1 follower** spread
    across brokers.Broker 1 (partion 1), Broker 2 (partion 2, replica of partion 1), Broker 3 (replica of partion 2)\
-   ISR=2 means both replicas must acknowledge writes. After leader one more follower data should be synced (2 = leader + follower) \

**Scenarios**: 1. **1 broker down** → If leader is down, controller
re-elects follower as leader. Writes continue. if broker 1 is down, then replica of partion 1 (which is in broker 2) will become the leader and producers who were suppose to send messages to partion 1 (broker 1) will now be sent to broker 2. till broker 1 is back up, and then both the partions (1 + its replica ) will sync again. \
2. **2 brokers down** → Some partitions unavailable, data loss risk.\
3. **ISR shrink** (one follower lags) → Producers with `acks=all` will
block until ISR restored. When broker-1 comes back. Broker-1 will fetch missing data from broker-2. Once it catches up, ISR goes back to 2. Producer’s acks=all resumes waiting for both.

------------------------------------------------------------------------

## 4. Producer Delivery Semantics

### ⚡ Settings

-   `acks=0` → Fire and forget (fastest, data loss possible)\
-   `acks=1` → Wait for leader ack only (safe-ish, but leader crash =
    potential loss)\
-   `acks=all` → Wait for all ISR → strongest guarantee.
-   On consumer side at least once is the default semantics, at most once is not practical by kafka's design.

### ⚡ Idempotence & Transactions

-   `idempotent=true` → Avoids **duplicate messages** from retries
    (producer side).\
-   `transactional.id` + transactions → Ensures **exactly-once**
    semantics **end-to-end** (producer → Kafka → consumer).

### Semantics

-   **At-most-once** → Send without retry. Loss possible, no
    duplicates.\
-   **At-least-once** → Retry on failure. No loss, but possible
    duplicates.\
-   **Exactly-once** → Requires idempotence + transactions. No loss, no
    duplicates.

------------------------------------------------------------------------

## 5. Consumer Mechanics

-   Each **partition** in a topic is consumed by only **1 consumer** in
    a group.\
-   If more consumers than partitions → extra consumers idle.\
-   If fewer consumers than partitions → some consumers handle multiple
    partitions.

🔹 **Consumer offset management**:\
- Kafka stores offsets in `__consumer_offsets` topic.\
- New group ID → starts at `earliest` (default: beginning of log) or
`latest`.\
- Restarted group → resumes from last committed offset.

------------------------------------------------------------------------

## 6. Hosting & Infra Guidelines

-   **Broker isolation**: Each broker ideally runs on a separate
    **VM/Pod** for fault tolerance.\
-   **Disks**: Use fast disks (NVMe/SSD) → Kafka is disk-intensive.\
-   **Replication factor**:
    -   RF=1 → unsafe (no fault tolerance).\
    -   RF=2 → tolerates 1 failure.\
    -   RF=3 → tolerates 2 failures (recommended for prod).\
-   **Zookeeper vs KRaft**:
    -   Older Kafka used ZooKeeper for coordination.\
    -   Modern Kafka (KRaft mode) removes ZooKeeper (your setup uses
        KRaft ✅).

------------------------------------------------------------------------

## 7. Quick Kafka CLI Commands

### Topics

``` bash
# List topics
kafka-topics.sh --bootstrap-server localhost:9092 --list

# Create topic
kafka-topics.sh --bootstrap-server localhost:9092   --create --topic my-topic --partitions 3 --replication-factor 2 --config min.insync.replicas=2

# Describe topic
kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic my-topic
```

### Producing

``` bash
kafka-console-producer.sh --broker-list localhost:9092 --topic my-topic
# Type messages and press Enter
```

### Consuming

``` bash
# From beginning
kafka-console-consumer.sh --bootstrap-server localhost:9092   --topic my-topic --from-beginning

# With group
kafka-console-consumer.sh --bootstrap-server localhost:9092   --topic my-topic --group my-group
```



# ⚡ Kafka Producer & Consumer Configurations Cheat Sheet

Quick revision guide for Kafka settings — useful for interviews and real-world tuning.

---

## ⚡ Kafka Producer Settings

| Setting | Meaning | Common Values |
|---------|---------|---------------|
| `acks` | Number of broker acknowledgments required before considering a write successful | `0` (fire & forget), `1` (leader ack), `all` (leader + ISR ack, safest) |
| `key.serializer` | Serializer for record key (used for partitioning) | `StringSerializer`, `ByteArraySerializer` |
| `value.serializer` | Serializer for record value | `StringSerializer`, `JsonSerializer`, `AvroSerializer` |
| `retries` | How many times to retry sending on transient errors | `5`, `10` (default is `Integer.MAX_VALUE` in KafkaJS) |
| `retry.backoff.ms` | Wait time before retrying a failed request | `100` ms typical |
| `enable.idempotence` / `idempotent` | Ensures messages are written **exactly once per session** (no duplicates if retries happen) | `true` |
| `transactional.id` | Enables producer **transactions** (atomic writes across partitions/topics) | e.g., `"txn-logs-1"` |
| `linger.ms` | How long to wait before sending a batch (tradeoff between latency & throughput) | `5–50 ms` |
| `batch.size` | Max batch size in bytes (larger batch = better throughput, worse latency) | `32KB`, `64KB` |
| `compression.type` | Compression to reduce network/disk usage | `gzip`, `snappy`, `lz4`, `zstd` |
| `client.id` | Identifier for the producer (helps debugging, metrics, logs) | `"log-ingest-service"` |
| `max.in.flight.requests.per.connection` | Number of un-acked requests a producer can send. Set `1` with idempotence for ordering guarantee | `1–5` |

---

## ⚡ Kafka Consumer Settings

| Setting | Meaning | Common Values |
|---------|---------|---------------|
| `group.id` | Consumer group identifier (used for partition assignment & offset tracking) | e.g., `"log-db-ingest-consumer-group-id"` |
| `key.deserializer` | Deserializer for key | `StringDeserializer`, `ByteArrayDeserializer` |
| `value.deserializer` | Deserializer for value | `StringDeserializer`, `JsonDeserializer`, `AvroDeserializer` |
| `enable.auto.commit` | Auto commit offsets | `true` (default) OR `false` (manual commit for better control) |
| `auto.commit.interval.ms` | Interval for auto committing offsets if enabled | `5000 ms` |
| `auto.offset.reset` | What to do if no committed offset is found | `earliest` (read from beginning), `latest` (read new messages only), `none` (fail) |
| `max.poll.records` | Max number of records returned in one poll | `100–500` |
| `max.poll.interval.ms` | Max delay between polls before broker kicks consumer from group | `300000 ms` (5 min default) |
| `session.timeout.ms` | Time broker waits before considering consumer dead | `10s–45s` |
| `fetch.min.bytes` | Minimum data size broker should return in one fetch | `1` (immediate return) |
| `fetch.max.bytes` | Max data size per fetch request | `50MB` typical |
| `isolation.level` | Controls visibility of transactional messages | `read_uncommitted` (default), `read_committed` (for exactly-once consumers) |
| `client.id` | Identifier for consumer instance (metrics, logs) | `"log-db-ingest-app"` |

---

## ⚡ Quick Interview Pointers
- Producers control **delivery semantics** with `acks`, `idempotence`, `transactional.id`.  
- Consumers control **consumption semantics** with `auto.offset.reset`, `commit strategy`, and `isolation.level`.  
- Tuning batching (`linger.ms`, `batch.size`) + compression improves **throughput massively**.  
- For critical apps: disable auto-commit, commit offsets **after processing**.  



------------------------------------------------------------------------

## 8. What We Built in Log-Panda 🚀

✅ **Producer (log-ingest app)**\
- NestJS producer publishing logs to Kafka topic (`log-ingest-topic`).\
- Configured with `acks=all`, `idempotent=true`.

✅ **Kafka Broker**\
- Single-broker setup using Docker (`log-ingest-kafka`).\
- `log-ingest-kafka-init` ensures topic creation.

✅ **Consumer (log-db-ingest app)**\
- NestJS consumer with group ID (`log-db-ingest-consumer-group-id`).\
- Batching service → processes 100 logs at a time.\
- Inserts into Postgres DB.

✅ **Scaling plan**\
- Run multiple `log-db-ingest` containers (equal to number of
partitions).\
- Future: Use **Kubernetes** for auto-scaling & resiliency.
