# AIoT Activity Hub

Modern web dashboard สำหรับกิจกรรม AIoT ที่รวมการจัดการอุปกรณ์, realtime sensor visualization, AI trigger rules และ MQTT command console ไว้ในแอปเดียว รองรับการสาธิตได้ทันทีผ่าน dummy realtime feed และ demo publish mode

## Feature Summary
- Device management สำหรับ ESP32, Raspberry Pi และ vision nodes
- Realtime telemetry dashboard ด้วย Recharts และ simulated live feed
- AI automation rule builder สำหรับ If-This-Then-That workflow
- MQTT publish API ที่สลับได้ระหว่าง demo mode และ broker จริง
- Responsive glassmorphism UI พร้อม theme toggle ระหว่าง light และ dark

## Project Structure
- app: UI entry point และ API route handlers
- components: client dashboard components
- hooks: realtime simulation logic
- lib: mock domain data และ MQTT service helpers
- spec.md: product requirement
- user-manual.md: คู่มือผู้ใช้งาน
- maintenance-guide.md: คู่มือผู้ดูแลระบบ
- raspberry-pi-172.16.3.205-guide.md: คู่มือย้ายโค้ดและข้อมูลไปยัง Raspberry Pi 5

## Installation
1. ติดตั้ง dependencies

```bash
npm install
```

2. สร้าง environment file จากตัวอย่าง

```bash
cp .env.example .env.local
```

3. หากต้องการต่อ MQTT จริง ให้แก้ค่าต่อไปนี้ในไฟล์ environment
- MQTT_BROKER_URL
- MQTT_CLIENT_ID
- MQTT_USERNAME
- MQTT_PASSWORD
- MQTT_DEMO_MODE=false

## Run

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

## Validation

```bash
npm run lint
npm run build
```

## MQTT Notes
- ค่าเริ่มต้นใน .env.example ตั้งเป็น demo mode เพื่อให้ UI และ command console ใช้งานได้แม้ยังไม่มี broker
- เมื่อตั้งค่า broker จริงแล้ว API route ที่ app/api/mqtt/publish/route.ts จะ publish ไปยัง MQTT broker จากฝั่งเซิร์ฟเวอร์

## Suggested Next Extensions
1. เชื่อม persistent database สำหรับทีม อุปกรณ์ และ history
2. เพิ่ม authentication จริงสำหรับ Team ID และ admin roles
3. แยก widget layout เป็น drag and drop dashboard พร้อมการบันทึก layout ต่อทีม
