# Checklist: อัปโหลดไฟล์ลง Pico W ด้วย Thonny (ทีละคลิก)

ใช้คู่มือนี้ก่อนรัน `main.py` ครั้งแรกบนบอร์ด Pico W

## A) เตรียมเครื่อง

1. เสียบ Pico W ผ่าน USB
2. เปิด Thonny
3. ไปที่เมนู `Run > Select interpreter...`
4. เลือก `MicroPython (Raspberry Pi Pico)`
5. ช่อง Port เลือกพอร์ตของ Pico W แล้วกด `OK`

## B) อัปโหลดไฟล์โปรเจกต์ลง Pico W

1. ใน Thonny ให้เปิดโฟลเดอร์ฝั่งคอมพิวเตอร์ที่:
   - `/home/pi/DEV/Training/myIoTM3/AIoT/code/pico_w_edge_station`
2. ที่แถบไฟล์ ให้ดู 2 ฝั่ง:
   - ฝั่งซ้าย: `This computer`
   - ฝั่งขวา: `Raspberry Pi Pico`
3. ลบไฟล์เก่าบน Pico W (ถ้ามีไฟล์ชื่อซ้ำจากรอบก่อน)
4. ลากไฟล์ต่อไปนี้จากฝั่งคอมพิวเตอร์ไปฝั่ง Pico W:
   - `main.py`
   - `config.py`
   - `install_deps.py`
   - `preflight_check.py`
   - `mqtt_service.py`
   - `wifi_manager.py`
   - `topic_builder.py`
   - `actuator.py`
   - `edge_sensors.py`
   - `button_input.py`
   - `offline_queue.py`
   - `boot.py`
5. ยืนยันว่าทุกไฟล์เห็นอยู่ฝั่ง `Raspberry Pi Pico`

## C) ติดตั้ง dependency บน Pico W

1. ดับเบิลคลิกเปิดไฟล์ `install_deps.py` (ฝั่ง Pico W)
2. กดปุ่ม Run (สามเหลี่ยมสีเขียว)
3. รอข้อความ:
   - `Dependency installation completed.`
4. ถ้าขึ้นว่า `no module named mip`:
   - อัปเดตเฟิร์มแวร์ MicroPython ของ Pico W แล้วลองใหม่
5. ตรวจยืนยันใน Shell ของ Thonny:

```python
import umqtt.simple
print("umqtt ok")
```

ถ้ายัง import ไม่ได้ ให้ลองติดตั้งใน Shell โดยตรง:

```python
import mip
mip.install("umqtt.simple")
```

หรือ:

```python
import mip
mip.install("micropython-umqtt.simple")
```

## D) ทดสอบความพร้อมก่อนรันจริง

1. เปิด `preflight_check.py` (ฝั่ง Pico W)
2. กด Run
3. คาดหวังผลลัพธ์:
   - `PASS: import umqtt.simple`
   - `PASS: Wi-Fi connected`
   - `PASS: MQTT connected`
   - `PASS: MQTT publish test message`
   - `RESULT: ALL CHECKS PASSED`

## E) รันระบบจริง

1. เปิด `main.py`
2. กด Run
3. ดู console ต้องเห็น:
   - `Starting Pico W Edge Station`
   - `Wi-Fi connected. IP: ...`

## F) ถ้าเจอปัญหา

1. `ImportError: no module named 'umqtt'`
   - รัน `install_deps.py` ซ้ำอีกครั้ง
   - ทดสอบ `import umqtt.simple` ใน Shell ก่อนรัน `preflight_check.py`
2. Wi-Fi ไม่เชื่อมต่อ
   - ตรวจ `WIFI_SSID` และ `WIFI_PASSWORD` ใน `config.py`
3. MQTT ต่อไม่ได้
   - ตรวจ `MQTT_BROKER` เป็น `172.16.3.205`
   - ทดสอบว่า broker เปิดพอร์ต `1883`
