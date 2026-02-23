import React from "react";

class SpecialistsSection extends React.Component {
  render() {
    return (
      <section className="content-section" id="specialists">
        <div className="services-container">
          <div className="section-top">
            <div>
              <div className="section-subtitle">المتخصصون</div>
              <h2 className="section-title">أطباؤنا المتميزون</h2>
            </div>
            <a className="view-all" href="#specialists-all">
              عرض الكل <span>←</span>
            </a>
          </div>
          <div className="cards-grid">
            <article className="specialist-card">
              <div className="specialist-cover">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=80"
                  alt="\u062F. \u0645\u062D\u0645\u062F \u062D\u0633\u0646"
                />
                <span className="specialist-type">إرشاد نفسي</span>
              </div>
              <div className="specialist-body">
                <div className="specialist-name">د. محمد حسن</div>
                <div className="specialist-role">أخصائي الإرشاد النفسي</div>
                <div className="meta-row">
                  <div className="meta-left">
                    <span>8 سنوات خبرة</span>
                  </div>
                  <div className="meta-left">
                    <span className="star">★</span>
                    <span>4.7</span>
                  </div>
                </div>
                <div className="specialist-footer">
                  <div className="price">ج.م 300</div>
                  <a className="btn-book" href="#sessions">
                    <span>احجز الآن</span>
                    <span>📅</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="specialist-card">
              <div className="specialist-cover">
                <img
                  src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1400&q=80"
                  alt="\u062F. \u0633\u0627\u0631\u0629 \u0639\u0644\u064A"
                />
                <span className="specialist-type">علاج نفسي</span>
              </div>
              <div className="specialist-body">
                <div className="specialist-name">د. سارة علي</div>
                <div className="specialist-role">أخصائية العلاج النفسي</div>
                <div className="meta-row">
                  <div className="meta-left">
                    <span>10 سنوات خبرة</span>
                  </div>
                  <div className="meta-left">
                    <span className="star">★</span>
                    <span>4.8</span>
                  </div>
                </div>
                <div className="specialist-footer">
                  <div className="price">ج.م 400</div>
                  <a className="btn-book" href="#sessions">
                    <span>احجز الآن</span>
                    <span>📅</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="specialist-card">
              <div className="specialist-cover">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80"
                  alt="\u062F. \u0646\u0648\u0631\u0627 \u0627\u0644\u0623\u0645\u064A\u0631"
                />
                <span className="specialist-type">علاج أطفال</span>
              </div>
              <div className="specialist-body">
                <div className="specialist-name">د. نورا الأمير</div>
                <div className="specialist-role">أخصائية نفسية للأطفال</div>
                <div className="meta-row">
                  <div className="meta-left">
                    <span>12 سنوات خبرة</span>
                  </div>
                  <div className="meta-left">
                    <span className="star">★</span>
                    <span>4.9</span>
                  </div>
                </div>
                <div className="specialist-footer">
                  <div className="price">ج.م 450</div>
                  <a className="btn-book" href="#sessions">
                    <span>احجز الآن</span>
                    <span>📅</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="specialist-card">
              <div className="specialist-cover">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1400&q=80"
                  alt="\u062F. \u0623\u062D\u0645\u062F \u0645\u062D\u0645\u0648\u062F"
                />
                <span className="specialist-type">طب نفسي</span>
              </div>
              <div className="specialist-body">
                <div className="specialist-name">د. أحمد محمود</div>
                <div className="specialist-role">استشاري الطب النفسي</div>
                <div className="meta-row">
                  <div className="meta-left">
                    <span>15 سنوات خبرة</span>
                  </div>
                  <div className="meta-left">
                    <span className="star">★</span>
                    <span>4.9</span>
                  </div>
                </div>
                <div className="specialist-footer">
                  <div className="price">ج.م 500</div>
                  <a className="btn-book" href="#sessions">
                    <span>احجز الآن</span>
                    <span>📅</span>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    );
  }
}

export default SpecialistsSection;
