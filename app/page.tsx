"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type View = "home" | "tour" | "community" | "checkout";
type Tour = {
  id: string; category: string; kicker: string; title: string; duration: string; rating: string;
  reviews: number; city: string; price: number; image: string; image2: string; host: string; role: string;
  intro: string; group: string; quote: string; steps: { time: string; title: string; copy: string }[];
};

const IMAGES = {
  skyline: "https://images.unsplash.com/photo-1644659276747-f303ddf78463?auto=format&fit=crop&q=85&w=1800",
  art: "https://images.unsplash.com/photo-1752649937266-1900d9e176c3?auto=format&fit=crop&q=85&w=1600",
  alley: "https://images.unsplash.com/photo-1742568404676-2cd550b175e8?auto=format&fit=crop&q=85&w=1600",
  village: "https://images.unsplash.com/photo-1768250315742-d90b3fa2d23e?auto=format&fit=crop&q=85&w=1600"
};

const tours: Tour[] = [
  {
    id: "classic-shenzhen", category: "Sightseeing", kicker: "Old lanes · New horizons",
    title: "Classic Shenzhen: Modern Wonders & Cultural Heritage", duration: "6 hours", rating: "4.99", reviews: 68,
    city: "Shenzhen", price: 118, image: IMAGES.alley, image2: IMAGES.skyline, host: "Sarah Zhao", role: "Licensed guide & local storyteller",
    group: "Up to 8 guests · English / Mandarin",
    intro: "Think Shenzhen is only glass and steel? Spend a day moving between 1,700-year-old lanes, quiet tea houses and a skyline that redraws itself every season.",
    quote: "Sarah made a huge city feel intimate. The dim sum stop alone was worth the trip.",
    steps: [
      { time: "09:00", title: "Ancient Nantou, before the crowds", copy: "Trace the city’s origins through shaded alleys and surviving gates, with stories that connect the old county to today." },
      { time: "11:30", title: "A local table", copy: "Share Cantonese dim sum and learn the easy etiquette that makes ordering in Shenzhen a pleasure." },
      { time: "13:00", title: "The city from above", copy: "Finish among bold architecture and elevated views in Futian’s civic center." }
    ]
  },
  {
    id: "dafen-masterclass", category: "Photo & Art", kicker: "Make, don’t just look",
    title: "Dafen Art & Oil Painting Masterclass", duration: "4 hours", rating: "4.98", reviews: 42,
    city: "Shenzhen", price: 118, image: IMAGES.art, image2: IMAGES.village, host: "Leo Zhang", role: "Art historian & local buddy",
    group: "Up to 6 guests · English / Mandarin",
    intro: "Go behind the canvas in the village that once painted for the world. Meet working artists, then sit at an open-air studio and create a piece of your own.",
    quote: "The best souvenir I brought home from China—and the most relaxing afternoon of our trip.",
    steps: [
      { time: "13:30", title: "Walk the world’s art factory", copy: "Peek into tucked-away studios and learn how Dafen evolved from replica hub to creative community." },
      { time: "14:30", title: "Hands-on oil workshop", copy: "A local painter guides you stroke by stroke while your buddy translates and keeps the process playful." },
      { time: "16:00", title: "Museum & coffee", copy: "Browse contemporary work, then compare canvases over an iced drink at a neighborhood café." }
    ]
  },
  {
    id: "future-living", category: "Tech", kicker: "Tomorrow, in real life",
    title: "Shenzhen Future Living: Robotaxis, Drones & the Bay", duration: "5 hours", rating: "4.98", reviews: 64,
    city: "Shenzhen", price: 138, image: IMAGES.skyline, image2: IMAGES.art, host: "Kevin Wu", role: "Tech insider & local buddy",
    group: "Up to 6 guests · English / Mandarin",
    intro: "Ride a driverless taxi through the city’s tech heart, test tomorrow’s gadgets and order an iced drink by drone while walking the Shenzhen Bay coast.",
    quote: "Watching our tea arrive by drone with Hong Kong across the water felt completely unreal.",
    steps: [
      { time: "13:00", title: "Robotics flagship showcase", copy: "Try hands-on flight controls, smart service robots and the newest consumer hardware." },
      { time: "14:00", title: "Ride the future", copy: "Take an autonomous robotaxi through Nanshan and watch its live 3D mapping build the road around you." },
      { time: "15:00", title: "Drone delivery by the bay", copy: "Order a drink mid-walk, track its flight and collect it from an automated coastal kiosk." }
    ]
  }
];

const categories = ["All", "Sightseeing", "Foodie", "Photo & Art", "Self-drive", "Medical", "Supply chain", "Tech"];

