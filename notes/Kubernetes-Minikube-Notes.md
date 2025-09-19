# Kubernetes & Minikube – Detailed Notes

## 🌐 What is Kubernetes?
- **Definition**: Kubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management of containerized applications.
- **Why it’s used**:
  - Automates container scheduling across nodes.
  - Handles scaling (up/down) automatically.
  - Provides self-healing (restarts failed pods).
  - Manages networking (service discovery, DNS).
  - Supports rolling updates and rollbacks.

---

## 🏗 Kubernetes Architecture
- **Control Plane Components**:
  - **kube-apiserver** → entrypoint for all commands (`kubectl` talks to this).
  - **etcd** → distributed key-value store (cluster state).
  - **kube-scheduler** → assigns pods to nodes based on resources.
  - **kube-controller-manager** → ensures desired state (replicas, nodes).
- **Node Components**:
  - **kubelet** → agent on each node, manages pods/containers.
  - **kube-proxy** → handles networking/routing rules for pods.
  - **Container runtime** → Docker/Containerd/CRI-O, actually runs containers.

---

## 🖥 Practicing Locally with Minikube
- **Minikube** simulates a Kubernetes cluster locally (1-node).
- **Installation (Linux)**:
  ```bash
  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
  ```
- **Start cluster**:
  ```bash
  minikube start --driver=docker
  ```
- **Check cluster**:
  ```bash
  kubectl get nodes
  kubectl get pods -A
  ```

- **Clean up the existing Minikube cluster**:
  ```bash
  minikube stop
  minikube delete
  minikube start --driver=docker
  ```


- **To enable metrics server for HPA and VPA resource calculations**:
  ```bash
  minikube addons enable metrics-server
  ```



---

## 📦 Pods
- Smallest deployable unit in Kubernetes.
- Encapsulates **one or more containers** + shared resources (network, storage).
- Commands:
  ```bash
  kubectl get pods
  kubectl logs <pod-name>
  kubectl exec -it <pod-name> -- /bin/sh
  kubectl delete pod <pod-name>
  ```

---

## 📑 Deployments
- Manages replicas of Pods (via ReplicaSets).
- Supports scaling, rolling updates, rollbacks.
- Key elements:
  - **apiVersion**: apps/v1
  - **kind**: Deployment
  - **metadata**: name, labels
  - **spec.replicas**: number of pods
  - **spec.selector**: which pods this Deployment manages
  - **spec.template**: defines pod spec (containers, env, ports)
- Scaling:
  ```bash
  kubectl scale deployment log-panda-app1 --replicas=5
  ```
- Deleting:
  ```bash
  kubectl delete deployment log-panda-app1
  ```

---

## 🏷 Pods vs Deployments vs ReplicaSets vs StatefulSets
- **Pod** → single instance of your container(s).
- **ReplicaSet** → ensures a specific number of pods are running (not used directly, managed by Deployment).
- **Deployment** → manages ReplicaSets, enables scaling + rolling updates. Good for stateless apps (like app1/app2/app3).
- **StatefulSet** → manages stateful apps (DBs, Kafka, etc.), gives stable identity + persistent storage.

---

## 🔌 Services
- Abstraction to expose Pods internally/externally.
- Types:
  - **ClusterIP (default)** → internal-only.
  - **NodePort** → exposes on each node’s IP:port (range 30000–32767). Used in dev, rarely in prod.
  - **LoadBalancer** → provisions external LB (on cloud providers).
- Industry practice:
  - Internal services → ClusterIP
  - External access → Ingress + LoadBalancer

---

## 🌐 Ingress
- Manages external access via **hostnames/paths**.
- Requires an **Ingress Controller** (NGINX, Traefik, etc.).
- In Minikube:
  ```bash
  minikube addons enable ingress
  ```
- Use `/etc/hosts` to map `app1.local` → Minikube IP.

---

## 🐳 Docker Images & Kubernetes
- Pods pull images from registries (Docker Hub, GCP, ECR, etc.).
- Workflow:
  1. Build image locally → `docker build -t username/app1:v1.0.0 .`
  2. Test locally → `docker run -p 3000:3000 username/app1:v1.0.0`
  3. Push to Docker Hub →  
     ```bash
     docker login
     docker push username/app1:v1.0.0
     ```
  4. Reference in Deployment YAML under `image:`.

---

## 📋 Environment Variables in Pods
- Set directly in Deployment YAML under `spec.containers.env`.
- Precedence: **Deployment env vars > Image baked `.env` in src dir**.
- Example:
  ```yaml
  env:
    - name: PORT
      value: "3000"
  ```

---

## ⏳ Jobs
- A Job ensures that **a pod runs to completion** (used for batch tasks like data processing, migrations, one-time jobs).
- Unlike Deployments (which keep pods running), Jobs **terminate once done**.
- Can be parallelized with `.spec.parallelism` and `.spec.completions`.

---

