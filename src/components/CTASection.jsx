import React from "react";

class CTASection extends React.Component {
  render() {
    return (
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-tag">✨ ابدأ رحلتك الآن</div>
          <h2>
            هل أنت مستعد لتطوير مهاراتك
            <br />
            في مجال الصحة النفسية؟
          </h2>
          <p>
            انضم إلى مجتمع من المختصين النفسيين واحصل على أفضل التدريبات والدعم
            المستمر
          </p>
          <div className="cta-buttons">
            <a href="#courses" className="btn-white">
              <span>تصفح الكورسات</span>
              <span>←</span>
            </a>
            <a href="#sessions" className="btn-outline">
              احجز جلسة
            </a>
          </div>
        </div>
      </section>
    );
  }
}

export default CTASection;
