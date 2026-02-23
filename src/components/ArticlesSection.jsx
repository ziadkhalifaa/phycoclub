import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ArticlesSection({ limit = 3, title = "أحدث المقالات", showViewAll = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.listArticles(limit);
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
    <section className="content-section alt" id="articles">
      <div className="services-container">
        <div className="section-top">
          <div>
            <div className="section-subtitle">المدونة</div>
            <h2 className="section-title">{title}</h2>
          </div>
          {showViewAll ? (
            <Link className="view-all" to="/articles">
              عرض الكل <span>←</span>
            </Link>
          ) : null}
        </div>

        <div className="cards-grid">
          {loading ? (
            <div style={{ opacity: 0.8 }}>جارٍ تحميل المقالات...</div>
          ) : items.length ? (
            items.map((a) => (
              <article key={a.id} className="media-card">
                <div className="media-cover">
                  <img
                    src={
                      a.image ||
                      "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&w=1400&q=80"
                    }
                    alt={a.title}
                  />
                  <span className="badge light">مقال</span>
                </div>
                <div className="media-body">
                  <h3 className="media-title">
                    <Link to={`/articles/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {a.title}
                    </Link>
                  </h3>
                  <p className="media-desc">{a.excerpt || "—"}</p>
                  <div className="meta-row">
                    <div className="meta-left">
                      <span>{a.created_at || ""}</span>
                      {a.author ? (
                        <>
                          <span> • </span>
                          <span>{a.author}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={{ opacity: 0.8 }}>مفيش مقالات لسه. (الأدمن يقدر يضيف من الباك إند)</div>
          )}
        </div>
      </div>
    </section>
  );
}