## 🛠 Useful Commands Recap
```bash
kubectl get pods                # list pods
kubectl get svc                 # list services
kubectl logs -f <pod>              # view pod logs [if there are multiple containers running within a pod, then this will fetch the logs of first container by default]
kubectl exec -it <pod> -- sh    # shell inside container
kubectl apply -f file.yaml      # apply manifest
kubectl delete -f file.yaml     # delete resource
minikube ip                     # get Minikube IP
minikube ssh                    # login to node
minikube service <svc-name>     # open service in browser
```

---

## Kafka in Kubernetes (Production Considerations)
- Kafka is **stateful** and tightly coupled with storage & networking performance.
- Running Kafka on Kubernetes is possible but adds complexity.
- Typical issues:
  - Scaling **up** requires **manual partition reassignment** (Kafka does not automatically rebalance partitions).
  - Scaling **down** is risky (must safely move partitions off brokers).
  - StatefulSets + PVCs help, but **dynamic scaling like stateless apps is not feasible**.

### Options for Production Kafka
1. **Managed Kafka Services (Preferred)**  
   - AWS MSK, Confluent Cloud, Aiven, Redpanda Cloud.  
   - Pros: No operational burden, automatic scaling, monitoring, and upgrades.

2. **Self-Hosted Kafka (on VMs or Bare Metal)**  
   - Run on dedicated servers with tuned SSD/NVMe disks.
   - Greater control over performance, but more maintenance overhead.

3. **Kafka in Kubernetes (with Operators)**  
   - Tools like **Strimzi Operator** or **Confluent Operator** automate broker lifecycle, upgrades, and partition reassignment.  
   - Suitable if an organization standardizes on Kubernetes for all infra.  
   - Still requires careful planning for scaling.

## Key Takeaways
- **Don’t treat Kafka like a Deployment** → It cannot auto-scale seamlessly.
- **KRaft removes ZooKeeper** but does **not** eliminate scaling complexity.
- For learning and small setups → running Kafka in Kubernetes is fine.  
- For production → **prefer managed Kafka** or a well-maintained operator.



## Headless Services in Kubernetes
- A Service with `clusterIP: None` is called a **Headless Service**.
- Instead of a single ClusterIP for load-balancing, it returns the **DNS records of individual Pods** behind it.
- Useful for StatefulSets like Kafka, where clients need to talk to specific brokers by stable DNS names (e.g., `kafka-0.service-name:9092`).


## 🌀 Headless Services (`clusterIP: None`)

Normally, when you create a **Service** in Kubernetes:

- It gets a **ClusterIP** (a single **virtual IP / VIP**).  
- Clients connect to the Service IP, and kube-proxy does load balancing across the Pods that match the Service selector.  
- Example:
  ```bash
  kubectl get svc log-panda-app1-service
  ```
  Output:
  ```
  NAME                      TYPE        CLUSTER-IP    PORT(S)    AGE
  log-panda-app1-service    ClusterIP   10.96.120.47  3000/TCP   5m
  ```
  Here, `10.96.120.47` is the **VIP**. DNS (`log-panda-app1-service.default.svc.cluster.local`) resolves to that single VIP.

---

### 🔎 What happens with `clusterIP: None`?
If you set:
```yaml
spec:
  clusterIP: None
```

- Kubernetes does **not assign a ClusterIP**.  
- Instead, the Service name directly resolves to the **individual Pod IPs** that match the selector.  
- Example with a StatefulSet (`kafka` with 3 replicas):

```bash
kubectl get pods -l app=kafka -o wide
```
Output:
```
NAME       READY   STATUS    IP           NODE
kafka-0    1/1     Running   10.244.0.12  worker-1
kafka-1    1/1     Running   10.244.1.15  worker-2
kafka-2    1/1     Running   10.244.2.20  worker-3
```

Now do a DNS lookup:
```bash
kubectl run -it --rm dnsutils --image=infoblox/dnstools -- nslookup kafka
```

Output:
```
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:   kafka.default.svc.cluster.local
Address: 10.244.0.12
Address: 10.244.1.15
Address: 10.244.2.20
```

👉 Instead of one VIP, you get **all Pod IPs**.

---

### ⚡ Why is this useful?
- For **StatefulSets (Kafka, ZooKeeper, DBs, etc.)** where each Pod has a stable identity.  
- Clients often need to talk to a **specific broker** (not just load-balanced).  
- Kubernetes gives each StatefulSet Pod a stable DNS name:
  ```
  kafka-0.kafka.default.svc.cluster.local
  kafka-1.kafka.default.svc.cluster.local
  kafka-2.kafka.default.svc.cluster.local
  ```
- This way, producers/consumers can directly connect to `kafka-0`, `kafka-1`, etc., instead of being routed randomly.

---

✅ In short:  
- **Normal Service (ClusterIP)** → One VIP, kube-proxy load balances.  
- **Headless Service (`clusterIP: None`)** → No VIP, DNS returns **Pod IPs**. Perfect for StatefulSets.  


# Kubernetes HPA (Horizontal Pod Autoscaler) – Notes

