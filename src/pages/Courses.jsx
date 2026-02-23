import Header from "../components/Header";
import CoursesSection from "../components/CoursesSection";
import Footer from "../components/Footer";

export default function Courses() {
  return (
    <>
      <Header />
      <CoursesSection limit={null} title="كل الكورسات" showViewAll={false} />
      <Footer />
    </>
  );
}
