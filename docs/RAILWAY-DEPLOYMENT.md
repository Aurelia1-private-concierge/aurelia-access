# Aurelia Railway Deployment Guide

## Prerequisites
- Railway account connected to GitHub
- Access to Aurelia GitHub repository
- Domain: aurelia-privateconcierge.com

## Quick Deploy

### 1. Create Railway Project
```bash
# Via Railway CLI
railway login
railway init
railway up
```

### 2. Connect GitHub Repository
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select the Aurelia repository
4. Railway auto-detects settings from `railway.json`

### 3. Configure Environment Variables

Add these in Railway Dashboard → Variables:

```env
# Required
NODE_ENV=production
VITE_SUPABASE_URL=https://dukohtdvhsdckizneksr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a29odGR2aHNkY2tpem5la3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTc4MzYsImV4cCI6MjA4MzM5MzgzNn0.NTLfgFXDMvJp1xVkT7ZgZH91vImfwuGwKloQjrUdnQE

# Optional (for Sentry monitoring)
VITE_SENTRY_DSN=your-sentry-dsn
```

### 4. Custom Domain Setup

1. In Railway: Settings → Domains → Add Custom Domain
2. Enter: `aurelia-privateconcierge.com`
3. Add DNS records at your registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | your-app.up.railway.app |
| CNAME | www | your-app.up.railway.app |

Or if using A records:
| Type | Name | Value |
|------|------|-------|
| A | @ | (Railway's IP from dashboard) |
| A | www | (Railway's IP from dashboard) |

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://aurelia-privateconcierge.com/health.json

# Expected response
{"status":"healthy","service":"aurelia-private-concierge","version":"1.0.0"}
```

## Post-Deployment Checklist

### Monitoring Setup
- [ ] UptimeRobot: Add monitor for `/health.json`
- [ ] Sentry: Verify error tracking is active
- [ ] Railway Observability: Enable in dashboard

### Performance Verification
```bash
# Run Lighthouse audit
npx lighthouse https://aurelia-privateconcierge.com --output html --output-path ./lighthouse-report.html
```

Target metrics:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### Security Verification
- [ ] SSL certificate active (auto-provisioned)
- [ ] HTTPS redirects working
- [ ] CSP headers present (check in browser DevTools)

### Global Access Test
Test from these regions (use VPN):
- [ ] United States (East/West Coast)
- [ ] United Kingdom
- [ ] UAE (Dubai)
- [ ] Singapore
- [ ] Germany (EU)

## Rollback Procedure

```bash
# Via Railway CLI
railway rollback

# Or in dashboard: Deployments → Select previous → Rollback
```

## Troubleshooting

### Build Fails
```bash
# Check build logs
railway logs --build

# Common fixes:
npm ci --legacy-peer-deps
```

### Static Assets 404
Ensure `dist` folder is served with SPA fallback:
```bash
npx serve dist -s
```

### Environment Variables Not Loading
- Verify VITE_ prefix for frontend variables
- Redeploy after adding new variables

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Railway                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Aurelia Frontend (Vite)                 │    │
│  │  - Static assets served via `serve`                  │    │
│  │  - SPA routing with fallback                         │    │
│  │  - Health endpoint at /health.json                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Lovable Cloud (Supabase)                  │
│  - Database (PostgreSQL)                                     │
│  - Authentication                                            │
│  - Edge Functions                                            │
│  - File Storage                                              │
└─────────────────────────────────────────────────────────────┘
```

## Support

- Railway Status: https://status.railway.app
- Lovable Support: support@lovable.dev
