import os
import sqlite3

from werkzeug.security import generate_password_hash

def init_database():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "site.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image TEXT,
        content TEXT,
        author_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        short_description TEXT,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('free','paid')),
        price INTEGER DEFAULT 0,
        instructor TEXT,
        duration TEXT,
        thumbnail TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(course_id) REFERENCES courses(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content_type TEXT DEFAULT 'text',
        content TEXT,
        notes TEXT,
        sort_order INTEGER DEFAULT 0,
        is_free_preview INTEGER DEFAULT 0,
        FOREIGN KEY(section_id) REFERENCES course_sections(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(course_id) REFERENCES courses(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_faq (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(course_id) REFERENCES courses(id)
    )
    """)

    conn.commit()

    # ------------------------------
    # Optional bootstrap admin user
    # ------------------------------
    # If you set these env vars, the app will ensure an admin exists.
    # This makes first-time setup on a fresh server much easier.
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    admin_username = os.environ.get("ADMIN_USERNAME", "admin")

    if admin_email and admin_password:
        pw_hash = generate_password_hash(admin_password)

        # Create admin if missing; otherwise promote existing user to admin.
        cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
        row = cursor.fetchone()
        if row is None:
            # Ensure username uniqueness (simple fallback)
            cursor.execute("SELECT 1 FROM users WHERE username = ?", (admin_username,))
            if cursor.fetchone() is not None:
                admin_username = f"{admin_username}_1"

            cursor.execute(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')",
                (admin_username, admin_email, pw_hash),
            )
        else:
            cursor.execute("UPDATE users SET role = 'admin' WHERE email = ?", (admin_email,))

        conn.commit()

    conn.close()