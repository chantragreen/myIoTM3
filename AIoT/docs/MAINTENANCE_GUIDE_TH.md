# คู่มือการบำรุงรักษา (Maintenance Guide)

สำหรับผู้จัดกิจกรรม / System Administrator

## Preventive Maintenance

1. การจัดการ Server (Daily)
- ตรวจสอบสถานะ Uptime ของ MQTT Broker บน Raspberry Pi 5 (IP: 172.16.3.205)
- ตรวจสอบ log การเชื่อมต่อ หากพบการล้มเหลวบ่อย ให้ตรวจสอบ network bandwidth

2. การจัดการ Server (Weekly)
- เคลียร์ retained messages ที่ค้างใน MQTT Broker เพื่อลดการโหลดข้อมูลเก่าซ้ำ

3. การจัดการฐานข้อมูล
- ข้อมูล sensor แบบ time-series มีปริมาณมาก ควรทำ data purging หรือ archive เมื่อสิ้นสุดกิจกรรม

4. ความปลอดภัย (รหัสผ่าน)
- Rotate API keys และรหัสผ่าน database ก่อนเริ่มกิจกรรมรอบใหม่เสมอ

5. ความปลอดภัย (สิทธิ์การเข้าถึง)
- จำกัดสิทธิ์ MQTT ACL เพื่อป้องกันแต่ละทีม subscribe topic ข้ามทีม

6. การอัปเดตระบบ
- รัน npm audit และอัปเดต dependencies อย่างน้อยเดือนละ 1 ครั้ง

7. การสำรองข้อมูล
- สำรองโค้ดและไฟล์คอนฟิก เช่น .env ใน private repository

## Deployment / Rollback มาตรฐานทีม

- Deploy มาตรฐาน (one-command):
	- `./deploy.sh`
- Deploy แบบข้าม lint (กรณีฉุกเฉิน):
	- `SKIP_LINT=1 ./deploy.sh`
- Rollback กลับเวอร์ชันก่อนหน้าโดยระบุ Git ref:
	- `./deploy/rollback.sh HEAD~1`
	- `./deploy/rollback.sh v1.2.3`
- หมายเหตุ:
	- rollback script จะ checkout ไปยังเป้าหมายใน detached HEAD แล้ว build/reload ผ่าน PM2
	- หากมีไฟล์ค้างแก้ไขอยู่ ให้ commit/stash ก่อน หรือใช้ `FORCE=1` เมื่อเข้าใจผลกระทบ

## Troubleshooting เพิ่มเติม

- ปัญหา commit ไม่ได้เพราะไม่ได้ตั้งค่า Git identity:
	- `docs/TROUBLESHOOT_GIT_COMMIT_IDENTITY_TH.md`
