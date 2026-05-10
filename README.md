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

**Government Services Hub (GSH)** is an intelligent Arabic chatbot system that unifies access to Saudi government services in a single platform. The system understands user intent using NLP and instantly returns full service details — required documents, fees, steps, and direct links — supporting Saudi Vision 2030's digital transformation goals.

### 🚀 Overview

The system addresses the challenge of scattered digital services across multiple ministry websites. A user simply types a request in natural Arabic (e.g. *"أبغى أجدد الهوية الوطنية"*), and the bot identifies the correct service, pulls its full details from the database, and returns a formatted response with all needed information.

### ✨ Key Features

- 🧠 **Arabic NLP:** Powered by Rasa with a DIETClassifier pipeline tuned for Arabic, with a 0.60 confidence threshold for intent detection and a FallbackClassifier at 0.70.
- 🔄 **Live Rasa Sync:** Adding, editing, or deleting a service from the admin panel automatically updates the Rasa NLU data (`nlu.yml`, `domain.yml`) and retrains the model in the background via `rasa_sync.py`.
- 🗄️ **SQLite Database:** Four tables — `services`, `admins`, `messages`, `feedback` — tracking every interaction and rating.
- 📊 **Admin Dashboard:** Real-time stats: total messages, active services, positive/negative feedback count, satisfaction rate, and top-5 most-requested services.
- 🔍 **Smart Search:** Full-text search across service name, description, and keywords.
- 📱 **Mobile App Links:** Each service card can include direct links for the web portal, iOS app, Android app, and a tutorial video.
- ⭐ **User Feedback:** Per-message thumbs up/down rating with optional comment, stored per session.
- 🔐 **Admin Authentication:** Password-hashed admin login with session-based access control.

### 🛠 Tech Stack

| Layer | Technology |
|---|---|
| AI & NLP | Rasa 3.x — WhitespaceTokenizer, CountVectorsFeaturizer (word + char_wb n-grams), DIETClassifier (100 epochs), FallbackClassifier |
| Backend | Python, Flask |
| Database | SQLite (`government_services.db`) via `sqlite3` + `werkzeug` for password hashing |
| Frontend | HTML5, CSS3, JavaScript (`chat.js`, `service_validation.js`) |
| Rasa Sync | `rasa_sync.py` — auto-updates NLU + domain files and retrains model on service changes |

### 🗂 Supported Services (52 intents)

The bot covers over 50 government services across multiple categories:

| Category | Services |
|---|---|
| Civil Affairs (الأحوال المدنية) | Renew national ID, register newborn, issue death certificate, issue/renew family register, document divorce, document will, attest marriage contract |
| Passports (الجوازات) | Issue & renew Saudi passport, issue & renew residency permit |
| Traffic (المرور) | Renew driving license, pay violations, object traffic violations, authorize/drop/transfer vehicle, issue car shade permit |
| Business (الأعمال) | Register VAT, cancel/update/annually confirm sole proprietorship CR |
| Labor (العمل) | Apply for jobs (Jadarat), Tamheer program, report labor violations, report work injury, terminate employment contract |
| Legal (القانونية) | Issue/revoke power of attorney, issue criminal record certificate, inventory estate, request family consultation |
| Health (الصحة) | Instant medical consultation, premarital medical exam, issue/renew health certificate, report cybercrime |
| Finance (المالية) | Request retirement pension, register citizen account, report financial/admin corruption, report VAT violations |
| Utilities & Other | View/pay electricity bills, buy Zamzam, issue Rawdah permit, quick donation, report nuisance, contribute Farajat |

### 📁 Project Structure

```
GSH-main/
├── DATABASE/
│   └── government_services.db        # SQLite database (services, admins, messages, feedback)
├── SOURCE/
│   ├── app.py                        # Flask app — routes, intent detection, response formatting
│   ├── db.py                         # All database operations (CRUD + stats + search)
│   ├── rasa_sync.py                  # Auto-sync NLU/domain files & background model retraining
│   ├── rasa_bot/
│   │   ├── config.yml                # Rasa pipeline config (Arabic, DIETClassifier, 100 epochs)
│   │   ├── domain.yml                # Intents + response templates (52 intents)
│   │   └── data/
│   │       ├── nlu.yml               # Training examples for all intents (Arabic)
│   │       ├── stories.yml           # Conversation flows
│   │       └── rules.yml             # Fallback rules
│   ├── static/
│   │   ├── css/style.css
│   │   └── js/
│   │       ├── chat.js               # Chat UI logic (messages, feedback, quick replies)
│   │       └── service_validation.js # Admin form validation
│   └── templates/
│       ├── chat.html                 # Main chatbot interface
│       ├── admin_login.html          # Admin login page
│       ├── admin_dashboard.html      # Stats dashboard
│       ├── manage_services.html      # List & delete services
│       ├── add_service.html          # Add new service form
│       └── edit_service.html         # Edit existing service form
└── README.md
```

