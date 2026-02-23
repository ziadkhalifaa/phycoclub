import React from "react";

class Footer extends React.Component {
  render() {
    return (
      <footer>
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>♥</span>
              <span>قيم</span>
            </div>
            <p className="footer-description">
              جمعية قيم لتنمية الصحة العقلية - نساعدك على بناء صحة نفسية أفضل من
              خلال برامج تدريبية متخصصة
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">
                f
              </a>
              <a href="#" className="social-icon">
                📷
              </a>
              <a href="#" className="social-icon">
                🐦
              </a>
            </div>
          </div>
          <div className="footer-column">
            <h4>روابط سريعة</h4>
            <ul className="footer-links">
              <li>
                <a href="#">الرئيسية</a>
              </li>
              <li>
                <a href="#courses">الكورسات</a>
              </li>
              <li>
                <a href="#articles">المقالات</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>تواصل معنا</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:info@qiyam.org">info@qiyam.org</a>
              </li>
              <li>
                <a href="tel:+201234567890">123 456 7890 20+</a>
              </li>
              <li>
                <a href="#">القاهرة، مصر</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>تابعنا</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Facebook</a>
              </li>
              <li>
                <a href="#">Instagram</a>
              </li>
              <li>
                <a href="#">Twitter</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 جمعية قيم. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    );
  }
}

export default Footer;
