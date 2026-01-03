# 🐳 Docker & Docker Compose Notes

## ⚡ Why Docker?
- **Isolation** → Each app runs in its own container, isolated from host/other apps.  
- **Portability** → Build once, run anywhere (same image runs across dev, staging, prod).  
- **Efficiency** → Lightweight compared to VMs (shares host OS kernel).  
- **Scalability** → Easy to scale horizontally with multiple containers.  


## ⚡ How containerisation is different from virtualisation?
- **Virtualisation** → is used to create virtual machines where each intance of a VM has its own dedicated OS and Kernel. The host machine will allocate its resources (CPU, memoery..) to a VM and VM is bound to use them. Hence the resources are not sharable, once allocated even though VM is not using them. This managment of creating VMs, having its own OS and importanlty kernal, resource management and monitoring etc etc is being done the Hypervisor. Popular tools/softwares: VMWare, hyper-V etc
- **containerisation** → is used to create containers, light weight having base images (OS) but not a dedicated kernel and resources. A container will share the kernel and resources of the host machine. If a container needs only 1GB of ram then it only uses that, and if it doesnt need it at the moment then host machine can still use it. all docker cmds we run in termial will talk to dockerD which acts as an api to us, then this dockerD will talk to containerD which handles the container life cycle. Popular tools/softwares: Docker, containerD

---

## ⚡ Core Docker Concepts

| Concept | Explanation |
|---------|-------------|
| **Image** | Blueprint for container (read-only layers). Built using `Dockerfile`. |
| **Container** | Running instance of an image. Has its own filesystem, network, processes. |
| **Registry** | Storage for images (e.g., DockerHub, ECR, GCR). |
| **Volume** | Persistent data storage outside container lifecycle. |
| **Network** | Communication layer between containers (bridge, host, overlay). |

---

## ⚡ Dockerfile Essentials

| Instruction | Use Case |
|-------------|----------|
| `FROM` | Base image (e.g., `node:18-alpine`) |
| `WORKDIR` | Sets working directory inside container |
| `COPY` | Copies files from host to container |
| `RUN` | Executes command at **build time** (creates a layer) |
| `CMD` | Default command when container runs (can be overridden). Only one will run, if you have multiple the last one will override the above ones |
| `ENTRYPOINT` | Fixed command, container behaves like executable |
| `EXPOSE` | Documents port (does not publish) |
| `ENV` | Environment variables |
| `ARG` | Build-time variables |
| `USER` | Run container as non-root user |

---

## ⚡ CMD vs ENTRYPOINT

- `CMD` → Default arguments (can be overridden via `docker run`).  
- `ENTRYPOINT` → Main command (always executed). Can also use sh scripts to get executed.  
- **Combine them** → ENTRYPOINT as executable, CMD as default args.  

Example:
```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```
→ Runs `python app.py` but you can override with `docker run image script.py`.

---

## ⚡ Multi-Stage Builds

- Used to create **small & optimized images**.  
- First stage: build (heavy tools, compilers).  
- Second stage: runtime (only binaries & dependencies).  

Example:
```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

---

## ⚡ Keeping Images Lightweight

- Use `alpine` images if possible.  
- Remove build dependencies in final stage.  
- `.dockerignore` unnecessary files.  
- Use multi-stage builds.  
- Minimize layers (combine `RUN` commands).  

---

## ⚡ Docker Volumes

| Type | Use Case |
|------|----------|
| **Anonymous Volume** | Temporary, deleted with container. |
| **Named Volume** | Persistent, managed by Docker (`docker volume ls`). |
| **Bind Mount** | Directly maps host path to container path. Useful in dev for hot-reload. |

---

## ⚡ Docker Networks

| Network Type | Use Case |
|--------------|----------|
| **Bridge (default)** | Containers communicate on private network, mapped via ports. |
| **Host** | Container shares host network (better performance, less isolation). |
| **Overlay** | Multi-host networking, used in Swarm/K8s. |
| **Macvlan** | Assigns MAC address, container looks like a physical device. |

---

## ⚡ Docker Compose

- Used to define & run multi-container applications.  
- Defined in `docker-compose.yml`.  
- Useful for local dev & integration testing.  

### Example
```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
    volumes:
      - .:/app
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

---

## ⚡ Common Docker Commands

### Images
```sh
docker build -t myapp:1.0 .
docker images
docker rmi <image_id>
```

### Containers
```sh
docker run -d -p 8080:80 myapp
docker ps -a
docker exec -it <container_id> sh
docker logs -f <container_id>
```

### Volumes & Networks
```sh
docker volume ls
docker volume rm <name>
docker network ls
docker network inspect <name>
```

### System Cleanup
```sh
docker system prune -a
```

### Push image to docker hub
```sh
docker build -t <image-name>:latest .
docker tag <image-name>:latest <image-name>:v1.0.0
docker push <image-name>:v1.0.0
docker push <image-name>:latest
```



---

## ⚡ Common Docker Compose Commands
```sh
docker compose up -d
docker compose down
docker compose ps
docker compose logs -f
docker compose exec app sh
```

---

## ⚡ Edge Cases & Tips

- **Detached vs Attached Mode** → `-d` runs in background.  
- **Port Conflicts** → Two containers can’t expose same host port.  
- **Restart Policies** (`--restart`) → `no`, `always`, `on-failure`, `unless-stopped`.  
- **Container Logs** → Rotate logs else `/var/lib/docker` fills up.  
- **Resource Limits** → Use `--cpus` and `--memory` to avoid resource hogging.  
- **Healthchecks** → Add to ensure container is "ready".  

Example:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

# ✅ Quick Revision Flow
1. Build lightweight **images** (multi-stage, alpine, .dockerignore).  
2. Use **volumes** for persistence.  
3. Connect containers via **networks**.  
4. Use **compose** for orchestration.  
5. Add **healthchecks & restart policies** for resilience.  
6. Clean up unused images/volumes to save disk.  
