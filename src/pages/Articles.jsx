import Header from "../components/Header";
import ArticlesSection from "../components/ArticlesSection";
import Footer from "../components/Footer";

export default function Articles() {
  return (
    <>
      <Header />
      <ArticlesSection limit={null} title="كل المقالات" showViewAll={false} />
      <Footer />
    </>
  );
}