### ⚙️ Installation & Setup

#### Prerequisites
- Python 3.8+
- A separate virtual environment for Rasa (recommended: `rasa_env/`)

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/GSH.git
cd GSH
```

#### 2. Set up Rasa environment
```bash
python -m venv rasa_env
rasa_env\Scripts\activate       # Windows
# source rasa_env/bin/activate  # macOS/Linux
pip install rasa
```

#### 3. Install Flask dependencies
```bash
pip install flask requests werkzeug
```

#### 4. Train the Rasa model
```bash
cd SOURCE/rasa_bot
rasa train
```

#### 5. Start the Rasa server
```bash
rasa run --enable-api --cors "*"
# Rasa will listen on http://localhost:5005
```

#### 6. Start the Flask app
```bash
cd SOURCE
python app.py
# App opens automatically at http://127.0.0.1:5000
```

> **Note:** The app calls `init_db()` on startup to create all tables automatically if they don't exist, and opens the browser automatically via `webbrowser`.

#### 7. Create an admin account
Run this once in a Python shell to create your first admin:
```python
from SOURCE.db import create_admin
create_admin("admin", "your_password")
```
Then log in at `http://127.0.0.1:5000/admin/login`.

### 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Main chat interface with quick-access service buttons |
| `POST` | `/chat` | Send a message, receive formatted service response |
| `POST` | `/feedback` | Submit thumbs up/down rating for a message |
| `GET` | `/search?q=...` | Search services by name, description, or keywords |
| `GET` | `/services/list` | JSON list of all active services |
| `GET/POST` | `/admin/login` | Admin login |
| `GET` | `/admin/dashboard` | Stats dashboard |
| `GET` | `/admin/services` | Manage services list |
| `GET/POST` | `/admin/services/add` | Add a new service |
| `GET/POST` | `/admin/services/edit/<id>` | Edit an existing service |
| `GET` | `/admin/services/delete/<id>` | Soft-delete a service |
| `GET` | `/admin/logout` | Logout |

### 📸 Project Screenshots

**Chatbot Interface**

| Home Page | Conversation | Feedback |
|---|---|---|
| ![Chat Home](screenshots/chat_home.png) | ![Chat Conversation](screenshots/chat_conversation.png) | ![Chat Feedback](screenshots/chat_feedback.png) |

**Admin Panel**

| Login | Dashboard | Manage Services |
|---|---|---|
| ![Admin Login](screenshots/admin_login.png) | ![Admin Dashboard](screenshots/admin_dashboard.png) | ![Admin Services](screenshots/admin_services.png) |

| Add Service | Edit Service |
|---|---|
| ![Add Service](screenshots/admin_add_service.png) | ![Edit Service](screenshots/admin_edit_service.png) |

### 👥 Team Members

Bachelor of Science in Data Science — Graduation Project
**Saudi Electronic University**

| Name | |
|---|---|
| Salman Edrees | سلمان إدريس |
| Abdulmalik Alqasim | عبدالملك القاسم |
| Abdulaziz Alreeshi | عبدالعزيز الريشي |
| Hussain Baroom | حسين باروم |
| Mohammed Awn | محمد عون |
| Rakan Althobaiti | راكان الثبيتي |

**Supervised by:** Dr. Aymen Belghith

### 📄 License

Developed as an academic graduation project at Saudi Electronic University. All rights reserved © 2025.

---

## النسخة العربية

**مركز الخدمات الحكومية (GSH)** نظام روبوت محادثة ذكي باللغة العربية، يوحّد الوصول إلى الخدمات الحكومية السعودية في منصة واحدة. يفهم النظام نية المستخدم ويعيد له تفاصيل الخدمة كاملةً — المستندات المطلوبة، الرسوم، الخطوات، والروابط المباشرة — دعماً لأهداف التحول الرقمي في رؤية 2030.

### 🚀 نظرة عامة

يعالج المشروع مشكلة تشتت الخدمات الرقمية عبر مواقع وزارية متعددة. يكتب المستخدم طلبه بالعربية العامية (مثل: *"أبغى أجدد الهوية الوطنية"*)، فيحدد البوت الخدمة المناسبة ويعرض تفاصيلها كاملةً.

### ✨ الميزات الرئيسية

