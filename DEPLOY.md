# Deployment - Solutio Carto V2

## Current Status
- Server running on port 3002 with basic auth
- Auth: tlb / SolutioV2Carto2026

## To add subdomain (requires sudo)

1. Edit Caddy config:
```bash
sudo nano /etc/caddy/Caddyfile
```

2. Add this block:
```
carto2.solutio.work {
    reverse_proxy localhost:3002
}
```

3. Reload Caddy:
```bash
sudo systemctl reload caddy
```

4. Point DNS: Add an A record for `carto2.solutio.work` pointing to this server's IP.

## To rebuild and redeploy

```bash
cd /home/claude-user/solu-ai-finder-v2
npm run build
./start-server.sh
```

## To stop

```bash
pkill -f "node.*server.mjs"
```
