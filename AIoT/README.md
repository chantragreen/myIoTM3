# AIoT Activity Hub

Modern AIoT Dashboard + Control Center สำหรับกิจกรรม Workshop/Hackathon

## 1) Project Structure (Next.js + TailwindCSS)

```text
AIoT/
  spec.md
  package.json
  tsconfig.json
  next.config.mjs
  tailwind.config.ts
  postcss.config.js
  .env.example
  .eslintrc.json
  app/
    layout.tsx
    page.tsx
    globals.css
    login/page.tsx
    (protected)/
      layout.tsx
      dashboard/page.tsx
      devices/page.tsx
      automation/page.tsx
    api/
      devices/route.ts
      devices/[id]/route.ts
      mqtt/status/route.ts
      mqtt/subscribe/route.ts
      mqtt/publish/route.ts
      mqtt/stream/route.ts
  components/
    auth/auth-gate.tsx
    layout/sidebar.tsx
    layout/topbar.tsx
    common/stat-card.tsx
    dashboard/telemetry-chart.tsx
    dashboard/gauge-widget.tsx
    devices/device-form-modal.tsx
    devices/device-table.tsx
    automation/rule-builder.tsx
  lib/
    mock-telemetry.ts
    use-realtime-telemetry.ts
    server/
      mqtt-client.ts
      device-registry.ts
  store/
    auth-store.ts
    device-store.ts
  types/
    device.ts
    telemetry.ts
  docs/
    USER_MANUAL_TH.md
    MAINTENANCE_GUIDE_TH.md
```

## 2) Design Direction (UI/UX)

- แนวทาง Modern + Glassmorphism พร้อม gradient background และ soft grid texture
- Dashboard รองรับ Responsive 100% ทั้ง mobile/tablet/desktop
- Sidebar + Topbar + Widget layout ที่ปรับตามหน้าจอ
- Widget รองรับ Line/Area/Gauge และ bind topic เบื้องต้น

## 3) Frontend Features

- Login หน้า Team ID + Password
- Dashboard แสดง Dummy Realtime Data ด้วย Recharts
- Add Widget และเลือก topic (temperature/humidity/light)
- Devices page เพิ่ม/ลบอุปกรณ์แบบ dynamic
- Automation page สำหรับตั้ง AI Rule แบบฟอร์ม

## 4) Backend / Service API Features

เชื่อมต่อ MQTT Broker ที่ `172.16.3.205` ผ่าน service layer ที่ไฟล์ `lib/server/mqtt-client.ts`

### API Endpoints

- `GET /api/devices?teamId=<TEAM_ID>` ดึงรายการอุปกรณ์
- `POST /api/devices` เพิ่มอุปกรณ์ (รับ `x-team-id` header)
- `DELETE /api/devices/:id` ลบอุปกรณ์
- `GET /api/mqtt/status` ตรวจสถานะ MQTT connection
- `POST /api/mqtt/subscribe` subscribe topic
- `POST /api/mqtt/publish` publish message
- `GET /api/mqtt/stream?topic=team/+/+/+` รับข้อความแบบ SSE

## 5) Installation & Run Commands (Detailed)

### Prerequisites

1. Node.js 20+ (แนะนำ LTS)
2. npm 10+
3. สามารถเข้าถึง MQTT Broker `172.16.3.205:1883`

### Setup

1. เปิด terminal ที่โฟลเดอร์โปรเจกต์

```bash
cd /workspaces/myIoTM3/AIoT
```

2. ติดตั้ง dependencies

```bash
npm install
```

3. สร้างไฟล์ environment

```bash
cp .env.example .env.local
```

4. (ถ้ามี auth) กำหนดค่า MQTT ใน `.env.local`

```bash
MQTT_URL=mqtt://172.16.3.205:1883
MQTT_USERNAME=
MQTT_PASSWORD=
```

### Run Development

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่:

- `http://localhost:3000/login`

### Build Production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## 6) Example MQTT API Usage

Subscribe topic:

```bash
curl -X POST http://localhost:3000/api/mqtt/subscribe \
  -H "Content-Type: application/json" \
  -d '{"topic":"team/<TEAM_ID>/+/temperature"}'
```

Publish command:

```bash
curl -X POST http://localhost:3000/api/mqtt/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"team/<TEAM_ID>/device-001/relay/1/cmd","message":"ON","qos":1}'
```

## 7) User Manual & Maintenance Guide

- คู่มือผู้ใช้: `docs/USER_MANUAL_TH.md`
- คู่มือบำรุงรักษา: `docs/MAINTENANCE_GUIDE_TH.md`

## 8) Notes for Extension

- ตอนนี้ Device Registry เป็น in-memory store เพื่อเดโม
- แนะนำเปลี่ยนเป็น PostgreSQL/Redis สำหรับ production
- แนะนำเพิ่ม ACL enforcement ต่อ team ที่ MQTT broker layer
