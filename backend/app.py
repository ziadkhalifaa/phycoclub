import os
import sqlite3
from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database.init_db import init_database


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "site.db")


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def json_row(row):
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}


def is_admin():
    return session.get("role") == "admin"


def require_login():
    if not session.get("user_id"):
        return jsonify({"error": "AUTH_REQUIRED"}), 401
    return None


def require_admin():
    if not is_admin():
        return jsonify({"error": "ADMIN_REQUIRED"}), 403
    return None


def parse_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return default


def create_app():
    # When you build the React app, Vite outputs to ../dist
    dist_dir = os.path.abspath(os.path.join(BASE_DIR, "..", "dist"))
    app = Flask(
        __name__,
        static_folder=dist_dir if os.path.isdir(dist_dir) else None,
        static_url_path="/",
    )

    init_database()
    app.secret_key = os.environ.get("FLASK_SECRET", os.urandom(24))

    # Same-origin production doesn't need CORS, but dev does.
    CORS(
        app,
        supports_credentials=True,
        resources={r"/api/*": {"origins": os.environ.get("CORS_ORIGIN", "http://localhost:5173")}},
    )

    # --------------------
    # Health & auth
    # --------------------
    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    @app.get("/api/me")
    def me():
        if not session.get("user_id"):
            return jsonify({"user": None})
        return jsonify(
            {
                "user": {
                    "id": session.get("user_id"),
                    "username": session.get("username"),
                    "role": session.get("role"),
                }
            }
        )

    @app.post("/api/auth/register")
    def api_register():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""
        confirm = data.get("confirm") or ""

        if not username or not email or not password:
            return jsonify({"error": "MISSING_FIELDS"}), 400
        if password != confirm:
            return jsonify({"error": "PASSWORD_MISMATCH"}), 400

        pw_hash = generate_password_hash(password)
        conn = db()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (username, email, pw_hash),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return jsonify({"error": "USER_OR_EMAIL_EXISTS"}), 409
        finally:
            conn.close()

        return jsonify({"ok": True})

    @app.post("/api/auth/login")
    def api_login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""
        if not email or not password:
            return jsonify({"error": "MISSING_FIELDS"}), 400

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cur.fetchone()
        conn.close()

        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "INVALID_CREDENTIALS"}), 401

        session["user_id"] = user["id"]
        session["username"] = user["username"]
        session["role"] = user["role"]
        return jsonify({"ok": True, "user": {"id": user["id"], "username": user["username"], "role": user["role"]}})

    @app.post("/api/auth/logout")
    def api_logout():
        session.clear()
        return jsonify({"ok": True})

    # --------------------
    # Articles
    # --------------------
    @app.get("/api/articles")
    def api_articles():
        limit = request.args.get("limit")
        try:
            limit_int = int(limit) if limit else None
        except ValueError:
            limit_int = None

        conn = db()
        cur = conn.cursor()
        q = """
            SELECT a.id, a.title, a.content, a.created_at, a.image, u.username as author
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            ORDER BY a.created_at DESC
        """
        if limit_int:
            q += " LIMIT ?"
            cur.execute(q, (limit_int,))
        else:
            cur.execute(q)
        rows = cur.fetchall()
        conn.close()

        items = []
        for r in rows:
            content = r["content"] or ""
            items.append(
                {
                    "id": r["id"],
                    "title": r["title"],
                    "excerpt": (content[:180] + "...") if len(content) > 180 else content,
                    "content": content,
                    "created_at": r["created_at"],
                    "image": r["image"],
                    "author": r["author"] or "",
                }
            )
        return jsonify({"items": items})

    @app.get("/api/articles/<int:article_id>")
    def api_article_detail(article_id: int):
        conn = db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT a.id, a.title, a.content, a.created_at, a.image, u.username as author
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = ?
            """,
            (article_id,),
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return jsonify({"error": "NOT_FOUND"}), 404
        return jsonify({"item": json_row(row)})

    @app.post("/api/articles")
    def api_article_create():
        err = require_admin()
        if err:
            return err

        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        content = (data.get("content") or "").strip()
        image = (data.get("image") or "").strip()
        if not title or not content:
            return jsonify({"error": "MISSING_FIELDS"}), 400

        conn = db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO articles (title, image, content, author_id) VALUES (?, ?, ?, ?)",
            (title, image, content, session.get("user_id")),
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"ok": True, "id": new_id})

    @app.put("/api/articles/<int:article_id>")
    def api_article_update(article_id: int):
        err = require_admin()
        if err:
            return err

        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        content = (data.get("content") or "").strip()
        image = (data.get("image") or "").strip()
        if not title or not content:
            return jsonify({"error": "MISSING_FIELDS"}), 400

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM articles WHERE id = ?", (article_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404

        cur.execute(
            "UPDATE articles SET title = ?, image = ?, content = ? WHERE id = ?",
            (title, image, content, article_id),
        )
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/articles/<int:article_id>")
    def api_article_delete(article_id: int):
        err = require_admin()
        if err:
            return err

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM articles WHERE id = ?", (article_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404
        cur.execute("DELETE FROM articles WHERE id = ?", (article_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    # --------------------
    # Courses
    # --------------------
    @app.get("/api/courses")
    def api_courses():
        limit = request.args.get("limit")
        try:
            limit_int = int(limit) if limit else None
        except ValueError:
            limit_int = None

        conn = db()
        cur = conn.cursor()
        q = """
            SELECT id, title, short_description, type, price, instructor, duration, thumbnail, created_at
            FROM courses
            ORDER BY created_at DESC
        """
        if limit_int:
            q += " LIMIT ?"
            cur.execute(q, (limit_int,))
        else:
            cur.execute(q)
        rows = cur.fetchall()
        conn.close()
        return jsonify({"items": [json_row(r) for r in rows]})

    @app.get("/api/courses/<int:course_id>")
    def api_course_detail(course_id: int):
        conn = db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, title, short_description, description, type, price, instructor, duration, thumbnail, created_at
            FROM courses
            WHERE id = ?
            """,
            (course_id,),
        )
        course = cur.fetchone()
        if not course:
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404

        cur.execute(
            """
            SELECT id, title
            FROM course_sections
            WHERE course_id = ?
            ORDER BY sort_order ASC, id ASC
            """,
            (course_id,),
        )
        sections_rows = cur.fetchall()
        sections = []
        for s in sections_rows:
            cur.execute(
                """
                SELECT id, title, is_free_preview
                FROM course_lessons
                WHERE section_id = ?
                ORDER BY sort_order ASC, id ASC
                """,
                (s["id"],),
            )
            lessons = [json_row(l) for l in cur.fetchall()]
            sections.append({"id": s["id"], "title": s["title"], "lessons": lessons})

        cur.execute(
            "SELECT id, text, sort_order FROM course_features WHERE course_id = ? ORDER BY sort_order ASC, id ASC",
            (course_id,),
        )
        features = [json_row(r) for r in cur.fetchall()]

        cur.execute(
            "SELECT id, question, answer, sort_order FROM course_faq WHERE course_id = ? ORDER BY sort_order ASC, id ASC",
            (course_id,),
        )
        faq = [json_row(r) for r in cur.fetchall()]

        is_enrolled = False
        if session.get("user_id"):
            cur.execute(
                "SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?",
                (session["user_id"], course_id),
            )
            is_enrolled = cur.fetchone() is not None

        conn.close()
        return jsonify(
            {
                "course": json_row(course),
                "sections": sections,
                "features": features,
                "faq": faq,
                "is_enrolled": is_enrolled,
            }
        )

    @app.post("/api/courses/<int:course_id>/enroll")
    def api_enroll(course_id: int):
        err = require_login()
        if err:
            return err

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT type FROM courses WHERE id = ?", (course_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404

        # paid flow not implemented: keep it simple for now
        if row["type"] == "paid":
            conn.close()
            return jsonify({"error": "PAID_COURSE"}), 400

        try:
            cur.execute(
                "INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, 'active')",
                (session["user_id"], course_id),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        finally:
            conn.close()

        return jsonify({"ok": True})

    @app.get("/api/courses/<int:course_id>/lesson/<int:lesson_id>")
    def api_lesson(course_id: int, lesson_id: int):
        conn = db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT
                cl.id as lesson_id,
                cl.title as lesson_title,
                cl.content_type,
                cl.content,
                cl.notes,
                cl.is_free_preview,
                cs.title as section_title,
                co.id as course_id,
                co.title as course_title
            FROM course_lessons cl
            JOIN course_sections cs ON cl.section_id = cs.id
            JOIN courses co ON cs.course_id = co.id
            WHERE co.id = ? AND cl.id = ?
            """,
            (course_id, lesson_id),
        )
        lesson = cur.fetchone()
        if not lesson:
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404

        is_enrolled = False
        if session.get("user_id"):
            cur.execute(
                "SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?",
                (session["user_id"], course_id),
            )
            is_enrolled = cur.fetchone() is not None

        can_open = is_admin() or is_enrolled or bool(lesson["is_free_preview"])
        conn.close()

        if not can_open:
            return jsonify({"error": "ENROLL_REQUIRED"}), 403

        return jsonify({"lesson": json_row(lesson), "is_enrolled": is_enrolled})

    # --------------------
    # Admin create/update minimal (enough to manage content)
    # --------------------
    @app.post("/api/courses")
    def api_course_create():
        err = require_admin()
        if err:
            return err
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        short_description = (data.get("short_description") or "").strip()
        description = (data.get("description") or "").strip()
        ctype = (data.get("type") or "free").strip()
        instructor = (data.get("instructor") or "").strip()
        duration = (data.get("duration") or "").strip()
        thumbnail = (data.get("thumbnail") or "").strip()
        price = data.get("price")
        if not title:
            return jsonify({"error": "MISSING_FIELDS"}), 400
        if ctype not in ("free", "paid"):
            ctype = "free"
        try:
            price_int = int(price) if ctype == "paid" else 0
        except Exception:
            price_int = 0

        conn = db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO courses (title, short_description, description, type, price, instructor, duration, thumbnail, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (title, short_description, description, ctype, price_int, instructor, duration, thumbnail, session.get("user_id")),
        )
        conn.commit()
        course_id = cur.lastrowid

        # Optional: features & faq arrays
        features = data.get("features") or []
        for i, text in enumerate([t for t in features if str(t).strip()]):
            cur.execute(
                "INSERT INTO course_features (course_id, text, sort_order) VALUES (?, ?, ?)",
                (course_id, str(text).strip(), i),
            )

        faq = data.get("faq") or []
        for i, item in enumerate(faq):
            q = str((item or {}).get("question") or "").strip()
            a = str((item or {}).get("answer") or "").strip()
            if q and a:
                cur.execute(
                    "INSERT INTO course_faq (course_id, question, answer, sort_order) VALUES (?, ?, ?, ?)",
                    (course_id, q, a, i),
                )

        conn.commit()
        conn.close()
        return jsonify({"ok": True, "id": course_id})

    @app.post("/api/courses/<int:course_id>/sections")
    def api_section_create(course_id: int):
        err = require_admin()
        if err:
            return err
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        sort_order = data.get("sort_order", 0)
        if not title:
            return jsonify({"error": "MISSING_FIELDS"}), 400
        try:
            sort_order = int(sort_order)
        except Exception:
            sort_order = 0

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM courses WHERE id = ?", (course_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404
        cur.execute(
            "INSERT INTO course_sections (course_id, title, sort_order) VALUES (?, ?, ?)",
            (course_id, title, sort_order),
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"ok": True, "id": new_id})

    @app.post("/api/courses/<int:course_id>/lessons")
    def api_lesson_create(course_id: int):
        err = require_admin()
        if err:
            return err
        data = request.get_json(silent=True) or {}
        section_id = data.get("section_id")
        title = (data.get("title") or "").strip()
        sort_order = data.get("sort_order", 0)
        notes = (data.get("notes") or "").strip()
        is_free_preview = 1 if bool(data.get("is_free_preview")) else 0
        content_type = (data.get("content_type") or "text").strip()
        content = (data.get("content") or "").strip()

        if not section_id or not title:
            return jsonify({"error": "MISSING_FIELDS"}), 400
        try:
            section_id = int(section_id)
        except Exception:
            return jsonify({"error": "INVALID_SECTION"}), 400
        try:
            sort_order = int(sort_order)
        except Exception:
            sort_order = 0
        if content_type not in ("text", "video", "link"):
            content_type = "text"

        conn = db()
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM course_sections WHERE id = ? AND course_id = ?",
            (section_id, course_id),
        )
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "SECTION_NOT_IN_COURSE"}), 400

        cur.execute(
            """
            INSERT INTO course_lessons (section_id, title, content_type, content, notes, sort_order, is_free_preview)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (section_id, title, content_type, content, notes, sort_order, is_free_preview),
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"ok": True, "id": new_id})

    # --------------------
    # Admin updates / deletes
    # --------------------
    @app.put("/api/courses/<int:course_id>")
    def api_course_update(course_id: int):
        err = require_admin()
        if err:
            return err

        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        short_description = (data.get("short_description") or "").strip()
        description = (data.get("description") or "").strip()
        ctype = (data.get("type") or "free").strip()
        instructor = (data.get("instructor") or "").strip()
        duration = (data.get("duration") or "").strip()
        thumbnail = (data.get("thumbnail") or "").strip()
        price = data.get("price")

        if not title:
            return jsonify({"error": "MISSING_FIELDS"}), 400
        if ctype not in ("free", "paid"):
            ctype = "free"
        price_int = parse_int(price, 0) if ctype == "paid" else 0

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM courses WHERE id = ?", (course_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404

        cur.execute(
            """
            UPDATE courses
            SET title = ?, short_description = ?, description = ?, type = ?, price = ?, instructor = ?, duration = ?, thumbnail = ?
            WHERE id = ?
            """,
            (title, short_description, description, ctype, price_int, instructor, duration, thumbnail, course_id),
        )

        # Replace features & faq if provided
        if "features" in data:
            cur.execute("DELETE FROM course_features WHERE course_id = ?", (course_id,))
            for i, text in enumerate([t for t in (data.get("features") or []) if str(t).strip()]):
                cur.execute(
                    "INSERT INTO course_features (course_id, text, sort_order) VALUES (?, ?, ?)",
                    (course_id, str(text).strip(), i),
                )

        if "faq" in data:
            cur.execute("DELETE FROM course_faq WHERE course_id = ?", (course_id,))
            for i, item in enumerate(data.get("faq") or []):
                q = str((item or {}).get("question") or "").strip()
                a = str((item or {}).get("answer") or "").strip()
                if q and a:
                    cur.execute(
                        "INSERT INTO course_faq (course_id, question, answer, sort_order) VALUES (?, ?, ?, ?)",
                        (course_id, q, a, i),
                    )

        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/courses/<int:course_id>")
    def api_course_delete(course_id: int):
        err = require_admin()
        if err:
            return err

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM courses WHERE id = ?", (course_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404

        # Manual cascade cleanup (SQLite FK constraints here don't specify ON DELETE CASCADE)
        cur.execute(
            "DELETE FROM course_lessons WHERE section_id IN (SELECT id FROM course_sections WHERE course_id = ?)",
            (course_id,),
        )
        cur.execute("DELETE FROM course_sections WHERE course_id = ?", (course_id,))
        cur.execute("DELETE FROM course_features WHERE course_id = ?", (course_id,))
        cur.execute("DELETE FROM course_faq WHERE course_id = ?", (course_id,))
        cur.execute("DELETE FROM enrollments WHERE course_id = ?", (course_id,))
        cur.execute("DELETE FROM courses WHERE id = ?", (course_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/courses/<int:course_id>/sections/<int:section_id>")
    def api_section_delete(course_id: int, section_id: int):
        err = require_admin()
        if err:
            return err

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM course_sections WHERE id = ? AND course_id = ?", (section_id, course_id))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404
        cur.execute("DELETE FROM course_lessons WHERE section_id = ?", (section_id,))
        cur.execute("DELETE FROM course_sections WHERE id = ?", (section_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/courses/<int:course_id>/lessons/<int:lesson_id>")
    def api_lesson_delete(course_id: int, lesson_id: int):
        err = require_admin()
        if err:
            return err

        conn = db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 1
            FROM course_lessons cl
            JOIN course_sections cs ON cl.section_id = cs.id
            WHERE cl.id = ? AND cs.course_id = ?
            """,
            (lesson_id, course_id),
        )
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404
        cur.execute("DELETE FROM course_lessons WHERE id = ?", (lesson_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    # --------------------
    # Admin users / roles
    # --------------------
    @app.get("/api/admin/users")
    def api_admin_users():
        err = require_admin()
        if err:
            return err
        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, role FROM users ORDER BY id ASC")
        users = [json_row(r) for r in cur.fetchall()]
        conn.close()
        return jsonify({"items": users})

    @app.patch("/api/admin/users/<int:user_id>")
    def api_admin_user_role(user_id: int):
        err = require_admin()
        if err:
            return err
        data = request.get_json(silent=True) or {}
        role = (data.get("role") or "").strip()
        if role not in ("user", "admin"):
            return jsonify({"error": "INVALID_ROLE"}), 400

        # Prevent demoting yourself (easy foot-gun)
        if session.get("user_id") == user_id and role != "admin":
            return jsonify({"error": "CANNOT_DEMOTE_SELF"}), 400

        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM users WHERE id = ?", (user_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"error": "NOT_FOUND"}), 404
        cur.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    # --------------------
    # SPA static serving (production)
    # --------------------
    @app.get("/")
    def spa_root():
        if app.static_folder and os.path.isdir(app.static_folder):
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"error": "FRONTEND_NOT_BUILT", "hint": "Run npm run build"}), 501

    @app.get("/<path:path>")
    def spa_assets(path: str):
        # API routes should 404 here (they are matched earlier)
        if not app.static_folder or not os.path.isdir(app.static_folder):
            return jsonify({"error": "FRONTEND_NOT_BUILT"}), 501
        full_path = os.path.join(app.static_folder, path)
        if os.path.isfile(full_path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
