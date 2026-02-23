import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <section className="content-section" style={{ paddingTop: 120 }}>
        <div className="services-container" style={{ textAlign: "right" }}>
          <h2 className="section-title">الصفحة غير موجودة</h2>
          <p style={{ lineHeight: 2, fontSize: 18 }}>
            ممكن تكون اللينك غلط أو الصفحة اتنقلت.
          </p>
          <Link className="btn-login" to="/">
            رجوع للرئيسية
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
