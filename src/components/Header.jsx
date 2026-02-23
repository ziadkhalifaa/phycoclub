import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header>
      <div className="header-container">
        <Link to="/" className="logo" style={{ textDecoration: "none" }}>
          قيم
        </Link>

        <nav>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}
                end
              >
                الرئيسية
              </NavLink>
            </li>
            <li>
              <NavLink to="/courses" className={({ isActive }) => (isActive ? "active-link" : "")}>
                الكورسات
              </NavLink>
            </li>
            <li>
              <NavLink to="/articles" className={({ isActive }) => (isActive ? "active-link" : "")}>
                المقالات
              </NavLink>
            </li>
            <li>
              <NavLink to="/sessions" className={({ isActive }) => (isActive ? "active-link" : "")}>
                حجز جلسة
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? "active-link" : "")}>
                عنّا
              </NavLink>
            </li>

            {!loading && user?.role === "admin" ? (
              <li>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? "active-link" : "")}>
                  لوحة الإدارة
                </NavLink>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="header-buttons">
          {loading ? null : user ? (
            <>
              <span style={{ marginInline: "10px", opacity: 0.9 }}>
                أهلاً، {user.username}
              </span>
              <button
                className="btn-login"
                style={{ border: "none", cursor: "pointer" }}
                onClick={() => logout()}
                type="button"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="btn-login" style={{ marginInlineStart: 10 }}>
                إنشاء حساب
              </Link>
            </>
          )}

          <div className="heart-icon">♥</div>
        </div>
      </div>
    </header>
  );
}
