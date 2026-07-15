Who: สำหรับผู้เข้าร่วมกิจกรรม AIoT, ผู้ดูแลระบบ, และระบบจัดการอุปกรณ์ IoT (Raspberry Pi Pico W) 

What: ระบบแอปพลิเคชัน Dashboard และ Control Center ที่สามารถอ่านค่า Sensor และสั่งการ Actuator ได้ 

Where: ศูนย์กลางข้อมูลและการเชื่อมต่ออยู่ที่ Raspberry Pi 5 ซึ่งทำหน้าที่เป็น MQTT Broker (IP: 172.16.3.205) และรองรับ Edge Station สำหรับ Pico W 

When: ใช้งานแบบ Real-time ระหว่างการจัดกิจกรรม และพร้อมรองรับการขยายระบบในอนาคต 

Why: เพื่อสร้างศูนย์กลางการเรียนรู้และควบคุมระบบ AIoT ที่ยืดหยุ่น รองรับการเพิ่ม Hardware ใหม่ ๆ ได้ทันที 

How: พัฒนาด้วยโครงสร้างแบบ Modular (Frontend/Backend) เชื่อมต่อผ่านโปรโตคอล MQTT และออกแบบระบบให้รองรับการลงทะเบียน Sensor/Actuator ตัวใหม่ได้อย่างอิสระ (Dynamic Configuration)