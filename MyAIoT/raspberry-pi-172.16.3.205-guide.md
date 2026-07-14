# Raspberry Pi 5 Deployment and Data Clone Guide

คู่มือนี้ใช้สำหรับย้ายโปรเจกต์ AIoT Activity Hub ไปยัง Raspberry Pi 5 ที่ IP 172.16.3.205 โดยสมมติว่าเครื่องปลายทางมี MQTT Broker และ MySQL ติดตั้งพร้อมใช้งานอยู่แล้ว

## Scope
- Clone source code ของแอปไปยัง Raspberry Pi
- ย้ายไฟล์ environment และค่าคอนฟิกที่จำเป็น
- ย้ายข้อมูล MySQL จากเครื่องต้นทางไปยัง Raspberry Pi
- ตรวจสอบ MQTT และเชื่อมแอปให้ publish ไปยัง broker บน Raspberry Pi
- รันแอปแบบ production ด้วย PM2

## Assumptions
- Raspberry Pi 5 เข้าถึงได้ผ่าน SSH ที่ 172.16.3.205
- มี user สำหรับ login เช่น `pi` หรือ user อื่นที่มีสิทธิ์ deploy
- มี Node.js และ npm ติดตั้งแล้วบน Raspberry Pi
- MySQL และ MQTT Broker บน Raspberry Pi ทำงานปกติอยู่แล้ว
- โปรเจกต์นี้อยู่ที่โฟลเดอร์ [d:/MyIoT/AIoT/myIoTM3/MyAIoT](d:/MyIoT/AIoT/myIoTM3/MyAIoT)

## 1. ตรวจสอบการเชื่อมต่อ Raspberry Pi

จากเครื่องต้นทาง ให้ทดสอบ SSH ก่อน:

```bash
ssh pi@172.16.3.205
```

ถ้า user ไม่ใช่ `pi` ให้แทนด้วย user จริง เช่น:

```bash
ssh your-user@172.16.3.205
```

เมื่อเข้าเครื่องได้แล้ว ให้เช็ก service หลัก:

```bash
systemctl status mosquitto
systemctl status mysql
node -v
npm -v
```

## 2. เตรียมโฟลเดอร์ปลายทางบน Raspberry Pi

ตัวอย่าง path สำหรับ deploy:

```bash
mkdir -p /home/pi/apps
cd /home/pi/apps
```

## 3. เลือกวิธีย้ายโค้ด

มี 2 วิธีหลัก

### วิธี A: ใช้ Git clone บน Raspberry Pi

เหมาะเมื่อโปรเจกต์อยู่บน Git server อยู่แล้ว

```bash
cd /home/pi/apps
git clone <REPOSITORY_URL> MyAIoT
cd MyAIoT
```

ถ้า repo ถูก clone มาแล้วและต้องการอัปเดต:

```bash
cd /home/pi/apps/MyAIoT
git pull
```

### วิธี B: ใช้ rsync หรือ scp จากเครื่องต้นทาง

เหมาะเมื่อจะย้ายโค้ดจากเครื่อง local โดยตรง

ตัวอย่าง `rsync`:

```bash
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  /d/MyIoT/AIoT/myIoTM3/MyAIoT/ \
  pi@172.16.3.205:/home/pi/apps/MyAIoT/
```

ถ้าใช้ `scp` แบบง่าย:

```bash
scp -r MyAIoT pi@172.16.3.205:/home/pi/apps/
```

หมายเหตุ: ถ้าใช้ Windows PowerShell แล้ว path แบบ `/d/...` ใช้ไม่ได้ ให้รันจาก Git Bash หรือ WSL จะสะดวกกว่า

## 4. ย้ายไฟล์ environment

บน Raspberry Pi:

```bash
cd /home/pi/apps/MyAIoT
cp .env.example .env.local
```

จากนั้นแก้ไฟล์ `.env.local` ให้ชี้ไปที่ service บน Raspberry Pi เอง ตัวอย่างเช่น:

