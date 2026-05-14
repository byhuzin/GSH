import sqlite3
from contextlib import closing
from werkzeug.security import generate_password_hash, check_password_hash
import os

DB_NAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "DATABASE", "government_services.db")


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(get_connection()) as conn:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    service_name TEXT NOT NULL UNIQUE,
                    service_description TEXT NOT NULL,
                    required_documents TEXT NOT NULL,
                    steps TEXT NOT NULL,
                    fees TEXT NOT NULL,
                    estimated_time TEXT NOT NULL,
                    estimated_time_unit TEXT,
                    service_link TEXT,
                    ios_link TEXT,
                    android_link TEXT,
                    video_link TEXT,
                    category TEXT,
                    intent_name TEXT NOT NULL UNIQUE,
                    keywords TEXT,
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS admins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    user_message TEXT NOT NULL,
                    detected_intent TEXT,
                    service_id INTEGER,
                    bot_response TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (service_id) REFERENCES services(id)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    message_id INTEGER,
                    rating INTEGER NOT NULL,
                    comment TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (message_id) REFERENCES messages(id)
                )
            """)

    add_new_columns()

def add_new_columns():
    with closing(get_connection()) as conn:
        with conn:
            try:
                conn.execute("ALTER TABLE services ADD COLUMN ios_link TEXT")
            except sqlite3.OperationalError:
                pass

            try:
                conn.execute("ALTER TABLE services ADD COLUMN android_link TEXT")
            except sqlite3.OperationalError:
                pass

            try:
                conn.execute("ALTER TABLE services ADD COLUMN estimated_time_unit TEXT")
            except sqlite3.OperationalError:
                pass


def create_admin(username: str, password: str):
    password_hash = generate_password_hash(password)

    with closing(get_connection()) as conn:
        with conn:
            conn.execute("""
                INSERT OR IGNORE INTO admins (username, password_hash)
                VALUES (?, ?)
            """, (username, password_hash))


def verify_admin(username: str, password: str) -> bool:
    with closing(get_connection()) as conn:
        admin = conn.execute("""
            SELECT * FROM admins WHERE username = ?
        """, (username,)).fetchone()

    if not admin:
        return False

    return check_password_hash(admin["password_hash"], password)


def add_service(service_data: dict):
    with closing(get_connection()) as conn:
        with conn:
            conn.execute("""
                INSERT INTO services (
                    service_name,
                    service_description,
                    required_documents,
                    steps,
                    fees,
                    estimated_time,
                    estimated_time_unit,
                    service_link,
                    ios_link,
                    android_link,
                    video_link,
                    category,
                    intent_name,
                    keywords
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                service_data["service_name"],
                service_data["service_description"],
                service_data["required_documents"],
                service_data["steps"],
                service_data["fees"],
                service_data["estimated_time"],
                service_data["estimated_time_unit"],
                service_data.get("service_link", ""),
                service_data.get("ios_link", ""),
                service_data.get("android_link", ""),
                service_data.get("video_link", ""),
                service_data["category"],
                service_data["intent_name"],
                service_data["keywords"]
            ))


def get_all_services():
    with closing(get_connection()) as conn:
        services = conn.execute("""
            SELECT * FROM services
            WHERE is_active = 1
            ORDER BY id DESC
        """).fetchall()

    return services


def get_all_services_for_admin():
    with closing(get_connection()) as conn:
        services = conn.execute("""
            SELECT * FROM services
            ORDER BY id DESC
        """).fetchall()

    return services


def get_service_by_intent(intent_name: str):
    with closing(get_connection()) as conn:
        service = conn.execute("""
            SELECT * FROM services
            WHERE intent_name = ? AND is_active = 1
        """, (intent_name,)).fetchone()

    return service


def intent_name_exists(intent_name, exclude_service_id=None):
    with closing(get_connection()) as conn:
        if exclude_service_id:
            service = conn.execute("""
                SELECT * FROM services
                WHERE intent_name = ?
                AND id != ?
                LIMIT 1
            """, (intent_name, exclude_service_id)).fetchone()
        else:
            service = conn.execute("""
                SELECT * FROM services
                WHERE intent_name = ?
                LIMIT 1
            """, (intent_name,)).fetchone()
    if service:
        return True
    return False


