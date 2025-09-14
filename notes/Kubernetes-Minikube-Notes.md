
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
- Precedence: **Deployment env vars > Image baked `.env`**.
- Example:
  ```yaml
  env:
    - name: PORT
      value: "3000"
  ```

---

## 🛠 Useful Commands Recap
```bash
kubectl get pods                # list pods
kubectl get svc                 # list services
kubectl logs <pod>              # view pod logs
kubectl exec -it <pod> -- sh    # shell inside container
kubectl apply -f file.yaml      # apply manifest
kubectl delete -f file.yaml     # delete resource
minikube ip                     # get Minikube IP
minikube ssh                    # login to node
minikube service <svc-name>     # open service in browser
```

---

✅ With this, you now have a full picture from **what K8s is** → **how to run a local cluster with Minikube** → **Pods, Deployments, Services, Ingress** → **best practices for prod**.