```env
MQTT_BROKER_URL=mqtt://127.0.0.1:1883
MQTT_CLIENT_ID=aiot-activity-hub-pi5
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_DEMO_MODE=false
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=aiot_activity_hub
MYSQL_USER=aiot_user
MYSQL_PASSWORD=change-me
```

หมายเหตุ:
- โปรเจกต์ปัจจุบันใช้ MQTT โดยตรงแล้ว
- ค่ากลุ่ม MySQL ด้านบนเป็นตัวอย่างสำหรับกรณีที่คุณจะต่อฐานข้อมูลจริงในรอบถัดไป

## 5. ติดตั้ง dependencies และ build

บน Raspberry Pi:

```bash
cd /home/pi/apps/MyAIoT
npm install
npm run build
```

ถ้า build ผ่าน แปลว่าโค้ดพร้อมรัน production

## 6. Clone ข้อมูล MySQL จากเครื่องต้นทางไปยัง Raspberry Pi

ถ้าต้องการย้ายฐานข้อมูลจากเครื่องอื่นมายัง Raspberry Pi ให้ทำ 3 ขั้นตอน: dump, copy, restore

### 6.1 Dump ฐานข้อมูลจากเครื่องต้นทาง

บนเครื่องต้นทางที่มีฐานข้อมูลเดิม:

```bash
mysqldump -u root -p --databases aiot_activity_hub > aiot_activity_hub.sql
```

ถ้าต้องการ dump เฉพาะบางตาราง:

```bash
mysqldump -u root -p aiot_activity_hub devices telemetry rules > aiot_partial.sql
```

### 6.2 Copy dump file ไปยัง Raspberry Pi

จากเครื่องต้นทาง:

```bash
scp aiot_activity_hub.sql pi@172.16.3.205:/home/pi/
```

### 6.3 Restore ลง MySQL บน Raspberry Pi

