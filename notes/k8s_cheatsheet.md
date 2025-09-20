# Kubernetes Cheatsheet

## 1. Core Concepts

-   **Pod**: Smallest deployable unit in K8s, wraps one or more
    containers.
-   **ReplicaSet**: Ensures specified number of Pod replicas are
    running.
-   **Deployment**: Declarative way to manage ReplicaSets and Pods.
-   **Service**: Stable networking endpoint for Pods.
    -   ClusterIP (default) → internal-only.
    -   NodePort → exposes on node's port.
    -   LoadBalancer → provision external load balancer.

## 2. Config & Storage

-   **ConfigMap** → Store non-sensitive config (env vars, files).
-   **Secret** → Store sensitive data (passwords, tokens). Encoded
    base64, but not encrypted by default.
-   **Volume** → Storage abstraction to persist data.
-   **PVC (PersistentVolumeClaim)** → Request storage from cluster.

## 3. Scaling

-   **HPA (HorizontalPodAutoscaler)** → Scales Pods horizontally
    (replicas) based on CPU/memory/metrics.
-   **VPA (VerticalPodAutoscaler)** → Adjusts Pod resource
    requests/limits dynamically.
-   **Cluster Autoscaler** → Scales nodes in cluster.

## 4. Networking

-   **DNS** → Built-in service discovery
    (`<service>.<namespace>.svc.cluster.local`).
-   **Ingress** → HTTP/HTTPS routing to services with external access.

## 5. Observability

-   **Logs**: `kubectl logs <pod>`
-   **Events**: `kubectl get events`
-   **Probes**:
    -   Liveness → Restart if unhealthy.
    -   Readiness → Remove from Service if not ready.
    -   Startup → Delay checks until startup completes.

## 6. RBAC & Security

-   **RBAC** → Roles, ClusterRoles, RoleBindings, ClusterRoleBindings.
-   **Service Accounts** → Identity for Pods.
-   **Secrets Encryption** → Enable encryption at rest for etcd.

## 7. Best Practices

-   Always set `resources.requests` & `resources.limits`.
-   Use namespaces for environment isolation (dev, staging, prod).
-   Store secrets in Secret objects (not ConfigMaps).
-   Prefer readiness/liveness probes for health checks.
-   Use labels & selectors consistently for tracking and scaling.

## 8. Common Commands

``` bash
# View cluster info
kubectl cluster-info

# Get all resources in namespace
kubectl get all -n <namespace>

# Describe resource
kubectl describe <pod|deployment|service> <name>

# Scale manually
kubectl scale deployment <name> --replicas=3

# Create secret from CLI
kubectl create secret generic my-secret --from-literal=DB_USER=admin --from-literal=DB_PASS=pass

# Get YAML for a resource
kubectl get deployment my-app -o yaml

# Apply configuration
kubectl apply -f my-config.yaml
```


# Kubernetes Complete Notes

---

## 1. StatefulSets & Headless Services

* **StatefulSet:**

  * For applications requiring **stable network ID, persistent storage**.
  * Pods get a **stable hostname** and **persistent volume**.
  * Example: Kafka brokers, PostgreSQL master-slave setups.

* **Headless Service (`clusterIP: None`):**

  * No ClusterIP; no load-balancing.
  * Returns **DNS records of individual pods**.
  * Useful for StatefulSets where clients talk to specific pods.
  * Example DNS: `kafka-0.log-ingest-kafka:9092`, `kafka-1.log-ingest-kafka:9092`.
  * Only **1 VIP** is present for the service, the rest is handled via DNS lookup.

* **Notes:**

  * Kubernetes **does not automatically redistribute partitions** in Kafka when adding brokers; manual reassignment is needed.
  * PostgreSQL scale requires external tools (e.g., Patroni, PgBouncer) for HA; StatefulSets give stable IDs and PVs.

---

## 2. Probes

* **Liveness Probe:** Checks if container is alive. If fails, **k8s restarts the pod**.

* **Readiness Probe:** Checks if container is ready to serve traffic. Failed probes **remove pod from service endpoints**.

