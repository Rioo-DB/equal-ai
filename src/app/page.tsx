import Hero from "@/components/Hero";
import DemoVideo from "@/components/DemoVideo";
import Statement from "@/components/Statement";
import MultiDevice from "@/components/MultiDevice";
// Hidden until the testimonial videos are ready; re-enable both lines.
// import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page">
      <div className="frame">
        <main>
          <Hero />
          <DemoVideo />
          <Statement />
          <MultiDevice />
          {/* <Testimonials /> */}
          <Stats />
        </main>
        <Footer />
      </div>
    </div>
  );
}
