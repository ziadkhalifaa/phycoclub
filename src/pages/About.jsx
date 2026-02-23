import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <Header />
      <section className="content-section" style={{ paddingTop: 120 }}>
        <div className="services-container">
          <div className="section-top" style={{ marginBottom: 18 }}>
            <div>
              <div className="section-subtitle">جمعية قيم</div>
              <h2 className="section-title">من نحن</h2>
            </div>
          </div>

          <div style={{ textAlign: "right", lineHeight: 1.9, fontSize: 18 }}>
            <p style={{ marginBottom: 14 }}>
              جمعية قيم هي جمعية متخصصة في تدريب وتطوير المختصين النفسيين وتقديم أفضل خدمات
              الصحة النفسية. نسعى لتوفير بيئة تعليمية احترافية لدعم المعالجين والمرضى على حد
              سواء من خلال برامج تدريبية، مقالات متخصصة، وجلسات استشارية آمنة.
            </p>
            <p style={{ marginBottom: 22 }}>
              رسالتنا هي تعزيز الصحة النفسية ورفع كفاءة المختصين، لضمان تقديم رعاية ذات جودة
              عالية لجميع الأفراد والمجتمع.
            </p>

            <h3 style={{ marginBottom: 12 }}>فريقنا</h3>
            <div className="cards-grid" style={{ marginBottom: 24 }}>
              {[
                { name: "د. أحمد محمود", role: "أخصائي علاج معرفي سلوكي" },
                { name: "د. سارة أحمد", role: "أخصائية اضطرابات القلق والاكتئاب" },
                { name: "د. محمد علي", role: "أخصائي العلاج الأسري والزوجي" },
                { name: "د. نور حسن", role: "أخصائية العلاج النفسي للأطفال" },
              ].map((m) => (
                <article key={m.name} className="media-card" style={{ padding: 18 }}>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>👤</div>
                  <h3 className="media-title" style={{ marginBottom: 6 }}>
                    {m.name}
                  </h3>
                  <p className="media-desc">{m.role}</p>
                </article>
              ))}
            </div>

            <h3 style={{ marginBottom: 12 }}>رؤيتنا ومهمتنا</h3>
            <p>
              رؤيتنا: بناء مجتمع واعي بالصحة النفسية ومجهز بأفضل المختصين المؤهلين.
              <br />
              مهمتنا: تطوير مهارات المختصين النفسيين وتقديم الدعم المستمر للمستفيدين من
              خدمات الصحة النفسية.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
