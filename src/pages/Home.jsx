import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import CoursesSection from "../components/CoursesSection";
import SpecialistsSection from "../components/SpecialistsSection";
import ArticlesSection from "../components/ArticlesSection";
import SessionsSection from "../components/SessionsSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <CoursesSection />
      <SpecialistsSection />
      <ArticlesSection />
      <SessionsSection />
      <CTASection />
      <Footer />
    </>
  );
}
