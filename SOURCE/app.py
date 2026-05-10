from functools import wraps
from flask import Flask, request, session, redirect, url_for, render_template, jsonify
import uuid
import requests
import webbrowser as wb

from db import (
    init_db,
    get_all_services,
    get_service_by_intent,
    save_message,
    verify_admin,
    get_dashboard_stats,
    add_service,
    get_service_by_id,
    update_service,
    delete_service,
    save_feedback,
    get_service_by_name,
    get_top_requested_services,
    search_services,
    intent_name_exists
)
from rasa_sync import sync_service_to_rasa

app = Flask(__name__)
app.secret_key = "temporary_secret_key_for_project"

GENERAL_REPLY_HTML = """
    <div style="direction:rtl; text-align:right;">
        ارحب<br>
        ايش الخدمة اللي تدور عليها؟
    </div>
    """


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated


def get_or_create_session_id():
    if "chat_session_id" not in session:
        session["chat_session_id"] = str(uuid.uuid4())
    return session["chat_session_id"]


def detect_intent_from_message(user_message):
    try:
        response = requests.post(
            "http://localhost:5005/model/parse",
            json={"text": user_message},
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            intent = data.get("intent", {}).get("name")
            confidence = data.get("intent", {}).get("confidence", 0)

            if confidence >= 0.60:
                return intent

        return None

    except Exception as e:
        print("Rasa connection error:", e)
        return None


def format_service_response(service):
    required_docs = service["required_documents"].split("\n")
    steps = service["steps"].split("\n")

    required_docs_html = "".join(f"<li>{doc}</li>" for doc in required_docs if doc.strip())
    steps_html = "".join(f"<li>{step}</li>" for step in steps if step.strip())

    service_link_html = ""
    if service["service_link"]:
        service_link_html = f'<p><strong>رابط الخدمة:</strong> <a href="{service["service_link"]}" target="_blank">فتح الرابط</a></p>'

    ios_link_html = ""
    if "ios_link" in service.keys() and service["ios_link"]:
        ios_link_html = f'<p><strong>تطبيق الآيفون:</strong> <a href="{service["ios_link"]}" target="_blank">فتح التطبيق</a></p>'

    android_link_html = ""
    if "android_link" in service.keys() and service["android_link"]:
        android_link_html = f'<p><strong>تطبيق الأندرويد:</strong> <a href="{service["android_link"]}" target="_blank">فتح التطبيق</a></p>'

    video_html = ""
    if service["video_link"]:
        video_html = f'<p><strong>رابط الفيديو:</strong> <a href="{service["video_link"]}" target="_blank">مشاهدة الفيديو</a></p>'

    return f"""
    <h3>{service['service_name']}</h3>
    <p><strong>وصف الخدمة:</strong> {service['service_description']}</p>

    <p><strong>المستندات المطلوبة:</strong></p>
    <ul>{required_docs_html}</ul>

    <p><strong>الخطوات:</strong></p>
    <ol>{steps_html}</ol>

    <p><strong>الرسوم:</strong> {service['fees']} ريال</p>
    <p><strong>الوقت المقدر:</strong> {service['estimated_time']} {service['estimated_time_unit'] if service['estimated_time_unit'] else ''}</p>

    {service_link_html}
    {ios_link_html}
    {android_link_html}
    {video_html}
    """


def process_service_form():
    fees = request.form.get("fees", "").strip()
    estimated_time = request.form.get("estimated_time", "").strip()
    estimated_time_unit = request.form.get("estimated_time_unit", "").strip()

    service_data = {
        "service_name": request.form.get("service_name", "").strip(),
        "service_description": request.form.get("service_description", "").strip(),
        "required_documents": request.form.get("required_documents", "").strip(),
        "steps": request.form.get("steps", "").strip(),
        "fees": fees,
        "estimated_time": estimated_time,
        "estimated_time_unit": estimated_time_unit,
        "service_link": request.form.get("service_link", "").strip(),
        "ios_link": request.form.get("ios_link", "").strip(),
        "android_link": request.form.get("android_link", "").strip(),
        "video_link": request.form.get("video_link", "").strip(),
        "category": request.form.get("category", "").strip(),
        "intent_name": request.form.get("intent_name", "").strip(),
        "keywords": request.form.get("keywords", "").strip()
    }

    error = ""
    if not all([
        service_data["service_name"],
        service_data["service_description"],
        service_data["required_documents"],
        service_data["steps"],
        service_data["fees"],
        service_data["estimated_time"],
        service_data["category"],
        service_data["intent_name"],
        service_data["keywords"]
    ]):
        error = "جميع الحقول الأساسية مطلوبة"
    else:
        try:
            float(fees)
        except Exception:
            error = "الرسوم يجب أن تكون رقمًا فقط"

        if not error and not estimated_time.isdigit():
            error = "المدة المقدرة يجب أن تكون رقمًا فقط"

        if not error and estimated_time_unit not in ["دقيقة", "ساعة", "يوم"]:
            error = "يجب اختيار وحدة وقت صحيحة"

    return service_data, error


def general_chat_reply(session_id, user_message, detected_intent, bot_response):
    message_id = save_message(
        session_id=session_id,
        user_message=user_message,
        detected_intent=detected_intent,
        service_id=None,
        bot_response=bot_response
    )
    return jsonify({"reply": GENERAL_REPLY_HTML, "message_id": message_id})


@app.route("/")
def home():
    quick_services = get_top_requested_services()

    if not quick_services:
        quick_services = [
            {"service_name": "تجديد الهوية الوطنية", "category": "الأحوال المدنية"},
            {"service_name": "تجديد رخصة القيادة", "category": "المرور"},
            {"service_name": "إصدار جواز السفر السعودي", "category": "الجوازات"},
            {"service_name": "إدارة العنوان الوطني", "category": "العنوان الوطني"},
            {"service_name": "تجديد جواز السفر السعودي", "category": "الجوازات"},
            {"service_name": "التسجيل في الجامعات", "category": "التعليم"}
        ]

    return render_template("chat.html", quick_services=quick_services)


@app.route("/services/list")
def services_list():
    services = get_all_services()
    result = [
        {
            "id": s["id"],
            "name": s["service_name"],
            "category": s["category"]
        }
        for s in services
    ]
    return jsonify(result)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "الرجاء إدخال رسالة صحيحة.", "message_id": None})

    session_id = get_or_create_session_id()
    detected_intent = detect_intent_from_message(user_message)

    if detected_intent == "greet":
        return general_chat_reply(session_id, user_message, detected_intent, "رسالة ترحيب")

    if detected_intent == "ask_for_help":
        bot_reply = """
        <div style="direction:rtl; text-align:right;">
            أبشر ماطلبت شي، وضح لي ايش تحتاج؟؟ مثلا:
            <ul>
                <li>ابغى أجدد الهوية الوطنية</li>
                <li>ابغى أجدد رخصة القيادة</li>
            </ul>
            اكتب لي وش تحتاج وأنا ارد بالخدمة المناسبة.
        </div>
        """
        message_id = save_message(
            session_id=session_id,
            user_message=user_message,
            detected_intent=detected_intent,
            service_id=None,
            bot_response="طلب مساعدة عام"
        )
        return jsonify({"reply": bot_reply, "message_id": message_id})

    if detected_intent == "nlu_fallback":
        return general_chat_reply(session_id, user_message, detected_intent, "تحويل إلى رد ترحيبي عام")

    service_by_name = get_service_by_name(user_message)
    if service_by_name:
        bot_reply = format_service_response(service_by_name)
        message_id = save_message(
            session_id=session_id,
            user_message=user_message,
            detected_intent=service_by_name["intent_name"],
            service_id=service_by_name["id"],
            bot_response=f"تم العثور على الخدمة: {service_by_name['service_name']}"
        )
        return jsonify({"reply": bot_reply, "message_id": message_id})

    if detected_intent:
        service = get_service_by_intent(detected_intent)
        if service:
            bot_reply = format_service_response(service)
            message_id = save_message(
                session_id=session_id,
                user_message=user_message,
                detected_intent=detected_intent,
                service_id=service["id"],
                bot_response=f"تم العثور على الخدمة: {service['service_name']}"
            )
            return jsonify({"reply": bot_reply, "message_id": message_id})

    return general_chat_reply(session_id, user_message, None, "رد ترحيبي عام")


