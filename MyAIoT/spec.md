# Product Specification: AIoT Activity Hub

## 1. Overview
แอปพลิเคชันส่วนกลางสำหรับจัดการกิจกรรม Workshop และ Hackathon ด้าน AIoT โดยเน้นไปที่ Data Visualization ที่สวยงามล้ำสมัย และการควบคุมอุปกรณ์ Hardware แบบเรียลไทม์

## 2. Requirement Analysis (5W1H)
- Who: นักเรียน นักศึกษา นักพัฒนาแบบ Makers และผู้จัดกิจกรรม AIoT
- What: Dashboard สำหรับแสดงข้อมูลเซ็นเซอร์แบบ Real-time, ประมวลผลด้วยโมเดล AI และส่งคำสั่งกลับไปยังอุปกรณ์ปลายทาง
- Where: Web browser ทุกแพลตฟอร์ม พร้อม responsive design สำหรับหน้างานบนมือถือและแท็บเล็ต
- When: ระหว่าง Workshop, Hackathon และการเรียนการสอนในห้องปฏิบัติการ
- Why: ลดภาระการเขียน UI ของผู้เข้าร่วมกิจกรรม เพื่อให้โฟกัสกับตรรกะ AI และ Hardware ได้เต็มที่
- How:
  เชื่อมต่ออุปกรณ์ผ่าน MQTT และ REST API
  มี widget-based dashboard ที่พร้อมต่อยอดสู่ drag and drop
  รองรับ dark mode และ light mode ด้วย visual language แบบ glassmorphism

## 3. Core Features
1. Device Management สำหรับเพิ่ม ลบ และดูสถานะ Online หรือ Offline ของบอร์ด ESP32 และ Raspberry Pi
2. Live Data Dashboard สำหรับกราฟข้อมูลเซ็นเซอร์แบบ Real-time เช่น อุณหภูมิ ความชื้น พลังงาน และผลลัพธ์จาก vision AI
3. AI Trigger Rules สำหรับตั้งเงื่อนไข If-This-Then-That เพื่อสั่งงานผ่าน MQTT หรือ REST

## 4. Design System & Tech Stack
- Frontend: Next.js App Router, React, Tailwind CSS, Framer Motion, Recharts
- Backend and IoT bridge: Next.js Route Handlers, Node.js, MQTT client, REST API
- Theme: Futuristic glassmorphism with deep blue, electric cyan, mint, and magenta accents

## 5. Delivery Goals
- โค้ดต้องเป็น modular และอ่านง่าย
- รองรับการสาธิตได้แม้ไม่มี MQTT broker ผ่าน demo mode
- มีเอกสารการติดตั้ง การใช้งาน และการบำรุงรักษาครบถ้วน# Product Specification: AIoT Activity Hub

## 1. Overview
แอปพลิเคชันส่วนกลางสำหรับจัดการกิจกรรม Workshop และ Hackathon ด้าน AIoT โดยเน้นไปที่ Data Visualization ที่สวยงามล้ำสมัย และการควบคุมอุปกรณ์ Hardware แบบเรียลไทม์

## 2. Requirement Analysis (5W1H)
* **Who (ใครคือผู้ใช้งาน):** นักเรียน นักศึกษา นักพัฒนา (Makers) และผู้จัดกิจกรรม AIoT
* **What (แอปทำอะไรได้บ้าง):** เป็น Dashboard ที่ใช้แสดงผลข้อมูลจากเซ็นเซอร์ (IoT) แบบ Real-time, นำข้อมูลไปประมวลผลด้วยโมเดล AI, และส่งคำสั่งกลับไปควบคุมอุปกรณ์ปลายทาง
* **Where (ใช้งานที่ไหน):** ใช้งานผ่าน Web Browser ได้ทุกแพลตฟอร์ม (Responsive Design) รองรับทั้งบนมือถือและแท็บเล็ตหน้างาน
* **When (ใช้งานเมื่อไหร่):** ระหว่างการจัดเวิร์กชอป, การแข่งขัน Hackathon, หรือการเรียนการสอนในห้องปฏิบัติการ
* **Why (ทำไมถึงต้องมีแอปนี้):** เพื่อลดความซับซ้อนในการเขียนโค้ด UI ของผู้เข้าร่วมกิจกรรม ทำให้พวกเขาสามารถโฟกัสไปที่ตรรกะของ AI และ Hardware ได้เต็มที่ โดยมี UI/UX ระดับโลกคอยซัพพอร์ต
* **How (ทำงานอย่างไร):** - เชื่อมต่ออุปกรณ์ผ่านโปรโตคอล MQTT และ REST API
    - มีระบบ Widget ที่สามารถ Drag & Drop ปรับแต่ง Dashboard ได้เอง
    - รองรับ Dark Mode / Light Mode ที่ออกแบบตามหลัก Glassmorphism

## 3. Core Features
1. **Device Management:** เพิ่ม ลบ และดูสถานะ (Online/Offline) ของบอร์ดทดลอง (ESP32, Raspberry Pi)
2. **Live Data Dashboard:** กราฟแสดงผลข้อมูลเซ็นเซอร์แบบเรียลไทม์ (อุณหภูมิ, ความชื้น, การจดจำใบหน้าจากกล้อง)
3. **AI Trigger Rules:** ตั้งค่าเงื่อนไขแบบ If-This-Then-That (เช่น หาก AI ตรวจพบคนในภาพ ให้ส่งสัญญาณ MQTT ไปเปิดไฟ)

## 4. Design System & Tech Stack
* **Frontend:** React.js (Next.js), TailwindCSS, Framer Motion (สำหรับ Animation)
* **Backend/IoT:** Node.js, MQTT Broker (Mosquitto), WebSocket
* **Theme:** ฟิวเจอริสติก (Futuristic), เน้นสีโทนเข้ม (Deep Blue/Purple) ตัดกับสีนีออน (Cyan/Magenta) เพื่อเน้นข้อมูลสำคัญ