- 🧠 **معالجة اللغة العربية:** مدعوم بـ Rasa مع نموذج DIETClassifier مضبوط للغة العربية، بحد أدنى للثقة 0.60 للتعرف على النية، و FallbackClassifier عند 0.70.
- 🔄 **مزامنة Rasa تلقائية:** إضافة أو تعديل أو حذف خدمة من لوحة الإدارة يُحدّث ملفات `nlu.yml` و`domain.yml` تلقائياً ويعيد تدريب النموذج في الخلفية عبر `rasa_sync.py`.
- 🗄️ **قاعدة بيانات SQLite:** أربعة جداول — `services`، `admins`، `messages`، `feedback` — تتتبع كل تفاعل وتقييم.
- 📊 **لوحة تحكم إدارية:** إحصائيات فورية: إجمالي الرسائل، الخدمات النشطة، التقييمات الإيجابية والسلبية، معدل الرضا، وأكثر 5 خدمات مطلوبة.
- 🔍 **بحث ذكي:** بحث نصي شامل في اسم الخدمة والوصف والكلمات المفتاحية.
- 📱 **روابط التطبيقات:** كل خدمة تدعم روابط مباشرة للموقع وتطبيق iOS وتطبيق Android وفيديو شرح.
- ⭐ **تقييم المستخدم:** تقييم إيجابي/سلبي لكل رد مع تعليق اختياري، محفوظ لكل جلسة.
- 🔐 **نظام صلاحيات:** تسجيل دخول آمن للمسؤول بكلمة مرور مشفرة وجلسات محمية.

### 🛠 التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| الذكاء الاصطناعي | Rasa 3.x — WhitespaceTokenizer، CountVectorsFeaturizer (كلمات + n-grams حرفية)، DIETClassifier (100 epoch)، FallbackClassifier |
| الواجهة الخلفية | Python، Flask |
| قاعدة البيانات | SQLite (`government_services.db`) عبر `sqlite3` + `werkzeug` لتشفير كلمات المرور |
| الواجهة الأمامية | HTML5، CSS3، JavaScript (`chat.js`، `service_validation.js`) |
| مزامنة Rasa | `rasa_sync.py` — يحدّث ملفات NLU والـ domain ويعيد التدريب عند أي تغيير في الخدمات |

### 🗂 الخدمات المدعومة (52 نية)

يغطي البوت أكثر من 50 خدمة حكومية موزعة على عدة قطاعات:

| القطاع | الخدمات |
|---|---|
| الأحوال المدنية | تجديد الهوية الوطنية، تسجيل المواليد، إصدار وثيقة الوفاة، إصدار/تجديد سجل الأسرة، توثيق الطلاق، توثيق الوصية، توثيق عقد الزواج |
| الجوازات | إصدار/تجديد جواز السفر السعودي، إصدار/تجديد الإقامة |
| المرور | تجديد رخصة القيادة، سداد المخالفات، الاعتراض على المخالفات، تفويض/إسقاط/نقل ملكية مركبة، تصريح مظلة السيارة |
| الأعمال | تسجيل ضريبة القيمة المضافة، إلغاء/تعديل/التحقق السنوي للسجل التجاري |
| العمل | التقديم عبر منصة جدارات، برنامج تمهير، الإبلاغ عن مخالفات عمالية، الإبلاغ عن إصابة عمل، إنهاء عقد العمل |
| القانونية | إصدار/إلغاء توكيل رسمي، استخراج صحيفة الحالة الجنائية، حصر الإرث، طلب استشارة أسرية |
| الصحة | استشارة طبية فورية، الفحص قبل الزواج، إصدار/تجديد الشهادة الصحية، الإبلاغ عن جرائم إلكترونية |
| المالية | طلب معاش التقاعد، تسجيل حساب المواطن، الإبلاغ عن فساد مالي/إداري، الإبلاغ عن مخالفات ضريبة القيمة المضافة |
| خدمات أخرى | عرض/دفع فواتير الكهرباء، شراء ماء زمزم، تصريح الروضة، تبرع سريع، الإبلاغ عن إزعاج، المساهمة في فرجات |

### 📁 هيكل المشروع

```
GSH-main/
├── DATABASE/
│   └── government_services.db        # قاعدة البيانات (services, admins, messages, feedback)
├── SOURCE/
│   ├── app.py                        # تطبيق Flask — المسارات، كشف النوايا، تنسيق الردود
│   ├── db.py                         # جميع عمليات قاعدة البيانات (CRUD + إحصائيات + بحث)
│   ├── rasa_sync.py                  # مزامنة ملفات NLU/domain وإعادة التدريب تلقائياً
│   ├── rasa_bot/
│   │   ├── config.yml                # إعدادات pipeline (عربي، DIETClassifier، 100 epochs)
│   │   ├── domain.yml                # النوايا وقوالب الردود (52 نية)
│   │   └── data/
│   │       ├── nlu.yml               # أمثلة التدريب لجميع النوايا بالعربية
│   │       ├── stories.yml           # مسارات المحادثة
│   │       └── rules.yml             # قواعد الـ Fallback
│   ├── static/
│   │   ├── css/style.css
│   │   └── js/
│   │       ├── chat.js               # منطق واجهة المحادثة (رسائل، تقييم، ردود سريعة)
│   │       └── service_validation.js # التحقق من صحة نماذج الإدارة
│   └── templates/
│       ├── chat.html                 # واجهة الشات الرئيسية
│       ├── admin_login.html          # صفحة تسجيل دخول المسؤول
│       ├── admin_dashboard.html      # لوحة الإحصائيات
│       ├── manage_services.html      # إدارة قائمة الخدمات
│       ├── add_service.html          # إضافة خدمة جديدة
│       └── edit_service.html         # تعديل خدمة موجودة
└── README.md
```

