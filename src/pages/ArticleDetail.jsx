import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";

export default function ArticleDetail() {
  const { articleId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getArticle(articleId);
        if (alive) setItem(res.item);
      } catch (e) {
        if (alive) setError(e?.message || "NOT_FOUND");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [articleId]);

  return (
    <>
      <Header />
      <section className="content-section" style={{ paddingTop: 120 }}>
        <div className="services-container" style={{ maxWidth: 900 }}>
          <Link to="/articles" className="view-all" style={{ display: "inline-block", marginBottom: 16 }}>
            ← رجوع للمقالات
          </Link>

          {loading ? (
            <div style={{ opacity: 0.8 }}>جارٍ تحميل المقال...</div>
          ) : error ? (
            <div style={{ opacity: 0.9 }}>المقال غير موجود.</div>
          ) : (
            <>
              <h2 className="section-title" style={{ marginBottom: 8, textAlign: "right" }}>
                {item.title}
              </h2>
              <div style={{ textAlign: "right", opacity: 0.85, marginBottom: 18 }}>
                <span>{item.created_at || ""}</span>
                {item.author ? (
                  <>
                    <span> • </span>
                    <span>{item.author}</span>
                  </>
                ) : null}
              </div>
              {item.image ? (
                <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 18 }}>
                  <img src={item.image} alt={item.title} style={{ width: "100%", display: "block" }} />
                </div>
              ) : null}
              <div style={{ textAlign: "right", lineHeight: 2, fontSize: 18, whiteSpace: "pre-wrap" }}>
                {item.content}
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
