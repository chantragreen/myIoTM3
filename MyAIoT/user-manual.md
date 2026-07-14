# AIoT Activity Hub User Manual

## Introduction
คู่มือนี้สำหรับผู้เข้าร่วมกิจกรรมที่ใช้งานระบบ AIoT Activity Hub เพื่อเชื่อมต่ออุปกรณ์ ดูข้อมูลแบบ Real-time และสร้างกฎ Automation ระหว่างกิจกรรม

## 1. Login
1. เปิด URL ของระบบที่ผู้จัดกิจกรรมกำหนด
2. กรอก Team ID และรหัสผ่านที่ได้รับจากผู้จัด
3. เมื่อเข้าสู่หน้า Dashboard แล้ว ให้ตรวจสอบสถานะทีมและอุปกรณ์ในส่วน Overview

## 2. Device Setup
1. ไปที่ส่วน Devices
2. กรอกชื่ออุปกรณ์ ประเภท MAC Address และตำแหน่งติดตั้ง
3. ระบบจะสร้าง topic namespace สำหรับอุปกรณ์ที่เพิ่มใหม่
4. ตรวจสอบสถานะ online หรือ warning จาก device card

## 3. Data Visualization
1. เปิดส่วน Dashboard เพื่อดูกราฟ Temperature, Humidity, Power และ Occupancy
2. ใช้ search ในส่วน Devices เพื่อหา board ที่ต้องการผูกกับ widget
3. ติดตาม Vision events เพื่อใช้ประกอบการตั้งค่า AI triggers

## 4. AI Trigger Rules
1. เปิดส่วน Automation
2. ระบุชื่อกฎ เงื่อนไข Action และ target topic
3. บันทึกเป็น draft จากนั้นนำกฎไปต่อยอดเชื่อมกับ backend จริงในรอบ production

## 5. MQTT Command Console
1. ไปที่ส่วน Command bus
2. ใส่ topic ที่ต้องการ publish และ payload ในรูปแบบข้อความหรือ JSON
3. กด Publish command เพื่อลองส่งคำสั่ง
4. หากยังไม่ได้ตั้งค่า broker ระบบจะทำงานใน demo mode เพื่อการสาธิต