### ⚙️ طريقة التثبيت والتشغيل

#### المتطلبات الأساسية
- Python 3.8 أو أحدث
- بيئة افتراضية منفصلة لـ Rasa (يُنصح بـ `rasa_env/`)

#### 1. استنساخ المستودع
```bash
git clone https://github.com/your-username/GSH.git
cd GSH
```

#### 2. إعداد بيئة Rasa
```bash
python -m venv rasa_env
rasa_env\Scripts\activate        # Windows
# source rasa_env/bin/activate   # macOS/Linux
pip install rasa
```

#### 3. تثبيت متطلبات Flask
```bash
pip install flask requests werkzeug
```

#### 4. تدريب نموذج Rasa
```bash
cd SOURCE/rasa_bot
rasa train
```

#### 5. تشغيل خادم Rasa
```bash
rasa run --enable-api --cors "*"
# يعمل على http://localhost:5005
```

#### 6. تشغيل تطبيق Flask
```bash
cd SOURCE
python app.py
# يفتح المتصفح تلقائياً على http://127.0.0.1:5000
```

> **ملاحظة:** التطبيق يستدعي `init_db()` عند الإطلاق لإنشاء الجداول تلقائياً إذا لم تكن موجودة، ويفتح المتصفح تلقائياً.

#### 7. إنشاء حساب المسؤول
نفّذ هذا مرةً واحدة في Python shell لإنشاء أول حساب إداري:
```python
from SOURCE.db import create_admin
create_admin("admin", "your_password")
```
ثم سجّل الدخول من: `http://127.0.0.1:5000/admin/login`

### 🔌 نقاط الـ API

| الطريقة | المسار | الوصف |
|---|---|---|
| `GET` | `/` | واجهة الشات مع أزرار الخدمات السريعة |
| `POST` | `/chat` | إرسال رسالة واستقبال رد منسّق |
| `POST` | `/feedback` | إرسال تقييم إيجابي/سلبي لرسالة معينة |
| `GET` | `/search?q=...` | البحث في الخدمات |
| `GET` | `/services/list` | قائمة JSON بجميع الخدمات النشطة |
| `GET/POST` | `/admin/login` | تسجيل دخول المسؤول |
| `GET` | `/admin/dashboard` | لوحة الإحصائيات |
| `GET` | `/admin/services` | إدارة الخدمات |
| `GET/POST` | `/admin/services/add` | إضافة خدمة جديدة |
| `GET/POST` | `/admin/services/edit/<id>` | تعديل خدمة موجودة |
| `GET` | `/admin/services/delete/<id>` | حذف ناعم للخدمة |
| `GET` | `/admin/logout` | تسجيل الخروج |

### 📸 لقطات من المشروع

**واجهة المحادثة**

| الصفحة الرئيسية | محادثة كاملة | نموذج التقييم |
|---|---|---|
| ![Chat Home](screenshots/chat_home.png) | ![Chat Conversation](screenshots/chat_conversation.png) | ![Chat Feedback](screenshots/chat_feedback.png) |

**لوحة الإدارة**

| تسجيل الدخول | الإحصائيات | إدارة الخدمات |
|---|---|---|
| ![Admin Login](screenshots/admin_login.png) | ![Admin Dashboard](screenshots/admin_dashboard.png) | ![Admin Services](screenshots/admin_services.png) |

| إضافة خدمة | تعديل خدمة |
|---|---|
| ![Add Service](screenshots/admin_add_service.png) | ![Edit Service](screenshots/admin_edit_service.png) |

### 👥 فريق العمل

مشروع تخرج لنيل درجة البكالوريوس في علوم البيانات — **الجامعة السعودية الإلكترونية**

| الاسم | |
|---|---|
| سلمان إدريس | Salman Edrees |
| عبدالملك القاسم | Abdulmalik Alqasim |
| عبدالعزيز الريشي | Abdulaziz Alreeshi |
| حسين باروم | Hussain Baroom |
| محمد عون | Mohammed Awn |
| راكان الثبيتي | Rakan Althobaiti |

**بإشراف:** د. أيمن بلغيث

### 📄 الترخيص

تم تطوير هذا المشروع كمشروع تخرج أكاديمي في الجامعة السعودية الإلكترونية. جميع الحقوق محفوظة © 2025.