บน Raspberry Pi:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS aiot_activity_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p aiot_activity_hub < /home/pi/aiot_activity_hub.sql
```

### 6.4 ตรวจสอบข้อมูลหลัง restore

```bash
mysql -u root -p
SHOW DATABASES;
USE aiot_activity_hub;
SHOW TABLES;
SELECT COUNT(*) FROM devices;
```

## 7. Backup และย้าย MQTT configuration ถ้าจำเป็น

ถ้า Raspberry Pi มี MQTT อยู่แล้วและใช้ config เดิมได้ คุณอาจไม่ต้องทำขั้นตอนนี้

แต่ถ้าต้องการ clone config จากเครื่องต้นทาง ให้สำรองไฟล์เหล่านี้:

```bash
/etc/mosquitto/mosquitto.conf
/etc/mosquitto/conf.d/
/var/lib/mosquitto/
```

ตัวอย่าง copy config จากเครื่องต้นทางมายัง Raspberry Pi:

```bash
scp /etc/mosquitto/mosquitto.conf pi@172.16.3.205:/home/pi/
scp -r /etc/mosquitto/conf.d pi@172.16.3.205:/home/pi/
```

จากนั้นบน Raspberry Pi:

```bash
sudo cp /home/pi/mosquitto.conf /etc/mosquitto/mosquitto.conf
sudo cp -r /home/pi/conf.d/* /etc/mosquitto/conf.d/
sudo systemctl restart mosquitto
sudo systemctl status mosquitto
```

ถ้า broker มี retained messages หรือ persistence เดิมอยู่แล้ว อย่าทับไฟล์ใน `/var/lib/mosquitto/` โดยไม่ backup ก่อน

## 8. ทดสอบ MQTT บน Raspberry Pi

บน Raspberry Pi ให้ทดสอบ publish และ subscribe ภายในเครื่องก่อน:

เปิด terminal แรก:

```bash
mosquitto_sub -h 127.0.0.1 -t /team-alpha/relay/1 -v
```

เปิด terminal ที่สอง:

```bash
mosquitto_pub -h 127.0.0.1 -t /team-alpha/relay/1 -m '{"command":"ON"}'
```

ถ้า terminal แรกเห็นข้อความ แสดงว่า broker พร้อมใช้งาน

## 9. รันแอปด้วย PM2

ถ้ายังไม่มี PM2:

```bash
sudo npm install -g pm2
```

จากนั้นรันแอป:

```bash
cd /home/pi/apps/MyAIoT
pm2 start npm --name "aiot-activity-hub" -- start -- --hostname 0.0.0.0 --port 3000
pm2 save
pm2 startup
```

ตรวจสอบสถานะ:

```bash
pm2 list
pm2 logs aiot-activity-hub
```

## 10. ตรวจสอบ API publish ของแอป

ทดสอบจาก Raspberry Pi หรือจากเครื่องในวง LAN:

```bash
curl -X POST http://172.16.3.205:3000/api/mqtt/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"/team-alpha/relay/1","payload":"{\"command\":\"ON\"}"}'
```

ถ้าสำเร็จควรได้ JSON ลักษณะนี้:

```json
{
  "ok": true,
  "mode": "broker",
  "topic": "/team-alpha/relay/1"
}
```

## 11. ขั้นตอนอัปเดตครั้งถัดไป

ถ้าใช้ Git:

```bash
cd /home/pi/apps/MyAIoT
git pull
npm install
npm run build
pm2 restart aiot-activity-hub
```

ถ้าใช้ rsync:

```bash
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  /d/MyIoT/AIoT/myIoTM3/MyAIoT/ \
  pi@172.16.3.205:/home/pi/apps/MyAIoT/
```

แล้วบน Raspberry Pi:

```bash
cd /home/pi/apps/MyAIoT
npm install
npm run build
pm2 restart aiot-activity-hub
```

## 12. Rollback และ Backup ที่แนะนำ

ก่อน restore database หรือทับ config จริง ให้สำรองก่อนเสมอ:

```bash
mysqldump -u root -p --databases aiot_activity_hub > backup-before-restore.sql
sudo cp -r /etc/mosquitto /etc/mosquitto.backup.$(date +%F-%H%M)
```

## 13. ปัญหาที่พบบ่อย

### แอปต่อ MQTT ไม่ได้
- ตรวจ `.env.local` ว่า `MQTT_BROKER_URL` ถูกต้อง
- ตรวจ `systemctl status mosquitto`
- ตรวจว่า broker เปิดรับจาก `127.0.0.1` หรือ network interface ที่ต้องใช้

### restore MySQL ไม่ผ่าน
- ตรวจชื่อฐานข้อมูลและสิทธิ์ user
- ถ้า dump มาจาก MySQL คนละเวอร์ชัน ให้เช็ก compatibility ของ collation หรือ SQL mode

### แอปรันได้แต่ API publish error
- ตรวจ log ของ PM2
- ตรวจว่าแอปอ่าน `.env.local` แล้ว
- ทดสอบ `mosquitto_pub` และ `mosquitto_sub` แยกจากตัวแอปก่อน

## 14. ลำดับคำสั่งสั้นแบบพร้อมใช้

```bash
ssh pi@172.16.3.205
mkdir -p /home/pi/apps
cd /home/pi/apps
git clone <REPOSITORY_URL> MyAIoT
cd MyAIoT
cp .env.example .env.local
npm install
npm run build
pm2 start npm --name "aiot-activity-hub" -- start -- --hostname 0.0.0.0 --port 3000
pm2 save
```

ถ้าต้องย้ายฐานข้อมูลเพิ่ม:

```bash
mysqldump -u root -p --databases aiot_activity_hub > aiot_activity_hub.sql
scp aiot_activity_hub.sql pi@172.16.3.205:/home/pi/
ssh pi@172.16.3.205
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS aiot_activity_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p aiot_activity_hub < /home/pi/aiot_activity_hub.sql
```