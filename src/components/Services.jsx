import React from "react";

class Services extends React.Component {
  render() {
    return (
      <section className="services" id="services">
        <div className="services-container">
          <div className="section-header">
            <div className="section-subtitle">خدماتنا</div>
            <h2 className="section-title">كل ما تحتاجه في مكان واحد</h2>
            <p className="section-description">
              نقدم مجموعة متكاملة من الخدمات لدعم رحلتك في مجال الصحة النفسية
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🎓</div>
              <h3>كورسات مجانية</h3>
              <p>
                محتوى تعليمي مجاني لتطوير المهارات الأساسية في العلاج النفسي
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">🎥</div>
              <h3>كورسات احترافية</h3>
              <p>برامج تدريبية متقدمة مع شهادات معتمدة من متخصصين عالميين</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>حجز جلسات</h3>
              <p>احجز جلسة أونلاين مع أفضل المتخصصين في الصحة النفسية</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📖</div>
              <h3>المقالات</h3>
              <p>مقالات علمية ونصائح عملية في مجال الصحة النفسية والعلاج</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Services;
