# AIoT Activity Hub - Current Production Specification

## 1) Objective

แพลตฟอร์มสำหรับการเรียนรู้และปฏิบัติการ AIoT แบบเรียลไทม์ โดยเชื่อมต่อ Edge Device (Pico W) ผ่าน MQTT และแสดงผลใน Dashboard สำหรับทีมงานแต่ละทีมอย่างแยกขอบเขตข้อมูล

## 2) Stakeholders

- ผู้เรียนและผู้เข้าร่วมกิจกรรม AIoT
- ผู้ดูแลระบบและผู้สอน
- อุปกรณ์ Edge Station (Raspberry Pi Pico W)
- โหนดศูนย์กลาง (Raspberry Pi 5 + MQTT Broker)

## 3) System Context

- Web App: Next.js App Router (production web UI + API)
- Broker: MQTT ที่ปลายทาง mqtt://172.16.3.205:1883
- Streaming: Server-Sent Events ผ่าน API stream
- Deployment: PM2 process ชื่อ aiot-hub

## 4) Core Functional Requirements

### 4.1 Authentication and Team Workspace

- ผู้ใช้ต้องเข้าสู่ระบบด้วย Team ID และ Password
- ระบบต้อง reject TEAM-DEMO เสมอ
- Workspace ต้องแยกข้อมูลตาม Team ID

### 4.2 Team Policy Control (Settings)

- รองรับนโยบาย lock แบบ allowed-team-list
- เมื่อ lock เปิด: อนุญาตเฉพาะทีมใน allowed list
- TEAM-DEMO อยู่ใน blocked list ถาวร
- มีฟังก์ชัน Save Policy และ Reset Policy
- รองรับ Export JSON และ Import JSON

### 4.3 Team Policy Audit

- ต้องบันทึก audit ทุก action สำคัญ (update, reset)
- แต่ละรายการต้องมี ts, actor, sourceIp, userAgent, lockEnabled, allowedTeamIds
- รองรับตัวกรอง audit: actor, action, from, to, limit
- รองรับดาวน์โหลด audit 2 รูปแบบ
	- NDJSON
	- CSV
- retention ของไฟล์ audit ต้องคงไว้สูงสุด 10,000 บรรทัดล่าสุด
- ตาราง audit บนหน้า Settings ต้องมี pagination (rows per page + prev/next)

### 4.4 Device and Presence Management

- API devices ต้องบังคับ teamId และตรวจ policy ทุกครั้ง
- รายการอุปกรณ์ต้องรวมทั้ง static registry และ MQTT-discovered presence
- แสดงสถานะ online/offline ตาม heartbeat timeout 60 วินาที
- หน้า Devices แสดง Last Seen และ refresh รายการทุก 10 วินาที

### 4.5 Realtime Telemetry and Dashboard

- Dashboard รับข้อมูล realtime ผ่าน SSE จาก MQTT stream
- ต้อง subscribe แบบครอบคลุม nested topic ของทีม (team/{teamId}/#)
- แสดงค่า temperature, humidity, light สำหรับอุปกรณ์ที่เลือก
- แสดงสถานะ MQTT Connected/Disconnected
- รองรับ device selector สำหรับดูข้อมูลรายอุปกรณ์
- แสดง Push Button ของอุปกรณ์ที่เลือกจาก topic
	- team/{teamId}/{deviceId}/button/1/state
	- ค่าเป้าหมาย: PRESSED หรือ RELEASED
- ต้องมีแผง Push Button Status By Device เพื่อดูหลายอุปกรณ์ในหน้าเดียว
	- เลือกหลายอุปกรณ์ได้ด้วย checkbox
	- มีปุ่ม Show All, Select All, Clear Filter
	- แต่ละการ์ดแสดงสถานะปุ่มและ online/offline hint

## 5) API Requirements

### 5.1 Team Policy API

- GET /api/settings/team-policy
	- คืนค่า policy + blockedTeamIds + audit
	- รองรับ query: actor, action, from, to, limit
	- รองรับ downloadAudit=1
	- รองรับ format=ndjson หรือ format=csv เมื่อ download
- POST /api/settings/team-policy
	- บันทึก policy และเขียน audit
- PUT /api/settings/team-policy
	- พฤติกรรมเทียบเท่า POST
- DELETE /api/settings/team-policy
	- reset policy และเขียน audit

### 5.2 Devices API

- GET /api/devices?teamId={TEAM_ID}
- POST /api/devices โดยใช้ header x-team-id
- ต้องตรวจทีมผ่าน policy ก่อนทุกครั้ง

### 5.3 MQTT APIs

- GET /api/mqtt/status สำหรับ health/status
- GET /api/mqtt/stream?topic=... สำหรับ SSE
	- ต้องรองรับ MQTT wildcard matching (+, #) อย่างถูกต้อง

## 6) Non-Functional Requirements

- Production-safe defaults: ไม่มี demo fallback ใน production
- รองรับ browser ที่อาจไม่มี crypto.randomUUID โดยมี fallback generator
- Build และ Lint ต้องผ่านก่อน deploy
- Deploy ต้อง reload PM2 และมี health check ผ่านหลัง deploy

## 7) Acceptance Criteria

- ผู้ใช้ที่เป็น TEAM-DEMO login ไม่ผ่าน
- เปิด lock และกำหนด allowed list แล้ว ทีมที่ไม่อยู่ในรายการเข้าถึง API ไม่ได้
- กด Save/Reset ที่ Settings แล้วมี audit log ใหม่พร้อม metadata
- Download audit แบบ NDJSON และ CSV ได้จริง
- ตาราง audit เปลี่ยนหน้าได้และเลือกจำนวนแถวต่อหน้าได้
- Dashboard แสดงค่า sensor แบบ realtime ต่อทีม
- เมื่อกดปุ่มจริงบน Pico W สถานะ Push Button เปลี่ยนเป็น PRESSED/RELEASED ทั้งในการ์ดหลักและในแผงหลายอุปกรณ์
- สถานะอุปกรณ์เปลี่ยน offline เมื่อไม่มี heartbeat เกิน 60 วินาที