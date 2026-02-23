import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";

function toEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    }
  } catch {
    // ignore
  }
  return url;
}

export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getLesson(courseId, lessonId);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e?.message || "ERROR");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [courseId, lessonId]);

  const embed = useMemo(() => toEmbedUrl(data?.lesson?.content), [data]);

  return (
    <>
      <Header />
      <section className="content-section" style={{ paddingTop: 120 }}>
        <div className="services-container" style={{ maxWidth: 980 }}>
          <Link to={`/courses/${courseId}`} className="view-all" style={{ display: "inline-block", marginBottom: 16 }}>
            ← رجوع للكورس
          </Link>

          {loading ? (
            <div style={{ opacity: 0.8 }}>جارٍ تحميل الدرس...</div>
          ) : error ? (
            <div style={{ opacity: 0.9, textAlign: "right" }}>
              {error === "ENROLL_REQUIRED"
                ? "لازم تكون مسجّل في الكورس عشان تفتح الدرس ده."
                : "الدرس غير متاح."}
            </div>
          ) : (
            <>
              <div style={{ textAlign: "right", marginBottom: 10, opacity: 0.85 }}>
                <div>{data.lesson.course_title}</div>
                <div>{data.lesson.section_title}</div>
              </div>

              <h2 className="section-title" style={{ textAlign: "right", marginBottom: 14 }}>
                {data.lesson.lesson_title}
              </h2>

              <article className="media-card" style={{ padding: 18 }}>
                {data.lesson.content_type === "video" ? (
                  <div style={{ borderRadius: 16, overflow: "hidden" }}>
                    <iframe
                      title="lesson-video"
                      src={embed}
                      style={{ width: "100%", height: 480, border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : data.lesson.content_type === "link" ? (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 10 }}>رابط الدرس:</div>
                    <a href={data.lesson.content} target="_blank" rel="noreferrer">
                      {data.lesson.content}
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: "right", whiteSpace: "pre-wrap", lineHeight: 2, fontSize: 18 }}>
                    {data.lesson.content || ""}
                  </div>
                )}

                {data.lesson.notes ? (
                  <div style={{ marginTop: 16, textAlign: "right", opacity: 0.95 }}>
                    <h3 style={{ marginBottom: 8 }}>ملاحظات</h3>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 2 }}>{data.lesson.notes}</div>
                  </div>
                ) : null}
              </article>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