def get_service_by_id(service_id: int):
    with closing(get_connection()) as conn:
        service = conn.execute("""
            SELECT * FROM services
            WHERE id = ?
        """, (service_id,)).fetchone()

    return service


def get_service_usage_stats(service_id: int):
    with closing(get_connection()) as conn:
        stats = conn.execute("""
            SELECT
                COUNT(m.id) AS request_count,
                COALESCE(SUM(CASE WHEN f.rating = 1 THEN 1 ELSE 0 END), 0) AS positive_feedback,
                COALESCE(SUM(CASE WHEN f.rating = 0 THEN 1 ELSE 0 END), 0) AS negative_feedback,
                COUNT(f.id) AS total_feedback
            FROM messages m
            LEFT JOIN feedback f ON f.message_id = m.id
            WHERE m.service_id = ?
        """, (service_id,)).fetchone()

    total_feedback = stats["total_feedback"]
    satisfaction_rate = 0

    if total_feedback > 0:
        satisfaction_rate = round((stats["positive_feedback"] / total_feedback) * 100, 2)

    return {
        "request_count": stats["request_count"],
        "positive_feedback": stats["positive_feedback"],
        "negative_feedback": stats["negative_feedback"],
        "total_feedback": total_feedback,
        "satisfaction_rate": satisfaction_rate
    }


def update_service(service_id: int, service_data: dict):
    with closing(get_connection()) as conn:
        with conn:
            conn.execute("""
                UPDATE services
                SET service_name = ?,
                    service_description = ?,
                    required_documents = ?,
                    steps = ?,
                    fees = ?,
                    estimated_time = ?,
                    estimated_time_unit = ?,
                    service_link = ?,
                    ios_link = ?,
                    android_link = ?,
                    video_link = ?,
                    category = ?,
                    intent_name = ?,
                    keywords = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                service_data["service_name"],
                service_data["service_description"],
                service_data["required_documents"],
                service_data["steps"],
                service_data["fees"],
                service_data["estimated_time"],
                service_data["estimated_time_unit"],
                service_data.get("service_link", ""),
                service_data.get("ios_link", ""),
                service_data.get("android_link", ""),
                service_data.get("video_link", ""),
                service_data["category"],
                service_data["intent_name"],
                service_data["keywords"],
                service_id
            ))


def set_service_active(service_id: int, is_active: int):
    with closing(get_connection()) as conn:
        with conn:
            conn.execute("""
                UPDATE services
                SET is_active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (is_active, service_id))


def save_message(session_id: str, user_message: str, detected_intent: str = None,
                 service_id: int = None, bot_response: str = None):
    with closing(get_connection()) as conn:
        with conn:
            cursor = conn.execute("""
                INSERT INTO messages (
                    session_id,
                    user_message,
                    detected_intent,
                    service_id,
                    bot_response
                )
                VALUES (?, ?, ?, ?, ?)
            """, (session_id, user_message, detected_intent, service_id, bot_response))
            return cursor.lastrowid


def save_feedback(session_id: str, message_id: int, rating: int, comment: str = ""):
    with closing(get_connection()) as conn:
        with conn:
            conn.execute("""
                INSERT INTO feedback (session_id, message_id, rating, comment)
                VALUES (?, ?, ?, ?)
            """, (session_id, message_id, rating, comment))


