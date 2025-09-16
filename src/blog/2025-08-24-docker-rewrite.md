---
title: "Platform Rewrite: Switching from OS processes to Docker containers"
description: "Learn how we modernized our MCP-as-a-Service platform with a comprehensive Docker rewrite, replacing fragile OS process management with containerized orchestration."
author: "Manuel Kießling"
published_time: "2025-08-24T00:00:00+00:00"
tags: [Docker, Infrastructure, DevOps, MCP, Playwright, VNC, Traefik]
readTime: "12 min read"
---

> How we transformed our MCP-as-a-Service platform from fragile OS process management to a robust, containerized architecture that improves reliability and enables future growth.

### 📑 Read the code

You can find the full changeset for the Docker rewrite on our GitHub repository: [See the full changeset →](https://github.com/dx-tooling/maas-webapp/pull/2/files)

## The Challenge: Architectural Dead End

Our original proof-of-concept architecture relied on managing multiple OS processes directly on the host system:

- **Xvfb** – Virtual display server for headless browser environments
- **Playwright MCP** – Node.js-based MCP server for browser automation
- **x11vnc** – VNC server for remote desktop access
- **websockify** – WebSocket proxy for browser-based VNC access

While this approach worked for initial testing and development, it revealed fundamental architectural limitations that made it unsuitable for serious production use:

- **Dynamic port management** – Each instance required unique host ports, leading to port conflicts and complex allocation logic
- **Process fragility** – OS processes could crash silently, requiring complex monitoring and restart logic
- **Resource isolation** – Limited isolation between instances, potential for resource contention
- **Deployment complexity** – Difficult to ensure consistent environments across development and production
- **Scaling limitations** – Adding new MCP instance types required significant infrastructure changes
- **Architectural dead end** – The approach fundamentally couldn't provide the reliability and scalability needed for production

## Our Solution: Complete Architectural Overhaul

Rather than trying to patch the fundamentally flawed OS process approach, we decided to completely redesign the architecture from the ground up. We replaced the entire system with a Docker-centric, subdomain-based solution that provides proper isolation, reliability, and scalability.

### Container Design

Each MCP instance container encapsulates all the necessary components:

- **Base Image** – Node.js 22 on Debian Bookworm for optimal Playwright compatibility
- **Process Management** – Supervisord to orchestrate the four core processes in the correct order
- **Fixed Internal Ports** – MCP (8080), VNC (5900), noVNC (6080) – no more dynamic host port mapping
- **Resource Limits** – 1GB memory limit per container with automatic restart policies
- **Health Checks** – Built-in Docker health checks for noVNC endpoint availability

### Networking Revolution with Traefik

The most significant improvement came from replacing nginx-based routing with Traefik:

- **Subdomain-based routing** – Each instance gets predictable URLs: `mcp-{id}.mcp-as-a-service.com` and `vnc-{id}.mcp-as-a-service.com`
- **Dynamic discovery** – Traefik automatically discovers containers via Docker labels, eliminating manual nginx configuration
- **TLS termination** – Centralized SSL/TLS handling with existing wildcard certificates
- **ForwardAuth integration** – Bearer token validation at the edge for MCP endpoints

## Technical Implementation Details

### Supervisor Process Orchestration

Inside each container, Supervisord manages the process lifecycle with proper dependencies:

1. **Xvfb (Priority 10)** – Virtual display server starts first
2. **Playwright MCP (Priority 20)** – Waits for Xvfb, starts MCP server on port 8080
3. **x11vnc (Priority 30)** – Waits for Xvfb, starts VNC server on port 5900
4. **websockify (Priority 40)** – Waits for x11vnc, proxies VNC to port 6080 for browser access

### Traefik Label Configuration

Each container automatically configures its own routing via Docker labels:

```text
# MCP endpoint routing
traefik.http.routers.mcp-{instance}.rule=Host(`mcp-{instance}.mcp-as-a-service.com`)
traefik.http.services.mcp-{instance}.loadbalancer.server.port=8080
traefik.http.middlewares.mcp-{instance}-auth.forwardauth.address=https://app.mcp-as-a-service.com/auth/mcp-bearer-check

# VNC endpoint routing
traefik.http.routers.vnc-{instance}.rule=Host(`vnc-{instance}.mcp-as-a-service.com`)
traefik.http.services.vnc-{instance}.loadbalancer.server.port=6080
```

### ForwardAuth Security

We implemented a custom ForwardAuth endpoint in Symfony that validates MCP bearer tokens:

- **Edge enforcement** – Authentication happens before requests reach the MCP container
- **Instance identification** – Extracts instance ID from subdomain for token validation
- **Performance optimized** – 5-minute in-memory cache for static bearer tokens
- **Security hardened** – Constant-time comparison and rate limiting

## Production Architecture

Our production deployment uses a hybrid approach that maximizes performance while maintaining reliability:

```text
Internet (80/443) → Traefik Container → {
  app.mcp-as-a-service.com → nginx:8090 (native Symfony webapp)
  mcp-{id}.mcp-as-a-service.com → mcp-instance-container:8080
  vnc-{id}.mcp-as-a-service.com → mcp-instance-container:6080
}
```

- **Native webapp** – Symfony application runs natively for optimal performance
- **Containerized MCP instances** – Isolated, scalable browser environments
- **Traefik reverse proxy** – Handles all HTTP traffic and TLS termination
- **Shared Docker network** – Enables secure communication between Traefik and MCP containers

## Results and Technical Improvements

### Reliability Improvements

- **Process stability** – Container isolation prevents cascading failures
- **Automatic recovery** – Docker restart policies handle crashes gracefully
- **Health monitoring** – Built-in health checks provide real-time status
- **Predictable lifecycle** – Start/stop/restart operations are atomic and reliable

### Operational Improvements

- **Simplified deployment** – No more dynamic port allocation or nginx configuration
- **Better observability** – Docker logs and metrics provide clear visibility
- **Easier debugging** – Container isolation makes issues easier to reproduce and fix
- **Scaling foundation** – Easy to add new MCP instance types and scale horizontally

### Developer Experience Improvements

- **Consistent environments** – Development and production use identical container images
- **Local testing** – Docker Compose setup enables full local development
- **Predictable URLs** – Subdomain-based routing eliminates port confusion
- **Simplified CLI** – Docker commands replace complex process management

The Docker rewrite has transformed the MCP-as-a-Service platform from a proof-of-concept into a robust, scalable foundation. By recognizing the architectural dead end early and making the decision to completely redesign the system, we've created a platform that not only meets our current needs but also provides a solid base for future development.