@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()

    message_id = data.get("message_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    if message_id is None or rating is None:
        return jsonify({"success": False, "message": "البيانات غير مكتملة"}), 400

    session_id = get_or_create_session_id()
    save_feedback(session_id=session_id, message_id=message_id, rating=rating, comment=comment)

    return jsonify({"success": True, "message": "تم حفظ التقييم بنجاح"})


@app.route("/search")
def search_services_api():
    query = request.args.get("q", "").strip()
    if not query or len(query) < 2:
        return jsonify([])
    results = search_services(query)
    return jsonify([dict(r) for r in results])


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    error = ""

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if verify_admin(username, password):
            session["admin_logged_in"] = True
            return redirect(url_for("admin_dashboard"))
        else:
            error = "اسم المستخدم أو كلمة المرور غير صحيحة"

    return render_template("admin_login.html", error=error)


@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    stats = get_dashboard_stats()
    return render_template(
        "admin_dashboard.html",
        total_messages=stats["total_messages"],
        total_services=stats["total_services"],
        positive_feedback=stats["positive_feedback"],
        negative_feedback=stats["negative_feedback"],
        satisfaction_rate=stats["satisfaction_rate"],
        most_requested_services=stats["most_requested_services"]
    )


@app.route("/admin/services")
@admin_required
def manage_services():
    services = get_all_services()
    return render_template("manage_services.html", services=services)


@app.route("/admin/services/check-intent")
@admin_required
def check_service_intent_name():

    intent_name = request.args.get("intent_name", "").strip()
    service_id = request.args.get("service_id", type=int)

    if not intent_name:
        return jsonify({
            "exists": False
        })

    exists = intent_name_exists(intent_name,service_id)

    return jsonify({
        "exists": exists
    })


@app.route("/admin/services/add", methods=["GET", "POST"])
@admin_required
def add_new_service():
    error = ""

    if request.method == "POST":
        service_data, error = process_service_form()

        if not error:
            try:
                add_service(service_data)
                sync_service_to_rasa(
                    intent=service_data["intent_name"],
                    keywords=service_data["keywords"],
                    action="add"
                )
                return redirect(url_for("manage_services"))
            except Exception as e:
                error = f"حدث خطأ أثناء إضافة الخدمة: {str(e)}"

    return render_template("add_service.html", error=error)


@app.route("/admin/services/edit/<int:service_id>", methods=["GET", "POST"])
@admin_required
def edit_service_page(service_id):
    service = get_service_by_id(service_id)

    if not service:
        return "الخدمة غير موجودة", 404

    error = ""

    if request.method == "POST":
        service_data, error = process_service_form()

        if not error:
            try:
                update_service(service_id, service_data)
                sync_service_to_rasa(
                    intent=service_data["intent_name"],
                    keywords=service_data["keywords"],
                    action="update"
                )
                return redirect(url_for("manage_services"))
            except Exception as e:
                error = f"حدث خطأ أثناء تعديل الخدمة: {str(e)}"

    return render_template("edit_service.html", service=service, error=error)


@app.route("/admin/services/delete/<int:service_id>")
@admin_required
def delete_service_page(service_id):
    service = get_service_by_id(service_id)

    if not service:
        return "الخدمة غير موجودة", 404

    intent_name = service["intent_name"]
    delete_service(service_id)
    sync_service_to_rasa(intent=intent_name, keywords="", action="delete")

    return redirect(url_for("manage_services"))


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("admin_login"))


if __name__ == "__main__":
    init_db()
    wb.open("http://127.0.0.1:5000/")
    app.run()
