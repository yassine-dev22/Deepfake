# Admin Dashboard Redesign — SecurAI

## Overview
Redesigned the admin dashboard interface to match modern cyberpunk design patterns from the provided React reference code. The new interface features:
- Modern design tokens (colors, fonts, animations)
- Real-time KPI cards with cyberpunk aesthetics
- Live system logs with colored severity levels
- Execution modes toggle
- Attack state visualization
- 500ms polling interval for real-time updates

## Files Modified

### Templates
- **`templates/admin.html`** — Complete redesign
  - New HTML structure matching AdminDashboard component from React reference
  - Implemented all CSS design tokens (colors, fonts, spacing)
  - Added animations: pulse-cyan, pulse-red, blink keyframes
  - KPI row with 4 cards (FPS, Latence, Anomalie, Identité)
  - Control row with Execution Modes and Attack State
  - Live Logs section with terminal styling

### Static Assets
- **`static/admin.js`** — Complete rewrite for new interface
  - Polling logic: Fetches `/api/admin/stats` every 500ms
  - DOM update handlers for all metrics (FPS, Latency, Anomaly, Identity, Confidence)
  - Mode toggle functionality (CPU, GPU, EDGE modes)
  - Attack injection button with parameter display
  - Log management with auto-scroll and history buffering (max 120 logs)
  - Graceful error handling with console logging

## Key Features

### Real-Time Metrics
- **FPS (Frames Per Second)** — Display metric with cyan accent
- **Latence (Inference Latency)** — Display metric in milliseconds with yellow accent
- **Score d'Anomalie (Anomaly Score)** — FFT-based detection with red warning accent
- **Identité (Identity)** — Display recognized person name + confidence + access badge

### Interactive Controls
- **Execution Modes** — Toggle between STANDARD CPU_LOCAL, GPU_ACCELERATED, EDGE_ONLY
- **Attack State** — Launch/stop FGSM injection with parameter display (method, epsilon, iterations, target)
- **Visual Feedback** — Active modes highlighted with cyan border and glow effect

### System Monitoring
- **Live Logs** — Terminal-style viewer with colored severity levels:
  - INFO (cyan)
  - WARN (yellow)
  - ALERT (red)
  - SUCCESS (green)
- **System Status** — Auto-scroll to latest logs, keeps last 120 entries
- **Live Indicator** — Pulsing green indicator shows real-time monitoring active

## Backend Integration

### API Endpoints
Both `app.py` (HF Remote) and `app_cpu.py` (CPU Local) expose:

#### `/admin`
- Returns rendered HTML dashboard
- Serves from `templates/admin.html`

#### `/api/admin/stats`
- Returns JSON metrics for dashboard polling
- **Response format (HF mode):**
  ```json
  {
    "fps": 14,
    "hf_latency_ms": 72,
    "anomaly_score": 0.9777,
    "identity": "MANAGER_YASSINE",
    "confidence": 0.95,
    "access_level": "DENIED",
    "system_mode": "HF_REMOTE"
  }
  ```
- **Response format (CPU mode):**
  ```json
  {
    "fps": 14,
    "infer_ms": 45,
    "fgsm_ms": 15,
    "anomaly_score": 0.9777,
    "identity": "MANAGER_YASSINE",
    "confidence": 0.95,
    "access_level": "DENIED",
    "system_mode": "CPU_LOCAL"
  }
  ```

## Design Tokens (from React reference)
- **Colors:**
  - Background: `#050505` (near black)
  - Panel: `#0F1115` (dark blue-gray)
  - Cyan (active): `#00E5FF`
  - Red (alert): `#FF2A2A`
  - Green (success): `#00FF66`
  - Yellow (warning): `#FFD600`
- **Fonts:**
  - Sans: `Inter, system-ui, -apple-system`
  - Mono: `JetBrains Mono, Courier New`
- **Spacing:** 8px base unit, consistent gaps throughout

## Polling Architecture
- **Interval:** 500ms (client-side `setInterval`)
- **Endpoint:** `/api/admin/stats`
- **Error Handling:** Silently logs errors; continues polling even if requests fail
- **Initial Load:** Logs are prepopulated with system initialization messages

## Testing

Run the test script to verify dashboard functionality:
```bash
python test_admin_dashboard.py
```

This tests:
- `/admin` route returns HTML
- `/api/admin/stats` endpoint returns valid JSON
- Polling works (3 requests with metrics updating)

## Files Created
- `test_admin_dashboard.py` — Endpoint verification tests

## Architecture Decisions

### Why 500ms Polling?
- Balances real-time feel with server load
- Sufficient for perceiving FPS changes and latency updates
- Low bandwidth requirement
- Preserves battery on client devices

### Dual Backend Support
- Single HTML/JS interface works with both app.py (HF Remote) and app_cpu.py (CPU Local)
- Backend identifier returned in `system_mode` field
- Frontend displays appropriate latency metric based on backend

### Design Reference
Redesign based on provided React components featuring:
- SparkCard for metrics with sparkline placeholder
- IdentityCard for biometric info
- ExecutionModes radio button toggles
- AttackState with parameter display
- LiveLogs terminal viewer
- Cyberpunk aesthetic with glowing accents and smooth animations

## Future Enhancements
- Add actual sparkline charts (currently CSS placeholder)
- Implement video feed center panel
- Add defender comparison split-view
- Biometric analysis left panel
- Attack visualization right panel
- WebSocket for lower-latency updates (vs HTTP polling)

---
**Status:** ✓ Admin dashboard redesign complete and integrated with both backends.