def get_dashboard_stats():
    with closing(get_connection()) as conn:
        total_messages = conn.execute("""
            SELECT COUNT(*) AS count FROM messages
        """).fetchone()["count"]

        total_services = conn.execute("""
            SELECT COUNT(*) AS count FROM services
        """).fetchone()["count"]

        active_services = conn.execute("""
            SELECT COUNT(*) AS count FROM services
            WHERE is_active = 1
        """).fetchone()["count"]

        inactive_services = conn.execute("""
            SELECT COUNT(*) AS count FROM services
            WHERE is_active = 0
        """).fetchone()["count"]

        positive_feedback = conn.execute("""
            SELECT COUNT(*) AS count FROM feedback
            WHERE rating = 1
        """).fetchone()["count"]

        negative_feedback = conn.execute("""
            SELECT COUNT(*) AS count FROM feedback
            WHERE rating = 0
        """).fetchone()["count"]

        most_requested_services = conn.execute("""
            SELECT s.service_name, COUNT(m.id) AS request_count
            FROM messages m
            JOIN services s ON m.service_id = s.id
            WHERE m.service_id IS NOT NULL
            GROUP BY s.service_name
            ORDER BY request_count DESC
            LIMIT 5
        """).fetchall()

        service_stats_rows = conn.execute("""
            SELECT
                s.id,
                s.service_name,
                s.category,
                s.intent_name,
                s.is_active,
                COALESCE(requests.request_count, 0) AS request_count,
                COALESCE(feedback_stats.positive_feedback, 0) AS positive_feedback,
                COALESCE(feedback_stats.negative_feedback, 0) AS negative_feedback,
                COALESCE(feedback_stats.total_feedback, 0) AS total_feedback
            FROM services s
            LEFT JOIN (
                SELECT service_id, COUNT(*) AS request_count
                FROM messages
                WHERE service_id IS NOT NULL
                GROUP BY service_id
            ) requests ON requests.service_id = s.id
            LEFT JOIN (
                SELECT
                    m.service_id,
                    SUM(CASE WHEN f.rating = 1 THEN 1 ELSE 0 END) AS positive_feedback,
                    SUM(CASE WHEN f.rating = 0 THEN 1 ELSE 0 END) AS negative_feedback,
                    COUNT(f.id) AS total_feedback
                FROM feedback f
                JOIN messages m ON f.message_id = m.id
                WHERE m.service_id IS NOT NULL
                GROUP BY m.service_id
            ) feedback_stats ON feedback_stats.service_id = s.id
            ORDER BY request_count DESC, total_feedback DESC, s.service_name
        """).fetchall()

        total_feedback = positive_feedback + negative_feedback

        if total_feedback > 0:
            satisfaction_rate = round((positive_feedback / total_feedback) * 100, 2)
        else:
            satisfaction_rate = 0

        service_stats = []

        for service in service_stats_rows:
            service_total_feedback = service["total_feedback"]
            service_satisfaction_rate = 0

            if service_total_feedback > 0:
                service_satisfaction_rate = round(
                    (service["positive_feedback"] / service_total_feedback) * 100,
                    2
                )

            service_stats.append({
                "id": service["id"],
                "service_name": service["service_name"],
                "category": service["category"] or "",
                "intent_name": service["intent_name"],
                "is_active": service["is_active"],
                "request_count": service["request_count"],
                "positive_feedback": service["positive_feedback"],
                "negative_feedback": service["negative_feedback"],
                "total_feedback": service_total_feedback,
                "satisfaction_rate": service_satisfaction_rate
            })

    return {
        "total_messages": total_messages,
        "total_services": total_services,
        "active_services": active_services,
        "inactive_services": inactive_services,
        "positive_feedback": positive_feedback,
        "negative_feedback": negative_feedback,
        "satisfaction_rate": satisfaction_rate,
        "most_requested_services": most_requested_services,
        "service_stats": service_stats
    }

def get_top_requested_services(limit=6):
    with closing(get_connection()) as conn:
        services = conn.execute("""
            SELECT s.service_name, s.intent_name, s.category
            FROM messages m
            JOIN services s ON m.service_id = s.id
            WHERE m.service_id IS NOT NULL AND s.is_active = 1
            GROUP BY s.id, s.service_name, s.intent_name, s.category
            ORDER BY COUNT(m.id) DESC
            LIMIT ?
        """, (limit,)).fetchall()

    return services

def get_service_by_name(service_name):
    with closing(get_connection()) as conn:
        service = conn.execute("""
            SELECT *
            FROM services
            WHERE service_name = ? AND is_active = 1
        """, (service_name,)).fetchone()

    return service

def search_services(query: str, limit: int = 8):
    with closing(get_connection()) as conn:
        services = conn.execute("""
            SELECT id, service_name, category, intent_name
            FROM services
            WHERE is_active = 1
              AND (
                service_name LIKE ?
                OR keywords LIKE ?
                OR service_description LIKE ?
              )
            ORDER BY service_name
            LIMIT ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%", limit)).fetchall()
    return services
