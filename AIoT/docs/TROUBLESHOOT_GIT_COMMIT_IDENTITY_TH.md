# คู่มือแก้ปัญหา Commit ไม่ได้ เพราะยังไม่ตั้งค่า Git Identity

ปัญหาที่พบบ่อยใน VS Code:
- Make sure you configure your "user.name" and "user.email" in git.

ปัญหานี้เกิดจาก Git ยังไม่ทราบว่าใครเป็นผู้สร้าง commit บนเครื่องปัจจุบัน

## อาการ

- กด Commit แล้วขึ้นแจ้งเตือนเรื่อง user.name และ user.email
- ใน terminal สั่ง commit แล้วเจอข้อความ Author identity unknown

## วิธีแก้ (แนะนำ)

ตั้งค่าแบบ Global เพื่อใช้ได้ทั้งเครื่อง:

```bash
git config --global user.name "chantragreen"
git config --global user.email "chantra.green@gmail.com"
```

## วิธีแก้แบบเฉพาะโปรเจกต์ (Local)

ใช้เมื่ออยากให้ repo นี้มีข้อมูลผู้ commit ต่างจาก repo อื่น:

```bash
cd /home/pi/DEV/Training/myIoTM3
git config user.name "chantragreen"
git config user.email "chantra.green@gmail.com"
```

## วิธีตรวจสอบว่าตั้งค่าสำเร็จหรือยัง

ตรวจค่า Global:

```bash
git config --global --get user.name
git config --global --get user.email
```

ตรวจค่าที่ repo ปัจจุบันใช้งานจริง:

```bash
cd /home/pi/DEV/Training/myIoTM3
git config --get user.name
git config --get user.email
```

## ทดสอบว่า Commit ได้แล้ว

```bash
cd /home/pi/DEV/Training/myIoTM3
git status
git commit -m "test commit"
```

หากไม่มี error เรื่อง identity แปลว่าแก้สำเร็จ

## ปัญหาที่อาจเจอหลังตั้งค่า

1. ตั้งค่าแล้วแต่ยัง commit ไม่ได้
- ปิดแล้วเปิด VS Code ใหม่หนึ่งรอบ
- ตรวจว่า terminal อยู่ใน repo ที่ถูกต้อง

2. มีหลาย account และ commit ผิดตัวตน
- ใช้ Local config ต่อ repo แทน Global
- ตรวจด้วยคำสั่ง git config --get user.name และ git config --get user.email ทุกครั้งก่อน commit สำคัญ

3. ต้องการเปลี่ยนค่าใหม่

```bash
git config --global user.name "ชื่อใหม่"
git config --global user.email "อีเมลใหม่"
```

## คำแนะนำสำหรับทีม

- กำหนดมาตรฐานชื่อและอีเมลก่อนเริ่มงาน
- ให้สมาชิกตั้งค่า Git identity ตั้งแต่วันแรก
- ใส่คู่มือนี้ไว้ในเอกสาร onboarding ของทีม
