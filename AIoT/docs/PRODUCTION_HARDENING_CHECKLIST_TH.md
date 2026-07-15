# Production Hardening Checklist (Raspberry Pi 5)

โปรเจกต์: AIoT Activity Hub (Next.js + MQTT)

สภาพแวดล้อมเป้าหมาย:
- Application Host: Raspberry Pi 5
- MQTT Broker: 172.16.3.205:1883 (หรือ localhost หากติดตั้งบนเครื่องเดียวกัน)

## 1) System Baseline

- [ ] อัปเดตระบบปฏิบัติการล่าสุด
  - `sudo apt update && sudo apt -y full-upgrade`
- [ ] ตั้ง timezone ให้ถูกต้อง
  - `sudo timedatectl set-timezone Asia/Bangkok`
- [ ] ตั้ง hostname สำหรับ production ให้ชัดเจน
  - `sudo hostnamectl set-hostname aiot-prod-rpi5`
- [ ] สร้าง user สำหรับ deploy และปิดการใช้งานที่ไม่จำเป็น
- [ ] เปิดใช้งาน unattended security upgrades
  - `sudo apt install -y unattended-upgrades`

## 2) Access Control และ SSH Security

- [ ] ใช้ SSH key authentication เท่านั้น
- [ ] ปิด PasswordAuthentication ใน `/etc/ssh/sshd_config`
- [ ] ปิด root login (`PermitRootLogin no`)
- [ ] จำกัด source IP ที่เข้า SSH ได้ (ถ้าเป็นไปได้)
- [ ] ติดตั้ง fail2ban ป้องกัน brute force
  - `sudo apt install -y fail2ban`

## 3) Network และ Firewall

- [ ] ใช้ไฟร์วอลล์เปิดเฉพาะพอร์ตจำเป็น
  - `22` (SSH), `80/443` (Web), `1883` (MQTT)
- [ ] ปิดพอร์ตอื่นทั้งหมดโดย default deny
- [ ] หาก MQTT ไม่ต้องเปิดภายนอก ให้ bind ภายใน LAN เท่านั้น
- [ ] แยก VLAN/Network สำหรับ IoT devices หากโครงสร้างรองรับ

## 4) MQTT Broker Hardening

- [ ] ปิด anonymous access (`allow_anonymous false`)
- [ ] ตั้ง username/password หรือ client certificates
- [ ] กำหนด ACL แยกตาม Team ID
- [ ] จำกัดการ subscribe ข้ามทีม
- [ ] ทดสอบ retained messages และนโยบาย clear retained หลังจบกิจกรรม
- [ ] เปิด log ระดับเหมาะสม และวาง log rotation

## 5) Application Build และ Runtime

- [ ] ใช้ Node.js 20 LTS
- [ ] ติดตั้ง dependencies ด้วย `npm ci` เท่านั้น
- [ ] สร้างไฟล์ `.env.local` จาก `.env.example`
- [ ] ไม่ commit secret ลง Git
- [ ] รัน `npm run lint` และ `npm run build` ผ่านก่อน deploy
- [ ] รันแอปด้วย PM2 จากไฟล์ `ecosystem.config.cjs`
  - `pm2 start ecosystem.config.cjs`
  - `pm2 save && pm2 startup systemd`

## 6) Reverse Proxy และ TLS

- [ ] ใช้ Nginx เป็น reverse proxy
- [ ] ใช้ config จาก `deploy/nginx/aiot-hub.conf`
- [ ] ตั้งค่า `server_name` ให้ตรงโดเมนจริง
- [ ] เปิดใช้งาน HTTPS (Let's Encrypt/องค์กร)
- [ ] redirect HTTP -> HTTPS
- [ ] ยืนยันว่า endpoint SSE (`/api/mqtt/stream`) ปิด buffering แล้ว

## 7) Secrets และ Configuration Management

- [ ] เก็บ `.env.local` ด้วยสิทธิ์ที่เหมาะสม (`chmod 600`)
- [ ] แยก secret ของ dev/staging/prod ชัดเจน
- [ ] จัดรอบเปลี่ยนรหัสผ่าน MQTT และ API keys
- [ ] มี runbook ขั้นตอน rotate credentials

## 8) Logging, Monitoring, Alerting

- [ ] เก็บ log ของ PM2 และ Nginx แยกไฟล์
- [ ] เปิด log rotation ป้องกัน disk เต็ม
- [ ] เก็บ metrics ขั้นต่ำ: CPU, RAM, Disk, Network, process restarts
- [ ] ตั้ง alert เมื่อ service down หรือ restart ถี่ผิดปกติ
- [ ] ตรวจสอบ endpoint สุขภาพระบบ เช่น `/api/mqtt/status`

## 9) Data Safety และ Backup

- [ ] สำรอง config สำคัญ: `.env.local`, Nginx, Mosquitto, PM2
- [ ] กำหนดตาราง backup รายวัน/รายสัปดาห์
- [ ] ทดสอบ restore จริงอย่างน้อยเดือนละ 1 ครั้ง
- [ ] ถ้าข้อมูล telemetry เก็บถาวร ให้มีนโยบาย archive/purge

## 10) Operational Readiness

- [ ] มีเอกสาร runbook: start/stop/restart/rollback
- [ ] มี owner และ on-call contact ชัดเจน
- [ ] ทำ smoke test ก่อนเปิดใช้งานทุกครั้ง:
  - [ ] หน้า login เปิดได้
  - [ ] เพิ่ม/ลบ device ได้
  - [ ] publish/subscribe MQTT ผ่าน API ได้
  - [ ] dashboard แสดงข้อมูลเรียลไทม์
- [ ] ทดสอบกรณี broker ล่มและ recovery
- [ ] ทดสอบ reboot เครื่องและยืนยัน auto-start ทุก service

## 11) Release Checklist (ก่อน Go-Live)

- [ ] Tag release และบันทึก changelog
- [ ] ตรึงเวอร์ชัน dependencies ที่ใช้จริง
- [ ] ตรวจ `npm audit` และประเมินความเสี่ยงที่ยอมรับได้
- [ ] ยืนยันว่าไม่มีค่า default password/placeholder เหลืออยู่
- [ ] ยืนยันสิทธิ์ไฟล์และโฟลเดอร์สำคัญถูกต้อง

## 12) คำสั่งตรวจสอบที่ใช้บ่อย

- สถานะ PM2:
  - `pm2 status`
  - `pm2 logs aiot-hub --lines 100`
- สถานะ Nginx:
  - `sudo nginx -t`
  - `sudo systemctl status nginx`
- สถานะ Mosquitto:
  - `sudo systemctl status mosquitto`
- ทดสอบ API:
  - `curl -s http://127.0.0.1:3000/api/mqtt/status`

---

Owner ทีมควรรีวิว checklist นี้ก่อนทุกกิจกรรม/ทุก deployment เพื่อความสม่ำเสมอและความปลอดภัยของระบบ Production