function go(next: View, id?: string) {
  const hash = next === "home" ? "" : next === "tour" ? `#tour/${id}` : `#${next}`;
  window.history.pushState({}, "", `${window.location.pathname}${hash}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [tourId, setTourId] = useState(tours[0].id);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("tour/")) { setView("tour"); setTourId(hash.split("/")[1] || tours[0].id); }
      else if (hash === "community") setView("community");
      else if (hash === "checkout") setView("checkout");
      else setView("home");
    };
    sync();
    window.addEventListener("hashchange", sync);
    const saved = window.localStorage.getItem("loop-favorites");
    if (saved) setFavorites(JSON.parse(saved));
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next); window.localStorage.setItem("loop-favorites", JSON.stringify(next));
  };

  const selected = tours.find((tour) => tour.id === tourId) || tours[0];
  const filtered = useMemo(() => tours.filter((tour) => {
    const categoryMatch = category === "All" || tour.category === category;
    const queryMatch = !query || `${tour.title} ${tour.kicker} ${tour.category}`.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  }), [category, query]);

  return (
    <main>
      <div className="notice">Private small-group experiences · English-friendly · Replies in under 24 hours</div>
      <Header view={view} menu={menu} setMenu={setMenu} setAuth={setAuth} />
      {view === "home" && <HomeView category={category} setCategory={setCategory} query={query} setQuery={setQuery} filtered={filtered} favorites={favorites} toggleFavorite={toggleFavorite} />}
      {view === "tour" && <TourView tour={selected} favorite={favorites.includes(selected.id)} toggleFavorite={toggleFavorite} />}
      {view === "community" && <CommunityView />}
      {view === "checkout" && <CheckoutView tour={selected} />}
      <Footer />
      {auth && <AuthModal close={() => setAuth(false)} />}
    </main>
  );
}

function Header({ view, menu, setMenu, setAuth }: { view: View; menu: boolean; setMenu: (v: boolean) => void; setAuth: (v: boolean) => void }) {
  return <header className="site-header">
    <button className="brand" onClick={() => go("home")}><span className="brand-mark">L</span><span>LOOP <em>Shenzhen</em></span></button>
    <nav className={menu ? "nav open" : "nav"} aria-label="Primary navigation">
      <button className={view === "home" ? "active" : ""} onClick={() => { go("home"); setMenu(false); }}>Experiences</button>
      <button className={view === "community" ? "active" : ""} onClick={() => { go("community"); setMenu(false); }}>Field Notes</button>
      <button onClick={() => { go("home"); setMenu(false); }}>How it works</button>
    </nav>
    <div className="header-actions"><button className="quiet">EN · USD</button><button className="outline" onClick={() => setAuth(true)}>Sign in</button><button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? "×" : "☰"}</button></div>
  </header>;
}

function HomeView({ category, setCategory, query, setQuery, filtered, favorites, toggleFavorite }: { category: string; setCategory: (v: string) => void; query: string; setQuery: (v: string) => void; filtered: Tour[]; favorites: string[]; toggleFavorite: (id: string) => void }) {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Shenzhen, China · 22°32′N 114°03′E</p>
        <h1>The city moves fast.<br/><i>Take it personally.</i></h1>
        <p className="hero-lede">See Shenzhen through the people who know its shortcuts, stories and best-kept tables.</p>
        <div className="hero-stats"><span><b>4.98</b> avg. rating</span><span><b>100%</b> locally hosted</span><span><b>24h</b> response time</span></div>
      </div>
      <div className="hero-image"><img src={IMAGES.skyline} alt="Shenzhen skyline glowing beside the bay"/><span className="image-label">01 — Nanshan after blue hour</span></div>
      <div className="search-dock">
        <label><span>Where</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try Nanshan or art"/></label>
        <label><span>When</span><input type="date" /></label>
        <label><span>What</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button onClick={() => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" })} aria-label="Search experiences">Explore ↗</button>
      </div>
    </section>

    <section className="categories" aria-label="Experience categories">
      {categories.map((item, i) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}><span>{String(i + 1).padStart(2, "0")}</span>{item}</button>)}
    </section>

    <section className="experience-section" id="experiences">
      <div className="section-heading"><div><p className="eyebrow">Curated, not crowded</p><h2>Choose your way in.</h2></div><p>Small groups, transparent pricing and a local who can translate more than words.</p></div>
      <div className="tour-grid">
        {filtered.map((tour, i) => <article className="tour-card" key={tour.id}>
          <div className="card-image">
            <img src={tour.image} alt="" />
            <span className="card-index">0{i + 1}</span>
            <button className={favorites.includes(tour.id) ? "heart saved" : "heart"} onClick={() => toggleFavorite(tour.id)} aria-label="Save experience">{favorites.includes(tour.id) ? "♥" : "♡"}</button>
          </div>
          <div className="card-meta"><span>{tour.category}</span><span>★ {tour.rating} ({tour.reviews})</span></div>
          <button className="card-title" onClick={() => go("tour", tour.id)}>{tour.title}</button>
          <div className="card-bottom"><span>{tour.duration} · {tour.city}</span><span>from <b>${tour.price}</b> / person</span></div>
        </article>)}
      </div>
      {!filtered.length && <div className="empty">No exact match yet. Try another category or search term.</div>}
    </section>

    <section className="editorial-banner">
      <div className="editorial-image"><img src={IMAGES.art} alt="Artist working on a canvas"/></div>
      <div className="editorial-copy"><p className="eyebrow">LOOP Field Notes · Issue 01</p><h2>Not a list of places.<br/>A way to enter.</h2><p>Quick reads from locals and recent travelers: how to order dim sum, where the drones land, and why Dafen is more than replicas.</p><button onClick={() => go("community")}>Read the field notes <span>↗</span></button></div>
    </section>
  </>;
}

function TourView({ tour, favorite, toggleFavorite }: { tour: Tour; favorite: boolean; toggleFavorite: (id: string) => void }) {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  return <div className="detail-page">
    <button className="back" onClick={() => go("home")}>← All experiences</button>
    <section className="detail-title"><div><p className="eyebrow">{tour.kicker}</p><h1>{tour.title}</h1><p className="detail-rating">★ {tour.rating} · {tour.reviews} verified reviews · {tour.city}, China</p></div><button className="save-detail" onClick={() => toggleFavorite(tour.id)}>{favorite ? "♥ Saved" : "♡ Save"}</button></section>
    <section className="gallery"><div className="gallery-main"><img src={tour.image} alt="Main experience view"/></div><div><img src={tour.image2} alt="Second experience view"/><div className="gallery-caption"><span>Hosted with care</span><b>Small groups only</b></div></div></section>
    <section className="detail-layout">
      <div className="story-column">
        <div className="facts"><span><small>Duration</small>{tour.duration}</span><span><small>Group</small>{tour.group.split(" · ")[0]}</span><span><small>Languages</small>English / Mandarin</span><span><small>Location</small>{tour.city}, China</span></div>
        <div className="host"><div className="host-avatar">{tour.host.split(" ").map(x => x[0]).join("")}</div><div><small>Your local host</small><h3>{tour.host}</h3><p>{tour.role}</p></div><span className="verified">✓ identity verified</span></div>
        <article className="story"><p className="eyebrow">Overview</p><h2>What we’ll do</h2><p className="intro">{tour.intro}</p></article>
        <div className="timeline"><p className="eyebrow">A day, well paced</p>{tour.steps.map((step, i) => <div className="timeline-row" key={step.time}><span className="timeline-count">{String(i + 1).padStart(2, "0")}</span><time>{step.time}</time><div><h3>{step.title}</h3><p>{step.copy}</p></div></div>)}</div>
        <div className="included"><div><p className="eyebrow">Included</p><h2>The details are handled.</h2></div><ul><li>All admission and workshop fees</li><li>Local tastings or refreshments</li><li>English-speaking local buddy</li><li>Pre-trip WhatsApp support</li></ul></div>
        <blockquote>“{tour.quote}”<footer>— Recent verified guest</footer></blockquote>
      </div>
      <aside className="booking-card">
        <div className="booking-top"><span>From</span><strong>${tour.price}</strong><span>/ person</span><em>★ {tour.rating}</em></div>
        <label>Preferred date<input type="date" value={date} onChange={(e) => setDate(e.target.value)}/></label>
        <label>Guests<select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>{[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label>
        <div className="price-row"><span>Estimated total</span><b>${tour.price * guests} USD</b></div>
        <button className="primary" onClick={() => { window.localStorage.setItem("loop-booking", JSON.stringify({ tour: tour.id, guests, date })); go("checkout"); }}>Request availability</button>
        <p className="booking-note">No payment required now.<br/>We’ll reply on WhatsApp in under 24 hours.</p>
        <div className="trust-line"><span>↗ Secure request</span><span>↗ Free cancellation</span></div>
      </aside>
    </section>
  </div>;
}

function CommunityView() {
  const [tag, setTag] = useState("All stories");
  const tags = ["All stories", "Before you go", "Food", "Culture", "Future city"];
  const posts = [
    { tag: "Future city", title: "Your first robotaxi ride: what actually happens", deck: "No driver, no drama. A local’s five-minute briefing before you tap ‘start’. ", image: IMAGES.skyline, read: "6 min" },
    { tag: "Culture", title: "Dafen after the replicas", deck: "Inside the studios, cafés and galleries shaping the village’s second act.", image: IMAGES.art, read: "8 min" },
    { tag: "Before you go", title: "The Shenzhen arrival note", deck: "Payments, maps, messaging and the tiny setup choices that make day one smooth.", image: IMAGES.alley, read: "5 min" }
  ];
  return <div className="community-page">
    <section className="community-hero"><p className="eyebrow">LOOP Field Notes</p><h1>A city explained<br/><i>by the people in it.</i></h1><p>Practical intelligence, honest recommendations and stories from the street.</p></section>
    <div className="pill-row">{tags.map(item => <button className={tag === item ? "active" : ""} onClick={() => setTag(item)} key={item}>{item}</button>)}</div>
    <section className="magazine-grid">{posts.filter(post => tag === "All stories" || post.tag === tag).map((post, i) => <article className={i === 0 ? "magazine-card feature" : "magazine-card"} key={post.title}><img src={post.image} alt=""/><div><p className="eyebrow">{post.tag} · {post.read}</p><h2>{post.title}</h2><p>{post.deck}</p><button>Read story ↗</button></div></article>)}</section>
    <section className="community-cta"><span>Have a question only a local can answer?</span><button onClick={() => go("home")}>Find your buddy</button></section>
  </div>;
}

function CheckoutView({ tour }: { tour: Tour }) {
  const [sent, setSent] = useState(false);
  const [payment, setPayment] = useState("card");
  const booking = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("loop-booking") || "{}") : {};
  const guests = booking.guests || 2;
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  if (sent) return <div className="success-page"><span className="success-mark">✓</span><p className="eyebrow">Request received</p><h1>You’re on the loop.</h1><p>We’ll check the host’s availability and reply on WhatsApp within 24 hours. No payment has been taken.</p><button onClick={() => go("home")}>Keep exploring</button></div>;
  return <div className="checkout-page">
    <button className="back" onClick={() => go("tour", tour.id)}>← Back to experience</button>
    <div className="checkout-heading"><p className="eyebrow">Secure request</p><h1>One last step.</h1><p>Share how we can reach you. We’ll confirm availability before any payment.</p></div>
    <form className="checkout-grid" onSubmit={submit}>
      <div className="contact-form">
        <h2>Contact details</h2><p>Used only to confirm this booking.</p>
        <div className="form-two"><label>Full name<input required placeholder="Your name"/></label><label>WhatsApp number<input required placeholder="+1 202 555 0182"/></label></div>
        <label>Email address<input required type="email" placeholder="you@example.com"/></label>
        <label>Special requests<textarea placeholder="Dietary needs, children in the group, accessibility…"/></label>
        <h2 className="payment-title">Preferred payment</h2><p>You’ll receive a secure link only after the host confirms.</p>
        <div className="payment-options"><button type="button" className={payment === "card" ? "chosen" : ""} onClick={() => setPayment("card")}><span>◉</span> Credit or debit card</button><button type="button" className={payment === "paypal" ? "chosen" : ""} onClick={() => setPayment("paypal")}><span>P</span> PayPal</button></div>
      </div>
      <aside className="order-card"><img src={tour.image} alt=""/><p className="eyebrow">Your experience</p><h3>{tour.title}</h3><div className="order-lines"><span>Date <b>{booking.date || "Flexible"}</b></span><span>Guests <b>{guests}</b></span><span>Experience <b>${tour.price * guests}</b></span><span>Booking fee <b>$0</b></span></div><div className="order-total"><span>Estimated total</span><strong>${tour.price * guests} USD</strong></div><button className="primary" type="submit">Send booking request</button><small>By continuing, you agree to our booking terms and privacy policy.</small></aside>
    </form>
  </div>;
}

function AuthModal({ close }: { close: () => void }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="auth-modal"><button className="modal-close" onClick={close}>×</button><p className="eyebrow">Welcome to LOOP</p><h2>Save what moves you.</h2><p>Sign in to keep favorites and manage booking requests.</p><button className="auth-choice">G&nbsp;&nbsp; Continue with Google</button><button className="auth-choice">●&nbsp;&nbsp; Continue with Apple</button><div className="or"><span/>or<span/></div><label>Email address<input type="email" placeholder="you@example.com"/></label><button className="primary" onClick={close}>Continue with email</button><small>Prototype sign-in — connect your preferred auth provider later.</small></div></div>;
}

function Footer() {
  return <footer className="footer"><div className="footer-brand"><span className="brand-mark">L</span><div><b>LOOP SHENZHEN</b><p>Local experiences, thoughtfully hosted.</p></div></div><div><h4>Explore</h4><button onClick={() => go("home")}>Experiences</button><button onClick={() => go("community")}>Field Notes</button><button>About LOOP</button></div><div><h4>Support</h4><button>Booking help</button><button>Safety & trust</button><button>Cancellation</button></div><div className="newsletter"><h4>Notes from the city</h4><p>One useful Shenzhen note, occasionally.</p><label><input placeholder="Email address"/><button>→</button></label></div><p className="copyright">© 2026 LOOP Shenzhen · Built for curious arrivals</p></footer>;
}