* **Startup Probe:** Checks during **container startup**. Useful for apps like Kafka that take time to initialize.

* **Interaction:**

  * `startupProbe` runs first. Once it succeeds, readiness & liveness probes are enabled.
  * Prevents Kubernetes from restarting pods during long startup.

* **Example probes:**

```yaml
livenessProbe:
  exec:
    command: ["pg_isready", "-U", "user"]
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
startupProbe:
  tcpSocket:
    port: 9092
  failureThreshold: 30
  periodSeconds: 10
```

---

## 3. ConfigMaps & Secrets

### ConfigMap:

* Stores **non-sensitive configuration**.
* Injected via **environment variables, volumes, or command args**.
* Similar to `environment` or `volumes` in Docker Compose.

### Secret:

* Stores **sensitive data** (passwords, keys).
* Base64 encoded; **not encrypted by default**, but safe from casual exposure.
* Stored in **etcd** with RBAC access.
* Create via CLI:

```bash
kubectl create secret generic log-panda-postgres-secret \
  --from-literal=POSTGRES_USER=log_panda_db_user \
  --from-literal=POSTGRES_PASSWORD=ptm_pg_2024
```

* View YAML:

```bash
kubectl get secret log-panda-postgres-secret -o yaml
```

* No need to manually create YAML when using `kubectl create secret`.

* **Best practice:**

  * Use **Secrets for passwords**, **ConfigMaps for configs**.
  * Limit access via **RBAC**.

---

## 4. Horizontal Pod Autoscaler (HPA)

* **Purpose:** Scale pods **horizontally** based on metrics.

* **Supported metrics:** CPU, Memory, Custom metrics.

* **Formula:**

```
Desired Replicas = ceil(Current Metric / Target Metric * Current Replicas)
```

* **Scale Up Example:**

  * Current CPU avg = 140m, target = 70%, replicas = 2
  * Desired = ceil(140/70 \* 2) = 4 replicas

* **Scale Down Example:**

  * Current CPU avg = 50m, target = 70%, replicas = 4
  * Desired = ceil(50/70 \* 4) = 3 replicas

* **Notes:**

  * HPA reads metrics from **metrics-server**.
  * Scale triggers on **CPU % of requested resources** or custom metrics.
  * Min/Max replicas define bounds.

---

## 5. Vertical Pod Autoscaler (VPA)

* **Purpose:** Scale pods **vertically** (CPU/memory) automatically.

* **Update modes:**

  * `Off` – Only provides recommendations.
  * `Initial` – Sets resources at pod creation.
  * `Auto` – Adjusts resources of running pods (restarts pods with new resources).

* **Example status output:**

```
Recommendation:
  Container Name: log-panda-log-db-ingest
  Lower Bound: Cpu=50m, Memory=256Mi
  Target: Cpu=143m, Memory=256Mi
  Upper Bound: Cpu=1, Memory=2Gi
```

* Shows **recommended resource ranges**.

* Apply `updateMode: Auto` to let Kubernetes adjust running pods.

* Check updated resources with `kubectl describe pod <pod-name>`.

* **Notes:**

  * VPA and HPA can work together if **controlled resources do not conflict**.
  * Useful for workloads with unpredictable memory/CPU usage.

---

## 6. Miscellaneous Notes

* **Pods & Logs:**

  * `kubectl logs <pod>` to see logs.
  * `kubectl logs <pod> --previous` to see previous container logs.
  * StatefulSet pods are accessed via **stable hostnames**.

* **PostgreSQL in K8s:**

  * Master/Primary and slave/replicas should have separate YAMLs.
  * Use StatefulSet for stable IDs and PVs.
  * HPA for PostgreSQL replicas requires external connection pooling.
  * Initialization jobs can be used to create tables if they don’t exist.

* **Secrets & ConfigMaps Security:**

  * RBAC controls access.
  * Secrets are base64-encoded; not true encryption.

* **Scaling Kafka:**

  * Kafka brokers in K8s via StatefulSet.
  * Kafka does not automatically redistribute partitions on new brokers; use Kafka partition reassignment tools.

---

*End of Notes*
