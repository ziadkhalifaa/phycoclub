import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function CoursesSection({ limit = 3, title = "أحدث الكورسات", showViewAll = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.listCourses(limit);
        if (alive) setItems(res.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [limit]);

  return (
    <section className="content-section alt" id="courses">
      <div className="services-container">
        <div className="section-top">
          <div>
            <div className="section-subtitle">التعلم</div>
            <h2 className="section-title">{title}</h2>
          </div>
          {showViewAll ? (
            <Link className="view-all" to="/courses">
              عرض الكل <span>←</span>
            </Link>
          ) : null}
        </div>

        <div className="cards-grid">
          {loading ? (
            <div style={{ opacity: 0.8 }}>جارٍ تحميل الكورسات...</div>
          ) : items.length ? (
            items.map((c) => (
              <article key={c.id} className="media-card">
                <div className="media-cover">
                  <img
                    src={
                      c.thumbnail ||
                      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80"
                    }
                    alt={c.title}
                  />
                  <span className={c.type === "free" ? "badge light" : "badge"}>
                    {c.type === "free" ? "مجاني" : `ج.م ${c.price}`}
                  </span>
                </div>
                <div className="media-body">
                  <div className="pill-row">
                    {c.instructor ? <span className="pill">{c.instructor}</span> : null}
                    {c.duration ? <span className="pill level">{c.duration}</span> : null}
                  </div>
                  <h3 className="media-title">
                    <Link to={`/courses/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {c.title}
                    </Link>
                  </h3>
                  <p className="media-desc">{c.short_description || "—"}</p>
                </div>
              </article>
            ))
          ) : (
            <div style={{ opacity: 0.8 }}>مفيش كورسات لسه. (الأدمن يقدر يضيف من الباك إند)</div>
          )}
        </div>
      </div>
    </section>
  );
}
