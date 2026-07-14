# AIoT Activity Hub Maintenance Guide

## Preventive Maintenance

### MQTT Broker and Server
- Daily: ตรวจสอบ uptime และ connection error ของ broker จาก logs หรือ monitoring dashboard
- Weekly: เคลียร์ retained messages ที่ไม่จำเป็นก่อนเริ่มกิจกรรมรอบใหม่
- Per event: ทดสอบ publish และ subscribe ด้วยทีมตัวอย่างอย่างน้อย 1 ทีมก่อนเปิดใช้งานจริง

### Data Management
- เมื่อสิ้นสุดกิจกรรม ให้ทำ archive หรือ purge ข้อมูล time-series ที่ไม่ต้องใช้งานต่อ
- หากเชื่อมต่อฐานข้อมูลจริง ให้ตั้ง retention policy สำหรับ sensor telemetry แยกจาก audit logs

### Security
- Rotate API keys และ credentials ก่อนเริ่มรอบกิจกรรมใหม่
- แยก topic namespace ต่อทีม และกำหนด MQTT ACL ไม่ให้ข้ามทีม
- เก็บค่า secret ในไฟล์ environment หรือ secret manager เท่านั้น

### Dependencies and Updates
- รัน npm audit อย่างน้อยเดือนละ 1 ครั้ง
- อัปเดตแพ็กเกจที่เกี่ยวข้องกับ Next.js, MQTT client และ charting library อย่างสม่ำเสมอ
- สำรองไฟล์ .env และ deployment config ไว้ใน private repository หรือ secure vault

## Operational Recovery
- หาก broker ล่มชั่วคราว ให้เปิด MQTT_DEMO_MODE=true เพื่อสาธิต UI ต่อได้
- หากกราฟค้าง ให้รีเฟรชหน้าเพื่อตั้งค่า realtime simulator ใหม่
- หาก build production ไม่ผ่าน ให้ตรวจสอบค่า environment และ compatibility ของ Node.js ก่อนเสมอ