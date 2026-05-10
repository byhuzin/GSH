# Government Services Hub (GSH) 🇸🇦

[![عربي](https://img.shields.io/badge/اللغة-العربية-107C10?style=for-the-badge)](#النسخة-العربية)
[![English](https://img.shields.io/badge/Language-English-blue?style=for-the-badge)](#english-version)

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Rasa](https://img.shields.io/badge/Rasa-5A17EE?style=for-the-badge&logo=rasa&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## English Version

**Government Services Hub (GSH)** is an intelligent chatbot system designed to unify and simplify access to Saudi government services in a single platform. It enhances user experience and supports the digital transformation goals of **Saudi Vision 2030**.

### 🚀 Overview

This project addresses the challenge of scattered digital services across multiple ministry websites. The system provides a natural language conversational interface that understands user intent and directs them to the correct service instantly, displaying full details (requirements, fees, steps, and direct links).

### ✨ Key Features

- 🧠 **Natural Language Processing (NLP):** Accurately processes user queries in Arabic using the Rasa framework.
- 🗄️ **Unified Database:** Retrieves structured service information seamlessly.
- 📊 **Admin Dashboard:** A control panel to track usage analytics, top requested services, and manage content dynamically.
- 💬 **Interactive UX:** Supports interactive buttons, quick replies, and a fallback mechanism for unknown inputs.

### 🛠 Tech Stack

| Layer | Technology |
|---|---|
| AI & NLP | Rasa Framework (NLU & Dialogue Management) |
| Backend | Python, Flask API |
| Database | SQLite |
| Frontend | HTML5, CSS3, JavaScript |

### 📁 Project Structure

```
GSH/
├── rasa/
│   ├── data/
│   │   ├── nlu.yml
│   │   └── stories.yml
│   ├── domain.yml
│   └── config.yml
├── backend/
│   ├── app.py
│   └── database.db
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── dashboard/
│   └── admin.py
└── README.md
```

### ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/government-services-hub.git
   cd government-services-hub
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the Rasa model**
   ```bash
   cd rasa
   rasa train
   ```

4. **Run the Rasa server**
   ```bash
   rasa run --enable-api --cors "*"
   ```

5. **Run the Flask backend**
   ```bash
   cd backend
   python app.py
   ```

6. **Open the frontend**
   Open `frontend/index.html` in your browser or serve it via a local server.

### 📸 Project Screenshots

> *(Add your screenshots or GIFs here)*

| Chatbot Interface | Admin Dashboard |
|---|---|
| ![Chatbot](screenshots/chatbot.png) | ![Dashboard](screenshots/dashboard.png) |

### 👥 Team Members

Bachelor of Science in Data Science — Graduation Project  
**Saudi Electronic University**

| Name | Role |
|---|---|
| Salman Edrees | Team Member |
| Abdulmalik Alqasim | Team Member |
| Abdulaziz Alreeshi | Team Member |
| Hussain Baroom | Team Member |
| Mohammed Awn | Team Member |
| Rakan Althobaiti | Team Member |

**Supervised by:** Dr. Aymen Belghith

### 📄 License

This project was developed as an academic graduation project at Saudi Electronic University. All rights reserved © 2025.

---

## النسخة العربية

**مركز الخدمات الحكومية (GSH)** هو نظام روبوت محادثة (Chatbot) ذكي يهدف إلى توحيد وتسهيل الوصول إلى الخدمات الحكومية السعودية في منصة واحدة، مما يعزز تجربة المستخدم ويدعم التحول الرقمي ضمن **رؤية المملكة 2030**.

### 🚀 نظرة عامة

يعالج هذا المشروع مشكلة تشتت الخدمات الرقمية عبر مواقع وزارية متعددة. يوفر النظام واجهة محادثة طبيعية تفهم نية المستخدم وتوجهه للخدمة الصحيحة فوراً مع عرض كافة التفاصيل (المتطلبات، الرسوم، الخطوات، والروابط المباشرة).

### ✨ الميزات الرئيسية

- 🧠 **فهم اللغات الطبيعية (NLP):** معالجة استفسارات المستخدمين باللغة العربية بدقة عالية باستخدام إطار عمل Rasa.
- 🗄️ **قاعدة بيانات موحدة:** استرجاع معلومات الخدمات بشكل منظم وسريع.
- 📊 **لوحة تحكم إدارية (Admin Dashboard):** واجهة لمتابعة إحصائيات الاستخدام، الخدمات الأكثر طلباً، وإدارة محتوى الخدمات.
- 💬 **تجربة مستخدم تفاعلية:** دعم الأزرار التفاعلية، الردود السريعة، وآلية التعامل مع المدخلات غير المفهومة (Fallback).

### 🛠 التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| الذكاء الاصطناعي | إطار عمل Rasa لمعالجة اللغات الطبيعية وإدارة الحوار |
| الواجهة الخلفية | لغة Python مع إطار عمل Flask |
| قواعد البيانات | SQLite |
| الواجهة الأمامية | HTML5, CSS3, JavaScript |

### 📁 هيكل المشروع

```
GSH/
├── rasa/
│   ├── data/
│   │   ├── nlu.yml
│   │   └── stories.yml
│   ├── domain.yml
│   └── config.yml
├── backend/
│   ├── app.py
│   └── database.db
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── dashboard/
│   └── admin.py
└── README.md
```

### ⚙️ طريقة التثبيت والتشغيل

1. **استنساخ المستودع**
   ```bash
   git clone https://github.com/your-username/government-services-hub.git
   cd government-services-hub
   ```

2. **تثبيت المتطلبات**
   ```bash
   pip install -r requirements.txt
   ```

3. **تدريب نموذج Rasa**
   ```bash
   cd rasa
   rasa train
   ```

4. **تشغيل خادم Rasa**
   ```bash
   rasa run --enable-api --cors "*"
   ```

5. **تشغيل الواجهة الخلفية Flask**
   ```bash
   cd backend
   python app.py
   ```

6. **فتح الواجهة الأمامية**
   افتح ملف `frontend/index.html` في المتصفح أو قم بتشغيله عبر خادم محلي.

### 📸 لقطات من المشروع

> *(أضف صور المشروع أو فيديو قصير بصيغة GIF هنا)*

| واجهة المحادثة | لوحة التحكم الإدارية |
|---|---|
| ![Chatbot](screenshots/chatbot.png) | ![Dashboard](screenshots/dashboard.png) |

### 👥 فريق العمل

مشروع تخرج لنيل درجة البكالوريوس في علوم البيانات — **الجامعة السعودية الإلكترونية**

| الاسم | الدور |
|---|---|
| سلمان إدريس | عضو الفريق |
| عبدالملك القاسم | عضو الفريق |
| عبدالعزيز الريشي | عضو الفريق |
| حسين باروم | عضو الفريق |
| محمد عون | عضو الفريق |
| راكان الثبيتي | عضو الفريق |

**بإشراف:** د. أيمن بلغيث

### 📄 الترخيص

تم تطوير هذا المشروع كمشروع تخرج أكاديمي في الجامعة السعودية الإلكترونية. جميع الحقوق محفوظة © 2025.
