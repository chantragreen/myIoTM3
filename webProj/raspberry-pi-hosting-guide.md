# Raspberry Pi 5 Hosting Guide

คู่มือการDeployเว็บ Next.js ของโปรเจกต์ Thailand-Japan Game Programming Hackathon 2026 ขึ้นบน Raspberry Pi 5

## ภาพรวม

เว็บนี้เป็น Next.js แอปพลิเคชัน ดังนั้นเมื่อย้ายไป host บน Raspberry Pi 5 ควรใช้วิธีต่อไปนี้:
- ติดตั้ง Node.js
- Build โปรเจกต์สำหรับ Production
- รันด้วย PM2 หรือ systemd
- ใช้ Nginx เป็น Reverse Proxy
- เปิด HTTPS ถ้ามี Domain

---

## 1. อัปเดตระบบ Raspberry Pi

รันคำสั่งต่อไปนี้บน Raspberry Pi:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 2. ติดตั้ง Node.js

แนะนำให้ใช้ Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 3. ติดตั้งเครื่องมือที่จำเป็น

```bash
sudo apt install -y nginx git curl
sudo npm install -g pm2
```

---

## 4. นำโค้ดขึ้น Raspberry Pi

```bash
cd /home/pi
git clone <REPOSITORY_URL> webProj
cd webProj
npm install
```

ถ้าโค้ดอยู่ในเครื่อง local ให้ใช้ SCP หรือ Git clone จาก GitHub/GitLab แทน

---

## 5. สร้าง Environment File

```bash
cp .env.example .env.local
```

แล้วแก้ไขค่าใน `.env.local` ตามความจำเป็น เช่น API URL, secret key ฯลฯ

---

## 6. Build โปรเจกต์

```bash
npm run build
```

หาก Build สำเร็จ แสดงว่าเว็บพร้อมสำหรับ Production แล้ว

---

## 7. รันเว็บด้วย PM2

```bash
pm2 start npm --name "hackathon-web" -- start -- --hostname 0.0.0.0 --port 3000
pm2 save
pm2 startup
```

ตรวจสถานะ:

```bash
pm2 list
pm2 logs hackathon-web
```

> ไม่ควรใช้ `npm run dev` สำหรับ Production เพราะจะทำงานในโหมดพัฒนาและไม่เหมาะกับการให้คนเข้าถึงจริง

---

## 8. ตั้งค่า Nginx Reverse Proxy

สร้างไฟล์คอนฟิกสำหรับเว็บ:

```bash
sudo nano /etc/nginx/sites-available/hackathon
```

ใส่เนื้อหาต่อไปนี้:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

เปิดใช้งานคอนฟิก:

```bash
sudo ln -s /etc/nginx/sites-available/hackathon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. เปิด Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 10. ตั้งค่า HTTPS (แนะนำ)

ถ้ามี Domain สามารถใช้ Certbot เพื่อเปิด HTTPS ได้:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 11. ทดสอบเว็บ

เปิดเบราว์เซอร์แล้วเข้า:

```text
http://<IP-ADDRESS-OF-PI>
```

หรือถ้ามี Domain:

```text
https://your-domain.com
```

---

## 12. ปัญหาที่มักเจอ

### ปัญหาที่ 1: `npm run start` ล้มเหลว

ตรวจดูว่า build สำเร็จหรือยัง:

```bash
npm run build
```

### ปัญหาที่ 2: Nginx ไม่ให้เข้าถึง

ตรวจ log:

```bash
sudo journalctl -u nginx
sudo nginx -t
```

### ปัญหาที่ 3: PM2 ไม่รัน

```bash
pm2 restart hackathon-web
pm2 logs hackathon-web
```

---

## 13. คำแนะนำเพิ่มเติม

- ถ้าต้องการให้เว็บทำงานต่อเนื่องหลัง reboot ควรใช้ PM2 + startup
- ถ้าต้องการย้ายไปใช้ Docker ก็สามารถทำต่อได้ในขั้นตอนถัดไป
- สำหรับ Production ควรใช้ HTTPS และ Domain ที่ถูกต้อง

---

## สรุปคำสั่งหลัก

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git curl
sudo npm install -g pm2
cd /home/pi/webProj
npm install
npm run build
pm2 start npm --name "hackathon-web" -- start -- --hostname 0.0.0.0 --port 3000
pm2 save
pm2 startup
```

ถ้าต้องการ ผมสามารถช่วยต่อให้คุณสร้างไฟล์ Nginx config และ PM2 config ให้พร้อมใช้งานเลยครับ
