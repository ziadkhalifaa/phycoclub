import React from "react";

class Hero extends React.Component {
  render() {
    return (
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <span>♥</span>
              <span>جمعية قيم للصحة العقلية</span>
            </div>
            <h1>
              نبني معًا
              <br />
              <span className="highlight">صحة نفسية أفضل</span>
            </h1>
            <p className="hero-description">
              نساعد المختصين النفسيين على تطوير مهاراتهم المهنية من خلال برامج
              تدريبية متخصصة، ونقدم خدمات الدعم النفسي للأفراد الباحثين عن حياة
              أكثر توازنًا.
            </p>
            <div className="hero-buttons">
              <a href="#courses" className="btn-primary">
                <span>تصفح الكورسات</span>
                <span>←</span>
              </a>
              <a href="#sessions" className="btn-secondary">
                احجز جلسة
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">+500</div>
                <div className="stat-label">مختص مدرب</div>
              </div>
              <div className="stat">
                <div className="stat-number">+50</div>
                <div className="stat-label">دورة تدريبية</div>
              </div>
              <div className="stat">
                <div className="stat-number">+1000</div>
                <div className="stat-label">جلسة ناجحة</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop"
              alt="Mental Health Professional"
              className="main-image"
            />
            <div className="floating-card card-top-left">
              <div className="card-icon">📋</div>
              <div className="card-content">
                <h4>تسجيل الدخول</h4>
              </div>
            </div>
            <div className="floating-card card-top-right">
              <div className="card-icon">🧠</div>
              <div className="card-content">
                <h4>تطوير المهارات</h4>
                <p>برامج متعتمدة</p>
              </div>
            </div>
            <div className="floating-card card-bottom">
              <div className="card-icon">💬</div>
              <div className="card-content">
                <h4>دعم نفسي</h4>
                <p>جلسات أونلاين</p>
              </div>
            </div>
            <div
              className="floating-card"
              style={{
                bottom: "20%",
                right: "-5%",
                animationDelay: "0.5s"
              }}
            >
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h4>مجتمع داعم</h4>
                <p>+500 عضو</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Hero;
