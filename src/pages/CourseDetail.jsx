import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getCourse(courseId);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e?.message || "NOT_FOUND");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [courseId]);

  const lessonsCount = useMemo(() => {
    if (!data?.sections) return 0;
    return data.sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  }, [data]);

  async function enroll() {
    setEnrolling(true);
    try {
      await api.enroll(courseId);
      const res = await api.getCourse(courseId);
      setData(res);
    } catch (e) {
      if (e?.message === "AUTH_REQUIRED") alert("لازم تسجل دخول الأول");
      else if (e?.message === "PAID_COURSE") alert("الكورس مدفوع — الدفع مش متفعل حاليًا");
      else alert("حصلت مشكلة. جرّب تاني.");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <>
      <Header />
      <section className="content-section" style={{ paddingTop: 120 }}>
        <div className="services-container" style={{ maxWidth: 980 }}>
          <Link to="/courses" className="view-all" style={{ display: "inline-block", marginBottom: 16 }}>
            ← رجوع للكورسات
          </Link>

          {loading ? (
            <div style={{ opacity: 0.8 }}>جارٍ تحميل الكورس...</div>
          ) : error ? (
            <div style={{ opacity: 0.9 }}>الكورس غير موجود.</div>
          ) : (
            <>
              <div className="cards-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
                <article className="media-card" style={{ padding: 0, overflow: "hidden" }}>
                  {data.course.thumbnail ? (
                    <div className="media-cover" style={{ height: 240 }}>
                      <img src={data.course.thumbnail} alt={data.course.title} />
                      <span className={data.course.type === "free" ? "badge light" : "badge"}>
                        {data.course.type === "free" ? "مجاني" : `ج.م ${data.course.price}`}
                      </span>
                    </div>
                  ) : null}

                  <div className="media-body" style={{ textAlign: "right" }}>
                    <h2 className="section-title" style={{ marginBottom: 10 }}>
                      {data.course.title}
                    </h2>
                    <p className="media-desc" style={{ fontSize: 18, lineHeight: 1.9 }}>
                      {data.course.description || data.course.short_description || ""}
                    </p>
                  </div>
                </article>

                <article className="media-card" style={{ padding: 18, textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span className="pill">{data.course.instructor || "مدرب"}</span>
                    <span className="pill level">{data.course.duration || ""}</span>
                    <span className="pill">{lessonsCount} درس</span>
                  </div>

                  <div style={{ marginTop: 16, opacity: 0.9, lineHeight: 1.9 }}>
                    {data.course.type === "free" ? (
                      <div>الكورس مجاني ويمكن التسجيل فورًا.</div>
                    ) : (
                      <div>الكورس مدفوع. الدفع غير مُفعّل حاليًا.</div>
                    )}
                  </div>

                  {data.course.type === "free" ? (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ width: "100%", marginTop: 16, opacity: enrolling ? 0.85 : 1 }}
                      disabled={enrolling || data.is_enrolled}
                      onClick={enroll}
                    >
                      {data.is_enrolled ? "أنت مسجّل بالفعل ✅" : enrolling ? "جارٍ التسجيل..." : "سجّل في الكورس"}
                    </button>
                  ) : null}

                  {!user ? (
                    <div style={{ marginTop: 12, opacity: 0.85 }}>
                      <Link to="/login">سجّل دخول</Link> عشان تقدر تفتح الدروس.
                    </div>
                  ) : null}
                </article>
              </div>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <h3 style={{ marginBottom: 12 }}>محتوى الكورس</h3>
                {data.sections?.length ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {data.sections.map((s) => (
                      <article key={s.id} className="media-card" style={{ padding: 16 }}>
                        <h4 style={{ margin: 0, marginBottom: 10 }}>{s.title}</h4>
                        <div style={{ display: "grid", gap: 8 }}>
                          {(s.lessons || []).map((l) => {
                            const locked = !data.is_enrolled && !l.is_free_preview;
                            return (
                              <div
                                key={l.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "10px 12px",
                                  borderRadius: 12,
                                  background: "rgba(255,255,255,0.55)",
                                }}
                              >
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                  <span style={{ opacity: 0.9 }}>{locked ? "🔒" : "▶"}</span>
                                  {locked ? (
                                    <span>{l.title}</span>
                                  ) : (
                                    <Link to={`/courses/${courseId}/lesson/${l.id}`} style={{ textDecoration: "none" }}>
                                      {l.title}
                                    </Link>
                                  )}
                                </div>
                                {l.is_free_preview ? <span className="badge light">Preview</span> : null}
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div style={{ opacity: 0.8 }}>لسه مفيش أجزاء/دروس للكورس ده.</div>
                )}
              </div>

              {(data.features?.length || data.faq?.length) ? (
                <div style={{ marginTop: 26, textAlign: "right" }}>
                  {data.features?.length ? (
                    <>
                      <h3 style={{ marginBottom: 10 }}>مميزات الكورس</h3>
                      <ul style={{ lineHeight: 2 }}>
                        {data.features.map((f) => (
                          <li key={f.id}>{f.text}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {data.faq?.length ? (
                    <>
                      <h3 style={{ marginTop: 18, marginBottom: 10 }}>أسئلة شائعة</h3>
                      <div style={{ display: "grid", gap: 12 }}>
                        {data.faq.map((q) => (
                          <article key={q.id} className="media-card" style={{ padding: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>{q.question}</div>
                            <div style={{ opacity: 0.95, lineHeight: 1.9 }}>{q.answer}</div>
                          </article>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
