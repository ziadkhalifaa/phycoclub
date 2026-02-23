import { useMemo, useState } from "react";

export default function SessionsSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [datetime, setDatetime] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("visa");
  const [done, setDone] = useState(false);

  const specialists = useMemo(
    () => [
      "د. أحمد محمود - علاج معرفي سلوكي",
      "د. سارة أحمد - اضطرابات القلق والاكتئاب",
      "د. محمد علي - علاج أسري وزوجي",
      "د. نور حسن - علاج نفسي للأطفال",
    ],
    []
  );

  function submit(e) {
    e.preventDefault();
    setDone(true);
    // (اختياري) تقدر بعدين تربط ده ب API لو حبيت تحفظ الحجوزات.
  }

  return (
    <section className="content-section" id="sessions" style={{ paddingTop: 110 }}>
      <div className="services-container">
        <div className="section-top" style={{ marginBottom: 18 }}>
          <div>
            <div className="section-subtitle">الجلسات</div>
            <h2 className="section-title">احجز جلستك الآن</h2>
          </div>
        </div>

        <div className="cards-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <article className="media-card" style={{ padding: 18, textAlign: "right" }}>
            <h3 className="media-title" style={{ marginBottom: 10 }}>
              جلسات استشارية مع أفضل المختصين
            </h3>
            <p className="media-desc" style={{ lineHeight: 1.9, fontSize: 18 }}>
              نوفر لك جلسات أونلاين مع نخبة من المختصين النفسيين المعتمدين.
              اختر المختص والوقت المناسب واحصل على دعم مهني في بيئة آمنة وسرّية.
            </p>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              {[
                "جلسات أونلاين بسهولة",
                "سرّية تامة وخصوصية",
                "مختصين معتمدين",
                "مرونة في المواعيد",
              ].map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ opacity: 0.9 }}>✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="media-card" style={{ padding: 18, textAlign: "right" }}>
            <h3 className="media-title" style={{ marginBottom: 12 }}>بيانات الحجز</h3>

            <form onSubmit={submit}>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>الاسم الكامل</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>البريد الإلكتروني</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>رقم الهاتف</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>اختر المختص</label>
                  <select
                    required
                    value={specialist}
                    onChange={(e) => setSpecialist(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="">اختر المختص المناسب</option>
                    {specialists.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>تاريخ ووقت الجلسة المفضل</label>
                  <input
                    required
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>ملاحظات إضافية (اختياري)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات تود إضافتها"
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>طريقة الدفع</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { key: "visa", label: "فيزا", icon: "💳" },
                    { key: "mastercard", label: "ماستر كارد", icon: "💳" },
                    { key: "fawry", label: "فوري", icon: "📱" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPayment(p.key)}
                      className="btn-secondary"
                      style={{
                        padding: "10px 12px",
                        border: payment === p.key ? "2px solid var(--primary)" : "2px solid transparent",
                      }}
                    >
                      <span style={{ marginInlineEnd: 8 }}>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 16 }}>
                تأكيد الحجز - 300 ج.م
              </button>

              {done ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#065f46",
                  }}
                >
                  ✓ تم الحجز بنجاح! سنتواصل معك قريباً
                </div>
              ) : null}
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}
