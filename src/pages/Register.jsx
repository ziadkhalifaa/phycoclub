import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";

export default function Register() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register({ username, email, password, confirm });
      nav("/login");
    } catch (err) {
      const msg = err?.message;
      if (msg === "PASSWORD_MISMATCH") setError("كلمة المرور غير متطابقة");
      else if (msg === "USER_OR_EMAIL_EXISTS") setError("اليوزر أو الإيميل موجود بالفعل");
      else setError("حصلت مشكلة. جرّب تاني.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <section className="content-section alt" style={{ paddingTop: 120 }}>
        <div className="services-container" style={{ maxWidth: 560 }}>
          <div className="section-top" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-subtitle">الحساب</div>
              <h2 className="section-title">إنشاء حساب</h2>
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ textAlign: "right" }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>اسم المستخدم</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: soheila"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%" }}
              />
            </div>

            {error ? (
              <div style={{ marginTop: 10, color: "#b42318" }}>{error}</div>
            ) : null}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: 14, opacity: loading ? 0.8 : 1 }}
              disabled={loading}
            >
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
            </button>

            <div style={{ marginTop: 14, opacity: 0.9 }}>
              عندك حساب؟ <Link to="/login">سجّل دخول</Link>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
