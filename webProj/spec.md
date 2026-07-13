# Project Specification: Thailand-Japan Game Programming Hackathon 2026

## 1. 5W1H Analysis
* **Who (ใคร):** * Target Audience: นักเรียนคือผู้เข้าร่วมการแข่งขัน/ครู ในฐานะที่ปรึกษา สายโปรแกรมมิ่งและการพัฒนาเกม จากประเทศไทยและประเทศญี่ปุ่น
    * Stakeholders: ผู้จัดงาน (Organizers), กรรมการ (Judges), ผู้สนับสนุน (Sponsors)
* **What (อะไร):** เว็บไซต์แพลตฟอร์มสำหรับโปรโมทงานและระบบลงทะเบียนการแข่งขัน Hackathon แบบครบวงจร
* **Where (ที่ไหน):** * รอบคัดเลือก (Stage 1): ประเทศไทย (Hybrid: Online & On-site)
    * รอบชิงชนะเลิศ (Stage 2): แข่งขันระหว่างประเทศ (Virtual / On-site ณ สถานที่จัดงานหลัก)
* **When (เมื่อไหร่):** ตลอดปี 2026 (แบ่งตาม Timeline การรับสมัครและการแข่งขัน)
* **Why (ทำไม):** เพื่อสร้างเครือข่ายนักพัฒนาเกมรุ่นใหม่ แลกเปลี่ยนวัฒนธรรม และยกระดับทักษะการเขียนโปรแกรมของเยาวชนทั้งสองชาติ
* **How (อย่างไร):** พัฒนาเป็น Web Application ที่รองรับ 3 ภาษา (ไทย, อังกฤษ, ญี่ปุ่น) รองรับผู้ใช้งานจำนวนมากในช่วงรับสมัคร และมีระบบหลังบ้านสำหรับจัดการทีม

## 2. Technical Requirements
* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion
* **Backend/Database:** MySQL  8.0.42-0ubuntu0.20.04.1(สำหรับการสมัครสมาชิกและเก็บข้อมูลทีม)
* **Hosting:** No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 20.04.6 LTS
Release:        20.04
Codename:       focal

* **i18n:** `next-intl` หรือ `react-i18next` สำหรับจัดการภาษา (TH, EN, JP)

## 3. Core Features
1.  **Landing Page:** ข้อมูลงาน, Timeline, กติกา (Rules & Regulations), รางวัล
2.  **Authentication:** ระบบ Login/Register ด้วย Email หรือ OAuth (Google/GitHub)
3.  **Team Dashboard:** * ผู้สมัครสามารถสร้าง/เข้าร่วมทีม (ทีมละ 2-4 คน)
    * อัปโหลดเอกสารยืนยันตัวตน หรือ Pitch Deck / Source Code
4.  **Admin Panel:** สำหรับผู้จัดงานเพื่อดูรายชื่อทีม, ตรวจสอบเอกสาร, และอัปเดตสถานะการผ่านเข้ารอบ (Stage 1 -> Stage 2)