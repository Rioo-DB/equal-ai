import Hero from "@/components/Hero";
import PhoneShowcase from "@/components/PhoneShowcase";
import Statement from "@/components/Statement";
import MultiDevice from "@/components/MultiDevice";
import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page">
      <div className="frame">
        <main>
          <Hero />
          <PhoneShowcase />
          <Statement />
          <MultiDevice />
          <Testimonials />
          <Stats />
        </main>
        <Footer />
      </div>
    </div>
  );
}
