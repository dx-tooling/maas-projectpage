---
title: "Fixing \"Moved Permanently\" on MCP instance endpoints"
description: "Root cause: Symfony generated an http ForwardAuth address for Traefik due to incomplete trusted headers; Traefik then redirected (301) to https. We updated trusted headers and proxy settings to generate https."
author: "Manuel Kießling"
published_time: "2025-08-30T00:00:00+00:00"
tags: [Symfony, Traefik, Reverse Proxy, Trusted Proxies]
readTime: "4 min read"
---

A small configuration gap between our app and the reverse proxy caused certain instance HTTP endpoints to reply with "Moved Permanently" (HTTP 301). This post explains what happened and how we fixed it.

## The short version

Some links to MCP instance endpoints unexpectedly redirected. The root cause: Symfony generated an *http* URL for our authentication callback (ForwardAuth) that Traefik uses to validate tokens. Traefik then redirected that address to *https* (301). We updated our settings so Symfony trusts the proxy and generates the correct *https* URL. After the change, those endpoints respond normally again—no more surprise redirects.

> What changed?

- We told Symfony exactly which proxy to trust.
- We listed all standard `X-Forwarded-*` headers it should honor.
- We added a short troubleshooting note to our runbook.

## The technical details

The webapp runs behind Traefik. Symfony needs to trust the proxy and consume `X-Forwarded-*` headers to reconstruct the original request's scheme, host, and port. With incomplete trusted header configuration, Symfony produced an `http` URL when composing the ForwardAuth address used in the Traefik label `traefik.http.middlewares.mcp-<slug>-auth.forwardauth.address`. Traefik subsequently redirected that address to `https` with a 301.

We fixed this by:

- Declaring the proxy via `TRUSTED_PROXIES=REMOTE_ADDR` so Symfony trusts the immediate reverse proxy.
- Expanding `framework.trusted_headers` to include `x-forwarded-for`, `x-forwarded-host`, `x-forwarded-proto`, `x-forwarded-port`, and `x-forwarded-prefix`.

```text
# .env.prod.local.dist
TRUSTED_PROXIES=REMOTE_ADDR

# config/packages/framework.yaml (excerpt)
framework:
  trusted_proxies: '%env(TRUSTED_PROXIES)%'
  trusted_headers: ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-forwarded-prefix']
```

```text
# Traefik label (before → after)
traefik.http.middlewares.mcp-<slug>-auth.forwardauth.address=http://app.mcp-as-a-service.com/auth/mcp-bearer-check
# becomes
traefik.http.middlewares.mcp-<slug>-auth.forwardauth.address=https://app.mcp-as-a-service.com/auth/mcp-bearer-check
```

For operational visibility, we also added a small runbook snippet to quickly inspect Traefik-discovered labels on an instance container when debugging routing:

```bash
docker inspect mcp-instance-<slug> | jq -r '.\[0\].Config.Labels
| to_entries[]
| select(.key|startswith("traefik.http."))
| "\(.key)=\(.value)"'
```

References: [Issue #4](https://github.com/dx-tooling/maas-webapp/issues/4), [PR #5](https://github.com/dx-tooling/maas-webapp/pull/5/files), and [orchestration docs](https://github.com/dx-tooling/maas-webapp/blob/main/docs/orchestration.md).


