import { useEffect } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import CoursesSection from "./components/CoursesSection";
import SpecialistsSection from "./components/SpecialistsSection";
import ArticlesSection from "./components/ArticlesSection";
import SessionsSection from "./components/SessionsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function App() {
  useEffect(() => {
    // Smooth scroll (زي HTML)
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const onClick = (e) => {
      const href = e.currentTarget.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    anchors.forEach((a) => a.addEventListener("click", onClick));

    // Cards scroll animation (زي HTML)
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target); // optional: عشان مايعيدش
        }
      });
    }, observerOptions);

    const serviceCards = Array.from(document.querySelectorAll(".service-card"));
    serviceCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";
      card.style.transition = `all 0.6s ease ${index * 0.1}s`;
      observer.observe(card);
    });

    // Floating animation variation (زي HTML)
    const floatingCards = Array.from(document.querySelectorAll(".floating-card"));
    floatingCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.3}s`;
    });

    // Cleanup (مهم)
    return () => {
      anchors.forEach((a) => a.removeEventListener("click", onClick));
      observer.disconnect();
    };
  }, []);

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
