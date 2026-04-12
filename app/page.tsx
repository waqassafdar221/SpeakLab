import Header from "./components/Header";
import Hero from "./components/Hero";
import Demo from "./components/Demo";
import Pricing from "./components/Pricing";
import Team from "./components/Team";
import JoinCommunity from "./components/JoinCommunity";
import FAQ from "./components/FAQ";
import ContactAbout from "./components/ContactAbout";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <section id="home">
        <Hero />
      </section>
      <section id="demo">
        <Demo />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <section id="team">
        <Team />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <section id="contact">
        <JoinCommunity />
      </section>
      <section id="about">
        <ContactAbout />
      </section>
      <Footer />
    </>
  );
}