## 🔹 What is HPA?
- HPA automatically scales the number of **pods** in a Deployment, ReplicaSet, or StatefulSet based on observed metrics.
- Metrics can be **CPU**, **memory**, or **custom metrics** (e.g., requests per second).

---

## 🔹 How HPA Works
- Kubernetes continuously monitors the metrics of pods.
- Compares **current average** with **target value**.
- Adjusts replicas according to a formula.

---

## 🔹 Formula for Desired Replicas
```
desiredReplicas = currentReplicas * (currentAverage / targetAverage)
```

- **currentReplicas** → number of pods currently running.
- **currentAverage** → average metric (CPU, memory, etc.) across all pods.
- **targetAverage** → metric threshold you set in HPA.

---

## 🔹 Scale-Up Example

**Scenario**:  
- Target CPU: 50%  
- Current Pods: 3  
- CPU usage per pod: `[60%, 70%, 65%]`  

**Step 1: Calculate average**  
```
Average CPU = (60 + 70 + 65) / 3 = 65%
```

**Step 2: Apply formula**  
```
desiredReplicas = 3 * (65 / 50) = 3 * 1.3 = 3.9 ≈ 4 pods
```

**Result:** HPA will scale **up from 3 → 4 pods**.

---

## 🔹 Scale-Down Example

**Scenario**:  
- Target CPU: 50%  
- Current Pods: 4  
- CPU usage per pod: `[40%, 45%, 35%, 50%]`  

**Step 1: Calculate average**  
```
Average CPU = (40 + 45 + 35 + 50) / 4 = 42.5%
```

**Step 2: Apply formula**  
```
desiredReplicas = 4 * (42.5 / 50) = 4 * 0.85 = 3.4 ≈ 3 pods
```

**Result:** HPA will scale **down from 4 → 3 pods** after cooldown.

---

## 🔹 Important Notes on Scaling
1. **Scale-up**: Happens immediately when metrics exceed target.  
2. **Scale-down**: Cooldown period (default 5 min) prevents rapid scaling down.  
3. **Min/Max replicas**: HPA respects `spec.minReplicas` and `spec.maxReplicas`.  
4. **Average metric**: HPA calculates the average across all pods, not individual spikes.  
5. **Multiple metrics**: If using multiple metrics, HPA uses the **highest required scale** among them.

---

## 🔹 Metrics Triggers
| Metric Type         | Trigger Example                                 |
|--------------------|-----------------------------------------------|
| CPU                 | Average CPU > 70% → scale up                  |
| Memory              | Average memory > 80% → scale up               |
| Custom metrics      | Requests/sec, queue length, etc.              |
| External metrics    | External systems like Prometheus, Kafka lag   |

---

## 🔹 Adding HPA to Deployment YAML

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: log-panda-log-ingest-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: log-panda-log-ingest
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

- HPA monitors **Deployment `log-panda-log-ingest`**.  
- Scales between **1–5 pods** based on **50% CPU utilization**.

---

## ✅ Summary
- HPA is a reactive autoscaler based on metrics.  
- Scale-up is immediate, scale-down respects cooldown.  
- Always set **min/max replicas** to avoid extreme scaling.  
- Metrics can be **CPU, memory, custom, or external**.
- if in hpa min replica is 1 and if you scale down the pod to 0, then hpa will not spawn a new pod. 



# Vertical Pod Autoscaler (VPA) Notes

## 🌟 What is VPA?
- **Definition**: VPA automatically adjusts the CPU and memory requests/limits for pods based on historical and current usage.
- **Goal**: Ensure pods have the right resources without manual tuning.

---

## 🔧 Components
- **VPA object**: Attached to a Deployment/StatefulSet.
- **Recommender**: Monitors usage and provides recommendations.
- **Updater**: Evicts pods to apply new resource requests.
- **Admission Controller**: Ensures new pods start with recommended resources.

---

## 📝 Example VPA Manifest
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: log-panda-log-ingest-vpa
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: log-panda-log-ingest
  updatePolicy:
    updateMode: "Auto"
```

### Explanation
- `targetRef`: Points to the Deployment whose pods you want to autoscale vertically.
- `updateMode: Auto`: VPA will automatically evict pods and restart them with updated resources.

---

## ⚡ How it Works
1. VPA observes pod metrics over time.
2. Recommender suggests CPU/memory requests.
3. If `updateMode: Auto`:
   - Pods are evicted.
   - New pods are scheduled with updated CPU/memory.
4. If `updateMode: Off`:
   - Only recommendations are provided; no changes are applied.

### Important Notes
- **Update causes pod eviction**: Pod restarts may impact availability; combine with HPA for best results.
- **Works best for stateful apps**: Databases, Kafka brokers, etc., where horizontal scaling might be limited.
- **Cannot prevent pod eviction if mode is `Auto`**.

---

## ✅ Best Practices
- Use HPA for horizontal scaling and VPA for vertical scaling together.
- Start with `updateMode: "Off"` in production to monitor recommendations.
- Test evictions carefully to avoid downtime.
- Monitor VPA logs:
  ```bash
  kubectl describe vpa <vpa-name>
  ```