import Link from "next/link";

export default function HomePage() {
  return (
    <section className="stack">
      <div className="hero">
        <div className="hero-card">
          <span className="chip">Beauty & Luxury</span>
          <h1>Bloom & Glow — нежная эстетика и точная запись</h1>
          <p className="muted">
            Онлайн-бронирование услуг салона красоты!
          </p>
          <div className="row">
            <Link className="button" href="/booking">
              Online Booking
            </Link>
            <Link className="button ghost" href="/services">
              Our Services
            </Link>
          </div>
          <div className="row">
            <span className="badge">7+ years</span>
            <span className="badge">3000+ happy clients</span>
          </div>
        </div>
        <div className="hero-visual" />
      </div>

      <div className="section">
        <div className="row">
          <strong>Our Services</strong>
          <span className="muted">Категории и премиум-пакеты</span>
        </div>
        <div className="service-grid">
          {[
            { title: "Hair Care", tag: "Hair" },
            { title: "Henna Designs", tag: "Nails" },
            { title: "Natural Makeup", tag: "Makeup" },
          ].map((item) => (
            <div key={item.title} className="card service-card">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60"
                alt={item.title}
              />
              <span className="chip">{item.tag}</span>
              <strong>{item.title}</strong>
              <span className="muted">Premium service package</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
