import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

function splitLines(text) {
  return (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFaq(text) {
  // Format: سؤال | إجابة (each line)
  return splitLines(text)
    .map((line) => {
      const [q, ...rest] = line.split("|");
      const a = rest.join("|");
      return { question: (q || "").trim(), answer: (a || "").trim() };
    })
    .filter((x) => x.question && x.answer);
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("courses");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Lists
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);

  // Selection
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  // Course form
  const [cTitle, setCTitle] = useState("");
  const [cShort, setCShort] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cType, setCType] = useState("free");
  const [cPrice, setCPrice] = useState("0");
  const [cInstructor, setCInstructor] = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cThumb, setCThumb] = useState("");
  const [cFeatures, setCFeatures] = useState("");
  const [cFaq, setCFaq] = useState("");

  // Manage sections/lessons
  const [courseDetail, setCourseDetail] = useState(null);
  const [secTitle, setSecTitle] = useState("");
  const [lessonSectionId, setLessonSectionId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("text");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonNotes, setLessonNotes] = useState("");
  const [lessonFree, setLessonFree] = useState(false);

  // Article form
  const [aTitle, setATitle] = useState("");
  const [aImage, setAImage] = useState("");
  const [aContent, setAContent] = useState("");

  const canUse = !loading && user?.role === "admin";

  async function refreshLists() {
    setErr("");
    setMsg("");
    try {
      const [cRes, aRes] = await Promise.all([api.listCourses(), api.listArticles()]);
      setCourses(cRes.items || []);
      setArticles(aRes.items || []);
    } catch (e) {
      setErr("حصلت مشكلة في تحميل البيانات.");
    }
  }

  async function refreshUsers() {
    try {
      const res = await api.adminListUsers();
      setUsers(res.items || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!canUse) return;
    refreshLists();
    refreshUsers();
  }, [canUse]);

  // Load selected course details
  useEffect(() => {
    if (!canUse) return;
    if (!selectedCourseId) {
      setCourseDetail(null);
      return;
    }
    (async () => {
      try {
        const res = await api.getCourse(selectedCourseId);
        setCourseDetail(res);
        // set defaults for lesson creation
        const firstSection = res.sections?.[0];
        setLessonSectionId(firstSection?.id ? String(firstSection.id) : "");
      } catch {
        setCourseDetail(null);
      }
    })();
  }, [selectedCourseId, canUse]);

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(selectedCourseId)) || null,
    [courses, selectedCourseId]
  );

  const selectedArticle = useMemo(
    () => articles.find((a) => String(a.id) === String(selectedArticleId)) || null,
    [articles, selectedArticleId]
  );

  function fillCourseFormFrom(course) {
    if (!course) return;
    setCTitle(course.title || "");
    setCShort(course.short_description || "");
    setCDesc(course.description || "");
    setCType(course.type || "free");
    setCPrice(String(course.price ?? 0));
    setCInstructor(course.instructor || "");
    setCDuration(course.duration || "");
    setCThumb(course.thumbnail || "");
    setCFeatures((courseDetail?.features || []).map((x) => x.text).filter(Boolean).join("\n"));
    setCFaq(
      (courseDetail?.faq || [])
        .map((x) => `${x.question} | ${x.answer}`)
        .filter(Boolean)
        .join("\n")
    );
  }

  async function onCreateCourse(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const payload = {
        title: cTitle,
        short_description: cShort,
        description: cDesc,
        type: cType,
        price: cPrice,
        instructor: cInstructor,
        duration: cDuration,
        thumbnail: cThumb,
        features: splitLines(cFeatures),
        faq: parseFaq(cFaq),
      };
      const res = await api.createCourse(payload);
      setMsg("تم إضافة الكورس.");
      await refreshLists();
      setSelectedCourseId(String(res.id));
    } catch (e2) {
      setErr(e2?.message === "ADMIN_REQUIRED" ? "لازم تكون Admin." : "فشل إضافة الكورس.");
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateCourse(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const payload = {
        title: cTitle,
        short_description: cShort,
        description: cDesc,
        type: cType,
        price: cPrice,
        instructor: cInstructor,
        duration: cDuration,
        thumbnail: cThumb,
        features: splitLines(cFeatures),
        faq: parseFaq(cFaq),
      };
      await api.updateCourse(selectedCourseId, payload);
      setMsg("تم تحديث الكورس.");
      await refreshLists();
      // refresh details
      const res = await api.getCourse(selectedCourseId);
      setCourseDetail(res);
    } catch {
      setErr("فشل تحديث الكورس.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCourse() {
    if (!selectedCourseId) return;
    if (!confirm("متأكد إنك عايز تحذف الكورس؟")) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.deleteCourse(selectedCourseId);
      setMsg("تم حذف الكورس.");
      setSelectedCourseId(null);
      setCourseDetail(null);
      await refreshLists();
    } catch {
      setErr("فشل حذف الكورس.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateSection(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.createSection(selectedCourseId, { title: secTitle, sort_order: 0 });
      setSecTitle("");
      setMsg("تم إضافة القسم.");
      const res = await api.getCourse(selectedCourseId);
      setCourseDetail(res);
      const first = res.sections?.[0];
      if (!lessonSectionId && first?.id) setLessonSectionId(String(first.id));
    } catch {
      setErr("فشل إضافة القسم.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteSection(sectionId) {
    if (!selectedCourseId) return;
    if (!confirm("حذف القسم سيحذف الدروس داخله. متأكد؟")) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.deleteSection(selectedCourseId, sectionId);
      setMsg("تم حذف القسم.");
      const res = await api.getCourse(selectedCourseId);
      setCourseDetail(res);
    } catch {
      setErr("فشل حذف القسم.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateLesson(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.createLesson(selectedCourseId, {
        section_id: lessonSectionId,
        title: lessonTitle,
        content_type: lessonType,
        content: lessonContent,
        notes: lessonNotes,
        sort_order: 0,
        is_free_preview: lessonFree,
      });
      setLessonTitle("");
      setLessonContent("");
      setLessonNotes("");
      setLessonFree(false);
      setMsg("تم إضافة الدرس.");
      const res = await api.getCourse(selectedCourseId);
      setCourseDetail(res);
    } catch {
      setErr("فشل إضافة الدرس.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteLesson(lessonId) {
    if (!selectedCourseId) return;
    if (!confirm("متأكد إنك عايز تحذف الدرس؟")) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.deleteLesson(selectedCourseId, lessonId);
      setMsg("تم حذف الدرس.");
      const res = await api.getCourse(selectedCourseId);
      setCourseDetail(res);
    } catch {
      setErr("فشل حذف الدرس.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateArticle(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await api.createArticle({ title: aTitle, image: aImage, content: aContent });
      setMsg("تم إضافة المقال.");
      setATitle("");
      setAImage("");
      setAContent("");
      await refreshLists();
      setSelectedArticleId(String(res.id));
    } catch {
      setErr("فشل إضافة المقال.");
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateArticle(e) {
    e.preventDefault();
    if (!selectedArticleId) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.updateArticle(selectedArticleId, { title: aTitle, image: aImage, content: aContent });
      setMsg("تم تحديث المقال.");
      await refreshLists();
    } catch {
      setErr("فشل تحديث المقال.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteArticle() {
    if (!selectedArticleId) return;
    if (!confirm("متأكد إنك عايز تحذف المقال؟")) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.deleteArticle(selectedArticleId);
      setMsg("تم حذف المقال.");
      setSelectedArticleId(null);
      setATitle("");
      setAImage("");
      setAContent("");
      await refreshLists();
    } catch {
      setErr("فشل حذف المقال.");
    } finally {
      setBusy(false);
    }
  }

  async function onChangeRole(userId, role) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await api.adminSetRole(userId, role);
      setMsg("تم تحديث الصلاحيات.");
      await refreshUsers();
    } catch (e) {
      setErr(e?.message === "CANNOT_DEMOTE_SELF" ? "مينفعش تنزل نفسك من Admin." : "فشل تحديث الصلاحيات.");
    } finally {
      setBusy(false);
    }
  }

  // Auto-fill forms when selecting
  useEffect(() => {
    if (!selectedCourseId) return;
    // Load full details (includes features/faq)
    (async () => {
      try {
        const res = await api.getCourse(selectedCourseId);
        setCourseDetail(res);
        fillCourseFormFrom(res.course);
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedArticleId) return;
    (async () => {
      try {
        const res = await api.getArticle(selectedArticleId);
        const item = res.item;
        setATitle(item.title || "");
        setAImage(item.image || "");
        setAContent(item.content || "");
      } catch {
        // ignore
      }
    })();
  }, [selectedArticleId]);

  return (
    <>
      <Header />
      <section className="content-section alt" style={{ paddingTop: 120 }}>
        <div className="services-container">
          <div className="section-top" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-subtitle">الإدارة</div>
              <h2 className="section-title">لوحة الإدارة</h2>
            </div>
          </div>

          {loading ? (
            <div style={{ opacity: 0.9 }}>جارٍ التحميل...</div>
          ) : !user ? (
            <div style={{ textAlign: "right" }}>
              لازم تسجل دخول الأول. <Link to="/login">تسجيل الدخول</Link>
            </div>
          ) : user.role !== "admin" ? (
            <div style={{ textAlign: "right" }}>
              مفيش صلاحية Admin للحساب ده.
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <button
                  type="button"
                  className={tab === "courses" ? "btn-primary" : "btn-outline"}
                  onClick={() => setTab("courses")}
                  disabled={busy}
                >
                  الكورسات
                </button>
                <button
                  type="button"
                  className={tab === "articles" ? "btn-primary" : "btn-outline"}
                  onClick={() => setTab("articles")}
                  disabled={busy}
                >
                  المقالات
                </button>
                <button
                  type="button"
                  className={tab === "users" ? "btn-primary" : "btn-outline"}
                  onClick={() => setTab("users")}
                  disabled={busy}
                >
                  الصلاحيات
                </button>
              </div>

              {err ? <div style={{ marginBottom: 10, color: "#b42318" }}>{err}</div> : null}
              {msg ? <div style={{ marginBottom: 10, color: "#067647" }}>{msg}</div> : null}

              {tab === "courses" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
                  <div style={{ textAlign: "right" }}>
                    <label style={{ display: "block", marginBottom: 6 }}>اختار كورس للتعديل</label>
                    <select
                      value={selectedCourseId || ""}
                      onChange={(e) => setSelectedCourseId(e.target.value || null)}
                      style={{ width: "100%" }}
                    >
                      <option value="">— إنشاء كورس جديد —</option>
                      {(courses || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.id} — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <form onSubmit={selectedCourseId ? onUpdateCourse : onCreateCourse} style={{ textAlign: "right" }}>
                    <div style={{ display: "grid", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>عنوان الكورس</label>
                        <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} required style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>وصف قصير</label>
                        <input value={cShort} onChange={(e) => setCShort(e.target.value)} style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>الوصف الكامل</label>
                        <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={5} style={{ width: "100%" }} />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 6 }}>النوع</label>
                          <select value={cType} onChange={(e) => setCType(e.target.value)} style={{ width: "100%" }}>
                            <option value="free">مجاني</option>
                            <option value="paid">مدفوع</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 6 }}>السعر (لو مدفوع)</label>
                          <input value={cPrice} onChange={(e) => setCPrice(e.target.value)} style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 6 }}>المدرب</label>
                          <input value={cInstructor} onChange={(e) => setCInstructor(e.target.value)} style={{ width: "100%" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 6 }}>المدة</label>
                          <input value={cDuration} onChange={(e) => setCDuration(e.target.value)} style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>صورة/Thumbnail (رابط)</label>
                        <input value={cThumb} onChange={(e) => setCThumb(e.target.value)} style={{ width: "100%" }} />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>المميزات (كل سطر ميزة)</label>
                        <textarea value={cFeatures} onChange={(e) => setCFeatures(e.target.value)} rows={4} style={{ width: "100%" }} />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>FAQ (كل سطر: سؤال | إجابة)</label>
                        <textarea value={cFaq} onChange={(e) => setCFaq(e.target.value)} rows={4} style={{ width: "100%" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                      <button type="submit" className="btn-primary" disabled={busy}>
                        {selectedCourseId ? "تحديث الكورس" : "إضافة كورس"}
                      </button>
                      {selectedCourseId ? (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={onDeleteCourse}
                          disabled={busy}
                          style={{ borderColor: "#b42318", color: "#b42318" }}
                        >
                          حذف الكورس
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => {
                          setSelectedCourseId(null);
                          setCourseDetail(null);
                          setCTitle("");
                          setCShort("");
                          setCDesc("");
                          setCType("free");
                          setCPrice("0");
                          setCInstructor("");
                          setCDuration("");
                          setCThumb("");
                          setCFeatures("");
                          setCFaq("");
                        }}
                        disabled={busy}
                      >
                        تفريغ
                      </button>
                    </div>
                  </form>

                  {selectedCourseId ? (
                    <div style={{ textAlign: "right" }}>
                      <div className="section-top" style={{ marginBottom: 10 }}>
                        <div>
                          <div className="section-subtitle">محتوى الكورس</div>
                          <h3 className="section-title" style={{ fontSize: 22 }}>
                            الأقسام والدروس
                          </h3>
                        </div>
                      </div>

                      <form onSubmit={onCreateSection} style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>إضافة قسم جديد</label>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <input
                            value={secTitle}
                            onChange={(e) => setSecTitle(e.target.value)}
                            placeholder="عنوان القسم"
                            style={{ flex: 1, minWidth: 220 }}
                            required
                          />
                          <button type="submit" className="btn-primary" disabled={busy}>
                            إضافة
                          </button>
                        </div>
                      </form>

                      <form onSubmit={onCreateLesson} style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>إضافة درس</label>
                        <div style={{ display: "grid", gap: 10 }}>
                          <select value={lessonSectionId} onChange={(e) => setLessonSectionId(e.target.value)} style={{ width: "100%" }}>
                            <option value="">اختر القسم</option>
                            {(courseDetail?.sections || []).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                          <input
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            placeholder="عنوان الدرس"
                            required
                            style={{ width: "100%" }}
                          />
                          <select value={lessonType} onChange={(e) => setLessonType(e.target.value)} style={{ width: "100%" }}>
                            <option value="text">نص</option>
                            <option value="video">فيديو (رابط)</option>
                            <option value="link">رابط</option>
                          </select>
                          <textarea
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                            rows={4}
                            placeholder={lessonType === "text" ? "محتوى الدرس" : "ضع الرابط هنا"}
                            style={{ width: "100%" }}
                          />
                          <textarea
                            value={lessonNotes}
                            onChange={(e) => setLessonNotes(e.target.value)}
                            rows={3}
                            placeholder="ملاحظات (اختياري)"
                            style={{ width: "100%" }}
                          />
                          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="checkbox" checked={lessonFree} onChange={(e) => setLessonFree(e.target.checked)} />
                            <span>Preview مجاني</span>
                          </label>
                          <button type="submit" className="btn-primary" disabled={busy || !lessonSectionId}>
                            إضافة الدرس
                          </button>
                        </div>
                      </form>

                      <div style={{ display: "grid", gap: 12 }}>
                        {(courseDetail?.sections || []).map((s) => (
                          <div key={s.id} style={{ border: "1px solid rgba(0,0,0,.08)", borderRadius: 14, padding: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 700 }}>{s.title}</div>
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => onDeleteSection(s.id)}
                                disabled={busy}
                                style={{ borderColor: "#b42318", color: "#b42318" }}
                              >
                                حذف القسم
                              </button>
                            </div>

                            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                              {(s.lessons || []).length ? (
                                (s.lessons || []).map((l) => (
                                  <div
                                    key={l.id}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: 10,
                                      alignItems: "center",
                                      padding: "10px 12px",
                                      borderRadius: 12,
                                      background: "rgba(15,160,133,.06)",
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{l.title}</div>
                                      <div style={{ fontSize: 13, opacity: 0.75 }}>
                                        #{l.id} {l.is_free_preview ? "• Preview" : ""}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn-outline"
                                      onClick={() => onDeleteLesson(l.id)}
                                      disabled={busy}
                                      style={{ borderColor: "#b42318", color: "#b42318" }}
                                    >
                                      حذف
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div style={{ opacity: 0.75 }}>مفيش دروس لسه.</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === "articles" ? (
                <div style={{ display: "grid", gap: 16, textAlign: "right" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6 }}>اختار مقال للتعديل</label>
                    <select
                      value={selectedArticleId || ""}
                      onChange={(e) => setSelectedArticleId(e.target.value || null)}
                      style={{ width: "100%" }}
                    >
                      <option value="">— إنشاء مقال جديد —</option>
                      {(articles || []).map((a) => (
                        <option key={a.id} value={a.id}>
                          #{a.id} — {a.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <form onSubmit={selectedArticleId ? onUpdateArticle : onCreateArticle}>
                    <div style={{ display: "grid", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>عنوان المقال</label>
                        <input value={aTitle} onChange={(e) => setATitle(e.target.value)} required style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>الصورة (رابط)</label>
                        <input value={aImage} onChange={(e) => setAImage(e.target.value)} style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6 }}>المحتوى</label>
                        <textarea value={aContent} onChange={(e) => setAContent(e.target.value)} rows={8} style={{ width: "100%" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                      <button type="submit" className="btn-primary" disabled={busy}>
                        {selectedArticleId ? "تحديث المقال" : "إضافة مقال"}
                      </button>
                      {selectedArticleId ? (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={onDeleteArticle}
                          disabled={busy}
                          style={{ borderColor: "#b42318", color: "#b42318" }}
                        >
                          حذف المقال
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => {
                          setSelectedArticleId(null);
                          setATitle("");
                          setAImage("");
                          setAContent("");
                        }}
                        disabled={busy}
                      >
                        تفريغ
                      </button>
                    </div>
                  </form>

                  {selectedArticle ? (
                    <div style={{ opacity: 0.85, fontSize: 13 }}>
                      تقدر تشوف المقال من هنا: <Link to={`/articles/${selectedArticle.id}`}>فتح المقال</Link>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === "users" ? (
                <div style={{ textAlign: "right" }}>
                  <div style={{ opacity: 0.9, marginBottom: 10 }}>
                    إدارة صلاحيات المستخدمين (User / Admin).
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(users || []).map((u) => (
                      <div
                        key={u.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          padding: "12px 14px",
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,.08)",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {u.username} <span style={{ opacity: 0.7, fontWeight: 400 }}>#{u.id}</span>
                          </div>
                          <div style={{ fontSize: 13, opacity: 0.75 }}>{u.email}</div>
                        </div>

                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <select
                            value={u.role}
                            onChange={(e) => onChangeRole(u.id, e.target.value)}
                            disabled={busy}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
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
