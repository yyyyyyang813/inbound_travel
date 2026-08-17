import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  beginWixLogin,
  completeWixLogin,
  isWixMemberLoggedIn,
  loadWixCatalog,
  logoutWixMember,
  submitWixBuddyApplication,
  submitWixBookingRequest,
  submitWixSupportMessage,
  wixImageUrl,
  type WixContentItem,
} from "./wix";
import logo from "./assets/logo.svg";

type View = "home" | "tour" | "community" | "checkout" | "buddy";
type Review = { name: string; place: string; date: string; text: string };
type Tour = {
  id: string; category: string; kicker: string; title: string; duration: string; rating: string;
  reviews: number; city: string; price: number; image: string; image2: string; host: string;
  hostImage: string; role: string; intro: string; group: string; quote: string; map: string;
  mapLabel: string; comments: Review[]; steps: { time: string; title: string; copy: string }[];
};
type Buddy = { name: string; image: string; focus: string; city: string; tours: number };
type FieldNote = { slug: string; tag: string; title: string; deck: string; image: string; read: string; authorSlug: string };
type SiteVisuals = { homeHeroImage: string; communityHeroImage: string };
type MatcherPreferences = { city: string; category: string; guests: number; maxBudget: number; buddy: string };
type TourMatch = { tour: Tour; score: number; reasons: string[] };

const buddyImage = (file: string) => `${import.meta.env.BASE_URL}buddies/${file}`;

const IMAGES = {
  people: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=88&w=1800",
  friends: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&q=85&w=1600",
  team: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=85&w=1600",
  art: "https://images.unsplash.com/photo-1752649937266-1900d9e176c3?auto=format&fit=crop&q=85&w=1600",
  sarah: buddyImage("sarah.jpg"),
  leo: buddyImage("leo.jpg"),
  kevin: buddyImage("kevin.jpg"),
  mei: buddyImage("mei.jpg"),
  lina: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=85&w=800",
  city: "https://images.unsplash.com/photo-1644659276747-f303ddf78463?auto=format&fit=crop&q=85&w=1800"
};

const tours: Tour[] = [
  {
    id: "classic-shenzhen", category: "Sightseeing", kicker: "Old lanes · New horizons",
    title: "Classic Shenzhen: Modern Wonders & Cultural Heritage", duration: "6 hours", rating: "4.99", reviews: 68,
    city: "Shenzhen", price: 118, image: IMAGES.friends, image2: IMAGES.city, host: "Sarah Zhao", hostImage: IMAGES.sarah,
    role: "Licensed guide & local storyteller", group: "Up to 8 guests · English / Mandarin",
    intro: "Think Shenzhen is only glass and steel? Spend a day with Sarah moving between 1,700-year-old lanes, quiet tea houses and a skyline that redraws itself every season.",
    quote: "Sarah made a huge city feel intimate. The dim sum stop alone was worth the trip.",
    map: "https://www.openstreetmap.org/export/embed.html?bbox=113.899%2C22.523%2C113.944%2C22.553&layer=mapnik&marker=22.5385%2C113.9208",
    mapLabel: "Nantou Ancient City · Nanshan, Shenzhen",
    comments: [
      { name: "Maya R.", place: "Toronto, Canada", date: "May 2026", text: "Sarah read our pace perfectly. We saw the history, ate brilliantly and never felt like we were being marched through a checklist." },
      { name: "Jonas K.", place: "Berlin, Germany", date: "April 2026", text: "The context changed how I understood Shenzhen. Warm, precise and full of small local moments we could never have found alone." },
      { name: "Amira S.", place: "Dubai, UAE", date: "March 2026", text: "Excellent English, thoughtful planning and great help with payments and transport after the tour too." }
    ],
    steps: [
      { time: "09:00", title: "Ancient Nantou, before the crowds", copy: "Trace the city’s origins through shaded alleys and surviving gates, with stories connecting the old county to today." },
      { time: "11:30", title: "A local table", copy: "Share Cantonese dim sum and learn the easy etiquette that makes ordering in Shenzhen a pleasure." },
      { time: "13:00", title: "The city from above", copy: "Finish among bold architecture and elevated views in Futian’s civic center." }
    ]
  },
  {
    id: "dafen-masterclass", category: "Photo & Art", kicker: "Make, don’t just look",
    title: "Dafen Art & Oil Painting Masterclass", duration: "4 hours", rating: "4.98", reviews: 42,
    city: "Shenzhen", price: 118, image: IMAGES.art, image2: IMAGES.team, host: "Leo Zhang", hostImage: IMAGES.leo,
    role: "Art historian & Dafen neighbor", group: "Up to 6 guests · English / Mandarin",
    intro: "Go behind the canvas in the village that once painted for the world. Meet working artists with Leo, then sit at an open-air studio and create a piece of your own.",
    quote: "The best souvenir I brought home from China—and the most relaxing afternoon of our trip.",
    map: "https://www.openstreetmap.org/export/embed.html?bbox=114.118%2C22.600%2C114.158%2C22.630&layer=mapnik&marker=22.6151%2C114.1374",
    mapLabel: "Dafen Oil Painting Village · Longgang, Shenzhen",
    comments: [
      { name: "Sofia L.", place: "Madrid, Spain", date: "June 2026", text: "Leo knows the artists personally, so the village felt alive rather than staged. The painting lesson was patient and genuinely fun." },
      { name: "Noah T.", place: "Sydney, Australia", date: "May 2026", text: "A relaxed afternoon and a rare chance to talk with working painters. I left with a canvas I actually love." },
      { name: "Chloe B.", place: "Paris, France", date: "February 2026", text: "Perfect for a first-time visitor. Leo handled translation naturally and gave us space to explore our own interests." }
    ],
    steps: [
      { time: "13:30", title: "Walk the world’s art factory", copy: "Peek into tucked-away studios and learn how Dafen evolved from replica hub to creative community." },
      { time: "14:30", title: "Hands-on oil workshop", copy: "A local painter guides you stroke by stroke while Leo translates and keeps the process playful." },
      { time: "16:00", title: "Museum & coffee", copy: "Browse contemporary work, then compare canvases over an iced drink at a neighborhood café." }
    ]
  },
  {
    id: "future-living", category: "Tech", kicker: "Tomorrow, in real life",
    title: "Shenzhen Future Living: Robotaxis, Drones & the Bay", duration: "5 hours", rating: "4.98", reviews: 64,
    city: "Shenzhen", price: 138, image: IMAGES.team, image2: IMAGES.city, host: "Kevin Wu", hostImage: IMAGES.kevin,
    role: "Tech insider & lifelong Shenzhen local", group: "Up to 6 guests · English / Mandarin",
    intro: "Ride a driverless taxi through the city’s tech heart with Kevin, test tomorrow’s gadgets and order an iced drink by drone beside Shenzhen Bay.",
    quote: "Watching our tea arrive by drone with Hong Kong across the water felt completely unreal.",
    map: "https://www.openstreetmap.org/export/embed.html?bbox=113.924%2C22.496%2C113.968%2C22.530&layer=mapnik&marker=22.5144%2C113.9457",
    mapLabel: "Shenzhen Bay Park · Nanshan, Shenzhen",
    comments: [
      { name: "Ethan W.", place: "San Francisco, USA", date: "June 2026", text: "Kevin has the technical knowledge to answer real questions, but keeps the day accessible and fun. The robotaxi was a highlight." },
      { name: "Priya N.", place: "Bengaluru, India", date: "April 2026", text: "Much more personal than a corporate innovation tour. Kevin connected the technology to everyday life in Shenzhen." },
      { name: "Daniel M.", place: "London, UK", date: "March 2026", text: "Seamless from start to finish. We also got excellent food and app recommendations for the rest of our stay." }
    ],
    steps: [
      { time: "13:00", title: "Robotics flagship showcase", copy: "Try hands-on flight controls, smart service robots and the newest consumer hardware." },
      { time: "14:00", title: "Ride the future", copy: "Take an autonomous robotaxi through Nanshan and watch its live 3D mapping build the road around you." },
      { time: "15:00", title: "Drone delivery by the bay", copy: "Order a drink mid-walk, track its flight and collect it from an automated coastal kiosk." }
    ]
  }
];

const cities = ["All cities", "Shenzhen", "Guangzhou", "Shanghai", "Beijing", "Chengdu"];
const buddies: Buddy[] = [
  { name: "Sarah Zhao", image: IMAGES.sarah, focus: "Heritage & hidden tables", city: "Shenzhen", tours: 126 },
  { name: "Leo Zhang", image: IMAGES.leo, focus: "Art, studios & design", city: "Shenzhen", tours: 89 },
  { name: "Kevin Wu", image: IMAGES.kevin, focus: "Technology & future life", city: "Shenzhen", tours: 104 },
  { name: "Mei Chen", image: IMAGES.mei, focus: "Food markets & home cooking", city: "Guangzhou", tours: 73 }
];

const textField = (item: WixContentItem, key: string, fallback: string) =>
  typeof item[key] === "string" && item[key] ? String(item[key]) : fallback;
const numberField = (item: WixContentItem, key: string, fallback: number) =>
  typeof item[key] === "number" ? Number(item[key]) : fallback;

const lookupKey = (value: unknown) => typeof value === "string" ? value.trim().toLocaleLowerCase() : "";

function referenceKeys(value: unknown) {
  if (typeof value === "string") return [lookupKey(value)].filter(Boolean);
  if (!value || typeof value !== "object") return [];
  const reference = value as Record<string, unknown>;
  return [reference._id, reference.id, reference.slug, reference.title, reference.name]
    .map(lookupKey)
    .filter(Boolean);
}

function buddyKeys(item: WixContentItem) {
  return [item._id, item.id, item.slug, item.title, item.name]
    .map(lookupKey)
    .filter(Boolean);
}

function dateLabel(value: unknown, fallback: string) {
  const raw = typeof value === "string" ? value : typeof value === "object" && value && "$date" in value ? String(value.$date) : "";
  if (!raw) return fallback;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function mergeWixTours(items: WixContentItem[], buddyItems: WixContentItem[], stepItems: WixContentItem[], reviewItems: WixContentItem[]) {
  if (!items.length) return [];
  const buddiesByKey = new Map<string, WixContentItem>();
  buddyItems.forEach((buddy) => buddyKeys(buddy).forEach((key) => buddiesByKey.set(key, buddy)));
  return [...items]
    .filter((item) => item.active !== false)
    .sort((a, b) => numberField(a, "order", 999) - numberField(b, "order", 999))
    .map((item, index): Tour => {
    const slug = textField(item, "slug", textField(item, "id", `wix-experience-${index + 1}`));
    const fallback = tours.find((tour) => tour.id === slug) || tours[index % tours.length];
    const buddyReferenceKeys = [
      ...referenceKeys(item.buddy),
      ...referenceKeys(item.buddyName),
      ...referenceKeys(item.buddySlug),
      ...referenceKeys(item.buddyId),
    ];
    const cmsBuddy = buddyReferenceKeys.map((key) => buddiesByKey.get(key)).find(Boolean);
    const rating = numberField(item, "rating", Number(fallback.rating));
    return {
      ...fallback,
      id: slug,
      category: textField(item, "category", fallback.category),
      kicker: textField(item, "kicker", fallback.kicker),
      title: textField(item, "title", fallback.title),
      duration: textField(item, "duration", fallback.duration),
      rating: rating.toFixed(2),
      reviews: numberField(item, "reviewCount", numberField(item, "reviews", fallback.reviews)),
      city: textField(item, "city", fallback.city),
      price: numberField(item, "priceUsd", numberField(item, "price", fallback.price)),
      image: wixImageUrl(item.firstImage, fallback.image),
      image2: wixImageUrl(item.secondImage, fallback.image2),
      host: cmsBuddy ? textField(cmsBuddy, "title", textField(cmsBuddy, "name", fallback.host)) : textField(item, "buddyName", textField(item, "buddy", fallback.host)),
      hostImage: cmsBuddy ? wixImageUrl(cmsBuddy.photo, wixImageUrl(cmsBuddy.avatarPath, fallback.hostImage)) : wixImageUrl(item.buddyImage, fallback.hostImage),
      role: cmsBuddy ? textField(cmsBuddy, "role", fallback.role) : textField(item, "buddyRole", fallback.role),
      intro: textField(item, "intro", fallback.intro),
      group: textField(item, "group", textField(item, "groupSize", fallback.group)),
      quote: textField(item, "quote", fallback.quote),
      map: textField(item, "mapUrl", fallback.map),
      mapLabel: textField(item, "mapLabel", fallback.mapLabel),
      comments: reviewItems.filter((review) => textField(review, "activitySlug", "") === slug).sort((a, b) => numberField(a, "order", 999) - numberField(b, "order", 999)).map((review) => ({ name: textField(review, "reviewerName", textField(review, "title", "Guest")), place: textField(review, "location", "Verified guest"), date: dateLabel(review.date, "Recent"), text: textField(review, "text", "") })),
      steps: stepItems.filter((step) => textField(step, "activitySlug", "") === slug).sort((a, b) => numberField(a, "order", 999) - numberField(b, "order", 999)).map((step) => ({ time: textField(step, "time", "").slice(0, 5), title: textField(step, "stepTitle", textField(step, "slug", "")), copy: textField(step, "description", textField(step, "kicker", "")) })),
    };
  });
}

function mergeWixBuddies(items: WixContentItem[]) {
  if (!items.length) return [];
  return items.filter((item) => item.status !== false).map((item, index): Buddy => {
    const fallback = buddies[index % buddies.length];
    return {
      name: textField(item, "title", fallback.name),
      image: wixImageUrl(item.photo, fallback.image),
      focus: textField(item, "focus", textField(item, "interest", fallback.focus)),
      city: textField(item, "city", fallback.city),
      tours: numberField(item, "guestDaysHosted", numberField(item, "guestDays", fallback.tours)),
    };
  });
}

function mergeWixFieldNotes(items: WixContentItem[], buddyItems: WixContentItem[]): FieldNote[] {
  const buddyImages = new Map(buddyItems.map((buddy) => [textField(buddy, "slug", ""), wixImageUrl(buddy.photo, IMAGES.team)]));
  return items.filter((item) => item.active !== false).sort((a, b) => numberField(a, "order", 999) - numberField(b, "order", 999)).map((item, index) => {
    const authorSlug = textField(item, "authorSlug", "");
    return { slug: textField(item, "slug", `field-note-${index + 1}`), tag: textField(item, "tag", "Culture"), title: textField(item, "title", "Field note"), deck: textField(item, "kicker", ""), read: textField(item, "readTime", "5 min"), authorSlug, image: buddyImages.get(authorSlug) || IMAGES.team };
  });
}

function mergeWixSiteVisuals(items: WixContentItem[]): SiteVisuals {
  const item = items[0] || {};
  return {
    homeHeroImage: wixImageUrl(item.homeHeroImage, IMAGES.people),
    communityHeroImage: wixImageUrl(item.communityHeroImage, IMAGES.city),
  };
}

function go(next: View, id?: string) {
  const hash = next === "home" ? "" : next === "tour" ? `#tour/${id}` : `#${next}`;
  window.history.pushState({}, "", `${window.location.pathname}${hash}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let wixStartup: Promise<{
  catalog: Awaited<ReturnType<typeof loadWixCatalog>>;
  loginError: string;
}> | null = null;

function initializeWix() {
  if (!wixStartup) {
    wixStartup = (async () => {
      let loginError = "";
      try {
        const login = await completeWixLogin();
        loginError = login.error;
      } catch (error) {
        loginError = error instanceof Error ? error.message : "Wix login could not be completed.";
      }
      return { catalog: await loadWixCatalog(), loginError };
    })();
  }
  return wixStartup;
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [tourId, setTourId] = useState(tours[0].id);
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All cities");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const [auth, setAuth] = useState(false);
  const [memberLoggedIn, setMemberLoggedIn] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [catalogTours, setCatalogTours] = useState<Tour[]>([]);
  const [catalogBuddies, setCatalogBuddies] = useState<Buddy[]>([]);
  const [fieldNotes, setFieldNotes] = useState<FieldNote[]>([]);
  const [siteVisuals, setSiteVisuals] = useState<SiteVisuals>({ homeHeroImage: IMAGES.people, communityHeroImage: IMAGES.city });
  const [wixConnected, setWixConnected] = useState(false);

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("tour/")) { setView("tour"); setTourId(hash.split("/")[1] || tours[0].id); }
      else if (["community", "checkout", "buddy"].includes(hash)) setView(hash as View);
      else setView("home");
    };
    sync(); window.addEventListener("hashchange", sync);
    const saved = window.localStorage.getItem("arctic-tern-favorites");
    if (saved) setFavorites(JSON.parse(saved));
    let active = true;
    void initializeWix().then(({ catalog, loginError }) => {
      if (!active) return;
      setCatalogTours(mergeWixTours(catalog.experiences, catalog.buddies, catalog.steps, catalog.reviews));
      setCatalogBuddies(mergeWixBuddies(catalog.buddies));
      setFieldNotes(mergeWixFieldNotes(catalog.fieldNotes, catalog.buddies));
      setSiteVisuals(mergeWixSiteVisuals(catalog.siteVisuals));
      setWixConnected(catalog.connected);
      setMemberLoggedIn(isWixMemberLoggedIn());
      if (loginError) { setAuthError(loginError); setAuth(true); }
    }).catch((error) => {
      if (!active) return;
      setCatalogTours([]);
      setCatalogBuddies([]);
      setWixConnected(false);
      setAuthError(error instanceof Error ? error.message : "Wix could not be reached.");
    });
    return () => { active = false; window.removeEventListener("hashchange", sync); };
  }, []);

  const startLogin = async () => {
    setAuthBusy(true); setAuthError("");
    try { await beginWixLogin(); }
    catch (error) { setAuthBusy(false); setAuthError(error instanceof Error ? error.message : "Wix login could not start."); }
  };
  const signOut = async () => {
    setAuthBusy(true); setAuthError("");
    try { await logoutWixMember(); }
    catch (error) { setAuthBusy(false); setAuthError(error instanceof Error ? error.message : "Wix logout could not start."); }
  };

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next); window.localStorage.setItem("arctic-tern-favorites", JSON.stringify(next));
  };
  const selected = catalogTours.find((tour) => tour.id === tourId) || catalogTours[0] || null;
  const categories = useMemo(() => ["All", ...Array.from(new Set(catalogTours.map((tour) => tour.category).filter(Boolean)))], [catalogTours]);
  const filtered = useMemo(() => catalogTours.filter((tour) => {
    const categoryMatch = category === "All" || tour.category === category;
    const cityMatch = city === "All cities" || tour.city === city;
    const queryMatch = !query || `${tour.title} ${tour.kicker} ${tour.category} ${tour.host}`.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && cityMatch && queryMatch;
  }), [catalogTours, category, city, query]);

  return <main>
    <div className="notice">China Buddy by Arctic Tern · Private, English-friendly experiences · Replies within 24 hours</div>
    <Header view={view} menu={menu} setMenu={setMenu} setAuth={setAuth} memberLoggedIn={memberLoggedIn} />
    {view === "home" && <HomeView heroImage={siteVisuals.homeHeroImage} allTours={catalogTours} categories={categories} category={category} setCategory={setCategory} city={city} setCity={setCity} query={query} setQuery={setQuery} filtered={filtered} hasCatalogTours={catalogTours.length > 0} buddies={catalogBuddies} favorites={favorites} toggleFavorite={toggleFavorite} />}
    {view === "tour" && selected && <TourView tour={selected} favorite={favorites.includes(selected.id)} toggleFavorite={toggleFavorite} />}
    {view === "community" && <CommunityView posts={fieldNotes} heroImage={siteVisuals.communityHeroImage} />}
    {view === "checkout" && selected && <CheckoutView tour={selected} memberLoggedIn={memberLoggedIn} requestSignIn={() => setAuth(true)} />}
    {view === "buddy" && <BuddyView buddies={catalogBuddies} memberLoggedIn={memberLoggedIn} requestSignIn={() => setAuth(true)} />}
    <Footer />
    <CustomerCare memberLoggedIn={memberLoggedIn} requestSignIn={() => setAuth(true)} />
    {auth && <AuthModal close={() => setAuth(false)} memberLoggedIn={memberLoggedIn} busy={authBusy} error={authError} connected={wixConnected} startLogin={startLogin} signOut={signOut} />}
  </main>;
}

function Header({ view, menu, setMenu, setAuth, memberLoggedIn }: { view: View; menu: boolean; setMenu: (v: boolean) => void; setAuth: (v: boolean) => void; memberLoggedIn: boolean }) {
  return <header className="site-header">
    <button className="brand" onClick={() => go("home")}><img className="brand-logo" src={logo} alt="Arctic Tern China Travel Buddy"/><span>ARCTIC TERN <em>China Buddy</em></span></button>
    <nav className={menu ? "nav open" : "nav"} aria-label="Primary navigation">
      <button className={view === "home" ? "active" : ""} onClick={() => { go("home"); setMenu(false); }}>Find A Buddy</button>
      <button className={view === "community" ? "active" : ""} onClick={() => { go("community"); setMenu(false); }}>Community</button>
      <button className={view === "buddy" ? "active" : ""} onClick={() => { go("buddy"); setMenu(false); }}>Our Buddies</button>
    </nav>
    <div className="header-actions"><button className="quiet">EN · USD</button><button className="outline" onClick={() => setAuth(true)}>{memberLoggedIn ? "Account" : "Sign in"}</button><button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? "×" : "☰"}</button></div>
  </header>;
}

function HomeView({ heroImage, allTours, categories, category, setCategory, city, setCity, query, setQuery, filtered, hasCatalogTours, buddies, favorites, toggleFavorite }: { heroImage: string; allTours: Tour[]; categories: string[]; category: string; setCategory: (v: string) => void; city: string; setCity: (v: string) => void; query: string; setQuery: (v: string) => void; filtered: Tour[]; hasCatalogTours: boolean; buddies: Buddy[]; favorites: string[]; toggleFavorite: (id: string) => void }) {
  const buddyWall = buddies.slice(0, 8);
  const [matcherOpen, setMatcherOpen] = useState(false);
  return <>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">Arctic Tern presents · China Buddy</p><h1>Meet China through<br/><i>someone local.</i></h1><p className="hero-lede">Not just a guide. A real person who knows the shortcuts, stories and tables—and helps China feel easy from the first hello.</p><div className="hero-stats"><span><b>4.98</b> average rating</span><span><b>100%</b> locally hosted</span><span><b>24h</b> human response</span></div></div>
      <div className="hero-image"><img src={heroImage} alt="Arctic Tern China travel experience"/></div>
      <div className="search-dock"><label><span>City</span><select value={city} onChange={(e) => setCity(e.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>What interests you?</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Art, food or technology"/></label><label><span>When</span><input type="date" /></label><label><span>Experience</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><button onClick={() => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" })}>Find a buddy ↗</button></div>
    </section>
    <section className="matcher-entry"><div><p className="eyebrow">A simpler way to choose</p><h2>Tell us how you travel.<br/><i>We’ll find the closest fit.</i></h2></div><div><p>Four quick questions. Recommendations use the live Arctic Tern activity catalogue—no AI and no invented experiences.</p><button onClick={() => setMatcherOpen(true)}>Start trip matcher <span>4 questions</span></button></div></section>
    <section className="categories" aria-label="Experience categories">{categories.map((item, i) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}><span>{String(i + 1).padStart(2, "0")}</span>{item}</button>)}</section>
    <section className="experience-section" id="experiences"><div className="section-heading"><div><p className="eyebrow">Buddy-led in China</p><h2>Choose who takes you in.</h2></div><p>Small groups, transparent pricing and a local who can translate more than words.</p></div><div className="tour-grid">{filtered.map((tour, i) => <article className="tour-card" key={tour.id}><div className="card-image"><img src={tour.image} alt={`${tour.host} hosting ${tour.category.toLowerCase()} guests`}/><span className="card-index">0{i + 1}</span><button className={favorites.includes(tour.id) ? "heart saved" : "heart"} onClick={() => toggleFavorite(tour.id)} aria-label="Save experience">{favorites.includes(tour.id) ? "♥" : "♡"}</button><div className="card-host"><img src={tour.hostImage} alt=""/><span>with <b>{tour.host}</b></span></div></div><div className="card-meta"><span>{tour.category}</span><span>★ {tour.rating} ({tour.reviews})</span></div><button className="card-title" onClick={() => go("tour", tour.id)}>{tour.title}</button><div className="card-bottom"><span>{tour.duration} · {tour.city}</span><span>from <b>${tour.price}</b> / person</span></div></article>)}</div>{hasCatalogTours && !filtered.length && <div className="empty">No experiences match this city and category yet. Try Shenzhen or adjust your filters.</div>}</section>
    {!!buddyWall.length && <section className="buddy-wall-section"><div className="buddy-wall-heading"><div><p className="eyebrow">Meet our China Buddies</p><h2>People make the place.</h2></div><p>Every experience is shaped and hosted by a verified local Buddy—not an anonymous operator.</p></div><div className="buddy-wall" aria-label="Arctic Tern Buddy photo wall"><div className="buddy-wall-track"><div className="buddy-wall-group">{buddyWall.map((buddy) => <BuddyWallCard buddy={buddy} key={buddy.name}/>)}</div><div className="buddy-wall-group" aria-hidden="true">{buddyWall.map((buddy) => <BuddyWallCard buddy={buddy} key={`copy-${buddy.name}`}/>)}</div></div></div></section>}
    <section className="buddy-banner"><div className="buddy-banner-image"><img src={IMAGES.team} alt="Local buddies meeting and planning experiences"/></div><div className="buddy-banner-copy"><p className="eyebrow">Become a China Buddy</p><h2>Your version of China is worth sharing.</h2><p>Turn your local knowledge, language skills and point of view into thoughtful experiences for curious travelers.</p><button onClick={() => go("buddy")}>Meet the community & apply ↗</button></div></section>
    {matcherOpen && <TripMatcher tours={allTours} buddies={buddies} categories={categories.filter((item) => item !== "All")} close={() => setMatcherOpen(false)} />}
  </>;
}

function BuddyWallCard({ buddy }: { buddy: Buddy }) {
  return <article className="buddy-wall-card"><img src={buddy.image} alt={buddy.name}/><div><b>{buddy.name}</b><span>{buddy.city} · {buddy.focus}</span></div></article>;
}

function groupCapacity(group: string) {
  const match = group.match(/(?:up to|max(?:imum)?)\s*(\d+)/i);
  return match ? Number(match[1]) : 8;
}

function matchTours(tours: Tour[], preferences: MatcherPreferences): TourMatch[] {
  return tours
    .filter((tour) => preferences.city === "Any city" || tour.city === preferences.city)
    .filter((tour) => preferences.guests <= groupCapacity(tour.group))
    .filter((tour) => tour.price <= preferences.maxBudget)
    .map((tour) => {
      let score = 25;
      const reasons: string[] = [];
      if (preferences.category === "Any interest") {
        score += 12;
        reasons.push(`${tour.category} is open to your flexible interests`);
      } else if (tour.category === preferences.category) {
        score += 38;
        reasons.push(`Strong match for ${preferences.category}`);
      }
      if (preferences.buddy === "No preference") {
        score += 8;
        reasons.push(`Hosted by ${tour.host}, with no Buddy restriction`);
      } else if (tour.host === preferences.buddy) {
        score += 25;
        reasons.push(`Hosted by your preferred Buddy, ${tour.host}`);
      }
      if (preferences.city !== "Any city") { score += 10; reasons.push(`Available in ${tour.city}`); }
      if (tour.price <= preferences.maxBudget * .8) { score += 8; reasons.push(`Comfortably within your $${preferences.maxBudget} per-person budget`); }
      else reasons.push(`Within your $${preferences.maxBudget} per-person budget`);
      score += Math.max(0, Math.min(6, (Number(tour.rating) - 4.7) * 20));
      return { tour, score: Math.min(98, Math.round(score)), reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score || Number(b.tour.rating) - Number(a.tour.rating))
    .slice(0, 3);
}

function TripMatcher({ tours, buddies, categories, close }: { tours: Tour[]; buddies: Buddy[]; categories: string[]; close: () => void }) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<MatcherPreferences>({ city: "Any city", category: "Any interest", guests: 2, maxBudget: 150, buddy: "No preference" });
  const cityOptions = useMemo(() => ["Any city", ...Array.from(new Set(tours.map((tour) => tour.city).filter(Boolean)))], [tours]);
  const matches = useMemo(() => matchTours(tours, preferences), [tours, preferences]);
  const update = <K extends keyof MatcherPreferences>(key: K, value: MatcherPreferences[K]) => setPreferences((current) => ({ ...current, [key]: value }));
  const reset = () => { setPreferences({ city: "Any city", category: "Any interest", guests: 2, maxBudget: 150, buddy: "No preference" }); setStep(1); };
  return <div className="matcher-backdrop" role="dialog" aria-modal="true" aria-labelledby="matcher-title">
    <section className="matcher-panel">
      <header className="matcher-head"><div><p className="eyebrow">Arctic Tern trip matcher</p><span>Question {Math.min(step, 3)} of 3</span></div><button onClick={close} aria-label="Close trip matcher">×</button></header>
      <div className="matcher-progress" aria-hidden="true"><span style={{ width: `${step >= 4 ? 100 : step * 33.333}%` }}/></div>
      {step === 1 && <div className="matcher-step"><p className="matcher-number">01</p><h2 id="matcher-title">Where do you want to go—and what draws you in?</h2><div className="matcher-fields"><label>City<select value={preferences.city} onChange={(event) => update("city", event.target.value)}>{cityOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Activity interest<select value={preferences.category} onChange={(event) => update("category", event.target.value)}><option>Any interest</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="matcher-actions"><button className="primary" onClick={() => setStep(2)}>Continue →</button></div></div>}
      {step === 2 && <div className="matcher-step"><p className="matcher-number">02</p><h2>How many people are travelling, and what feels comfortable?</h2><div className="matcher-fields"><label>Guests<select value={preferences.guests} onChange={(event) => update("guests", Number(event.target.value))}>{[1,2,3,4,5,6,7,8].map((count) => <option value={count} key={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></label><label>Maximum per person<select value={preferences.maxBudget} onChange={(event) => update("maxBudget", Number(event.target.value))}><option value={75}>Up to $75</option><option value={125}>Up to $125</option><option value={200}>Up to $200</option><option value={500}>Up to $500</option></select></label></div><div className="matcher-actions"><button className="matcher-back" onClick={() => setStep(1)}>← Back</button><button className="primary" onClick={() => setStep(3)}>Continue →</button></div></div>}
      {step === 3 && <div className="matcher-step"><p className="matcher-number">03</p><h2>Is there a Buddy you especially want to meet?</h2><div className="buddy-choice-grid"><button className={preferences.buddy === "No preference" ? "chosen" : ""} onClick={() => update("buddy", "No preference")}><span className="buddy-any">Any</span><b>No preference</b><small>Choose the closest overall match</small></button>{buddies.map((buddy) => <button className={preferences.buddy === buddy.name ? "chosen" : ""} onClick={() => update("buddy", buddy.name)} key={buddy.name}><img src={buddy.image} alt=""/><b>{buddy.name}</b><small>{buddy.city} · {buddy.focus}</small></button>)}</div><div className="matcher-actions"><button className="matcher-back" onClick={() => setStep(2)}>← Back</button><button className="primary" onClick={() => setStep(4)}>Show my matches →</button></div></div>}
      {step === 4 && <div className="matcher-results"><div className="matcher-result-heading"><div><p className="eyebrow">Your closest fits</p><h2>{matches.length ? `${matches.length} experiences worth meeting.` : "No exact fit—yet."}</h2></div><button onClick={reset}>Start again</button></div>{matches.length ? <div className="match-list">{matches.map(({ tour, score, reasons }, index) => <article className="match-card" key={tour.id}><div className="match-image"><img src={tour.image} alt=""/><span>{index === 0 ? "Best match" : `Option ${index + 1}`}</span></div><div className="match-copy"><div className="match-score"><strong>{score}%</strong><span>match</span></div><p className="eyebrow">{tour.category} · {tour.city}</p><h3>{tour.title}</h3><ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><div className="match-bottom"><span>with <b>{tour.host}</b> · ${tour.price}/person</span><button onClick={() => { close(); go("tour", tour.id); }}>View experience →</button></div></div></article>)}</div> : <div className="matcher-empty"><p>Try a higher budget, fewer guests, another city, or remove the Buddy preference.</p><button className="primary" onClick={reset}>Adjust my answers</button></div>}</div>}
    </section>
  </div>;
}

function TourView({ tour, favorite, toggleFavorite }: { tour: Tour; favorite: boolean; toggleFavorite: (id: string) => void }) {
  const [guests, setGuests] = useState(2); const [date, setDate] = useState("");
  return <div className="detail-page"><button className="back" onClick={() => go("home")}>← All experiences</button>
    <section className="detail-title"><div><p className="eyebrow">China Buddy experience · {tour.kicker}</p><h1>{tour.title}</h1><p className="detail-rating">★ {tour.rating} · {tour.reviews} verified reviews · {tour.city}, China</p></div><button className="save-detail" onClick={() => toggleFavorite(tour.id)}>{favorite ? "♥ Saved" : "♡ Save"}</button></section>
    <section className="gallery"><div className="gallery-main"><img src={tour.image} alt="Buddy-led experience"/></div><div><img src={tour.image2} alt="Experience location"/><div className="gallery-host"><img src={tour.hostImage} alt={tour.host}/><span><small>Your China Buddy</small><b>{tour.host}</b></span></div></div></section>
    <section className="detail-layout"><div className="story-column">
      <div className="facts"><span><small>Duration</small>{tour.duration}</span><span><small>Group</small>{tour.group.split(" · ")[0]}</span><span><small>Languages</small>English / Mandarin</span><span><small>Location</small>{tour.city}, China</span></div>
      <div className="host"><img className="host-avatar" src={tour.hostImage} alt={tour.host}/><div><small>Your local buddy</small><h3>{tour.host}</h3><p>{tour.role}</p></div><span className="verified">✓ identity verified</span></div>
      <article className="story"><p className="eyebrow">Overview</p><h2>What we’ll do</h2><p className="intro">{tour.intro}</p></article>
      <div className="timeline"><p className="eyebrow">A day, well paced</p>{tour.steps.map((step, i) => <div className="timeline-row" key={step.time}><span className="timeline-count">{String(i + 1).padStart(2, "0")}</span><time>{step.time}</time><div><h3>{step.title}</h3><p>{step.copy}</p></div></div>)}</div>
      <div className="included"><div><p className="eyebrow">Included</p><h2>The details are handled.</h2></div><ul><li>All admission and workshop fees</li><li>Local tastings or refreshments</li><li>English-speaking local buddy</li><li>Pre-trip messaging support</li></ul></div>
      <section className="location-section"><div className="subheading"><div><p className="eyebrow">Where we meet</p><h2>Start local.</h2></div><p>{tour.mapLabel}<br/>Exact meeting details arrive after confirmation.</p></div><div className="map-frame"><iframe title={`Map of ${tour.mapLabel}`} src={tour.map} loading="lazy"/><span>OpenStreetMap · Approximate meeting area</span></div></section>
      <section className="review-section"><div className="subheading"><div><p className="eyebrow">Guest notes</p><h2>People remember people.</h2></div><div className="review-score"><b>{tour.rating}</b><span>★★★★★<small>{tour.reviews} verified reviews</small></span></div></div><div className="review-grid">{tour.comments.map((review) => <article key={review.name}><div className="review-person"><span>{review.name.slice(0,1)}</span><div><b>{review.name}</b><small>{review.place} · {review.date}</small></div></div><p>“{review.text}”</p></article>)}</div></section>
      <blockquote>“{tour.quote}”<footer>— Recent verified guest</footer></blockquote>
    </div><aside className="booking-card"><div className="booking-buddy"><img src={tour.hostImage} alt=""/><span>Hosted by <b>{tour.host}</b></span></div><div className="booking-top"><span>From</span><strong>${tour.price}</strong><span>/ person</span><em>★ {tour.rating}</em></div><label>Preferred date<input type="date" value={date} onChange={(e) => setDate(e.target.value)}/></label><label>Guests<select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>{[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label><div className="price-row"><span>Estimated total</span><b>${tour.price * guests} USD</b></div><button className="primary" onClick={() => { window.localStorage.setItem("arctic-tern-booking", JSON.stringify({ tour: tour.id, guests, date })); go("checkout"); }}>Request availability</button><p className="booking-note">No payment required now.<br/>Our team replies in under 24 hours.</p><div className="trust-line"><span>✓ Verified buddy</span><span>✓ Free cancellation</span></div></aside></section>
  </div>;
}

function BuddyView({ buddies, memberLoggedIn, requestSignIn }: { buddies: Buddy[]; memberLoggedIn: boolean; requestSignIn: () => void }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const leadBuddy = buddies[0];
  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberLoggedIn) {
      setSubmitError("Please sign in or register before sending a Buddy application.");
      requestSignIn();
      return;
    }
    const form = new FormData(event.currentTarget);
    setSending(true); setSubmitError("");
    try {
      await submitWixBuddyApplication({
        fullName: String(form.get("fullName") || ""),
        city: String(form.get("city") || ""),
        contact: String(form.get("contact") || ""),
        experienceIdea: String(form.get("experienceIdea") || ""),
        pageUrl: window.location.href,
      });
      setSent(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your application could not be saved in Wix.");
    } finally {
      setSending(false);
    }
  };
  return <div className="buddy-page">
    <section className="active-buddies active-buddies-first"><div className="section-heading"><div><p className="eyebrow">Already in the community</p><h2>Meet the people<br/>behind the place.</h2></div><p>Artists, food lovers, engineers and storytellers—each with a personal door into the city.</p></div><div className="buddy-grid">{buddies.map((buddy, index) => <article key={buddy.name}><div className="buddy-card-photo"><img src={buddy.image} alt={`${buddy.name}, Arctic Tern Buddy in ${buddy.city}`}/><span>{String(index + 1).padStart(2, "0")} · {buddy.city}</span></div><div className="buddy-card-copy"><p className="eyebrow">{buddy.tours} guest days hosted</p><h3>{buddy.name}</h3><p>{buddy.focus}</p><span className="buddy-verified">✓ Identity & experience verified</span></div></article>)}</div></section>
    <section className="buddy-hero">
      <div className="buddy-hero-copy"><p className="eyebrow">Become a China Buddy</p><h1>Show your China.<br/><i>Your way.</i></h1><p>Host small, meaningful experiences with Arctic Tern. You bring the local point of view; we help with international guests, presentation and support.</p><button onClick={() => document.getElementById("buddy-apply")?.scrollIntoView({ behavior: "smooth" })}>Start your application ↓</button></div>
      {leadBuddy && <div className="buddy-hero-visual"><img src={leadBuddy.image} alt={`${leadBuddy.name}, a verified ${leadBuddy.city} Buddy`}/><div className="buddy-hero-profile"><span className="profile-status"/><div><small>Meet {leadBuddy.name.split(" ")[0]} · {leadBuddy.city}</small><b>“I help guests read the city between the landmarks.”</b></div></div><div className="buddy-hero-stat"><strong>{leadBuddy.tours}</strong><span>guest days<br/>hosted locally</span></div></div>}
    </section>
    <section className="buddy-proof"><p>Built for people with a point of view—not professional tour scripts.</p><div><span><b>4.98</b> guest rating</span><span><b>4–8</b> guests per group</span><span><b>24h</b> local support</span></div></section>
    <section className="buddy-values"><article><span>01</span><h3>Host what you know</h3><p>Build around your real interests, neighborhood and relationships.</p></article><article><span>02</span><h3>Choose your rhythm</h3><p>Set your own dates, group size and availability.</p></article><article><span>03</span><h3>We handle the bridge</h3><p>Arctic Tern supports presentation, guest communication and trust.</p></article></section>
    <section className="apply-section" id="buddy-apply"><div><p className="eyebrow">Introduce yourself</p><h2>{sent ? "Thanks—we’ll be in touch." : "What would you show a new friend?"}</h2><p>{sent ? "Our Buddy team will review your note and reply within three working days." : "A short note is enough to start. Sign in to send it to our Buddy team."}</p></div>{!sent && <form onSubmit={submitApplication}><div className="form-two"><label>Your name<input name="fullName" required placeholder="Full name"/></label><label>City<input name="city" required placeholder="Where are you based?"/></label></div><label>Email or WeChat<input name="contact" required placeholder="How should we reach you?"/></label><label>Your experience idea<textarea name="experienceIdea" required placeholder="Tell us what you know, love or want to share…"/></label>{submitError && <p className="form-error" role="alert">{submitError}</p>}<button className="primary" type={memberLoggedIn ? "submit" : "button"} disabled={sending} onClick={() => { if (!memberLoggedIn) { setSubmitError("Please sign in or register before sending a Buddy application."); requestSignIn(); } }}>{sending ? "Saving to Wix…" : memberLoggedIn ? "Send introduction ↗" : "Sign in to apply"}</button></form>}</section>
  </div>;
}

function CommunityView({ posts, heroImage }: { posts: FieldNote[]; heroImage: string }) {
  const [tag, setTag] = useState("All stories"); const tags = ["All stories", "Before you go", "Food", "Culture", "Future city"];
  return <div className="community-page"><section className="community-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(19, 42, 35, .88), rgba(19, 42, 35, .38)), url(${heroImage})` }}><p className="eyebrow">Arctic Tern · Buddy Field Notes</p><h1>China explained<br/><i>by the people in it.</i></h1><p>Practical intelligence, honest recommendations and stories from our local community.</p></section><div className="pill-row">{tags.map(item => <button className={tag === item ? "active" : ""} onClick={() => setTag(item)} key={item}>{item}</button>)}</div><section className="magazine-grid">{posts.filter(post => tag === "All stories" || post.tag === tag).map((post, i) => <article className={i === 0 ? "magazine-card feature" : "magazine-card"} key={post.title}><img src={post.image} alt=""/><div><p className="eyebrow">{post.tag} · {post.read}</p><h2>{post.title}</h2><p>{post.deck}</p><button>Read story ↗</button></div></article>)}</section><section className="community-cta"><span>Have a question only a local can answer?</span><button onClick={() => go("home")}>Find your China Buddy</button></section></div>;
}

function CheckoutView({ tour, memberLoggedIn, requestSignIn }: { tour: Tour; memberLoggedIn: boolean; requestSignIn: () => void }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [payment, setPayment] = useState("card");
  const booking = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("arctic-tern-booking") || "{}") : {};
  const guests = booking.guests || 2;
  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberLoggedIn) {
      setSubmitError("Please sign in or register before sending a booking request.");
      requestSignIn();
      return;
    }
    const form = new FormData(event.currentTarget);
    setSending(true); setSubmitError("");
    try {
      await submitWixBookingRequest({
        experienceId: tour.id,
        experienceTitle: tour.title,
        preferredDate: booking.date || "Flexible",
        guests,
        estimatedTotal: tour.price * guests,
        currency: "USD",
        fullName: String(form.get("fullName") || ""),
        whatsapp: String(form.get("whatsapp") || ""),
        email: String(form.get("email") || ""),
        specialRequests: String(form.get("specialRequests") || ""),
        preferredPayment: payment,
      });
      setSent(true); window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The booking request could not be saved in Wix.");
    } finally {
      setSending(false);
    }
  };
  if (sent) return <div className="success-page"><span className="success-mark">✓</span><p className="eyebrow">Request received</p><h1>Your buddy is checking.</h1><p>We’ll confirm availability and reply within 24 hours. No payment has been taken.</p><button onClick={() => go("home")}>Keep exploring</button></div>;
  return <div className="checkout-page"><button className="back" onClick={() => go("tour", tour.id)}>← Back to experience</button><div className="checkout-heading"><p className="eyebrow">Secure request · Arctic Tern</p><h1>One last step.</h1><p>Share how we can reach you. We’ll confirm with your Buddy before any payment.</p></div><form className="checkout-grid" onSubmit={submitRequest}><div className="contact-form"><h2>Contact details</h2><p>Used only to confirm this booking.</p><div className="form-two"><label>Full name<input name="fullName" required placeholder="Your name"/></label><label>WhatsApp number<input name="whatsapp" required placeholder="+1 202 555 0182"/></label></div><label>Email address<input name="email" required type="email" placeholder="you@example.com"/></label><label>Special requests<textarea name="specialRequests" placeholder="Dietary needs, children, accessibility…"/></label><h2 className="payment-title">Preferred payment</h2><p>You’ll receive a secure link only after confirmation.</p><div className="payment-options"><button type="button" className={payment === "card" ? "chosen" : ""} onClick={() => setPayment("card")}>◉ &nbsp; Credit or debit card</button><button type="button" className={payment === "paypal" ? "chosen" : ""} onClick={() => setPayment("paypal")}>P &nbsp; PayPal</button></div>{submitError && <p className="form-error" role="alert">{submitError}</p>}</div><aside className="order-card"><img src={tour.image} alt=""/><div className="mini-host"><img src={tour.hostImage} alt=""/><span>with {tour.host}</span></div><p className="eyebrow">Your experience</p><h3>{tour.title}</h3><div className="order-lines"><span>Date <b>{booking.date || "Flexible"}</b></span><span>Guests <b>{guests}</b></span><span>Experience <b>${tour.price * guests}</b></span><span>Booking fee <b>$0</b></span></div><div className="order-total"><span>Estimated total</span><strong>${tour.price * guests} USD</strong></div><button className="primary" type="submit" disabled={sending}>{sending ? "Saving to Wix…" : memberLoggedIn ? "Send booking request" : "Sign in to request"}</button><small>By continuing, you agree to our booking terms and privacy policy.</small></aside></form></div>;
}

function CustomerCare({ memberLoggedIn, requestSignIn }: { memberLoggedIn: boolean; requestSignIn: () => void }) {
  const [open, setOpen] = useState(false); const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false); const [submitError, setSubmitError] = useState("");
  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberLoggedIn) {
      setSubmitError("Please sign in or register before sending a support message.");
      requestSignIn();
      return;
    }
    const form = new FormData(event.currentTarget);
    setSending(true); setSubmitError("");
    try {
      await submitWixSupportMessage({
        message: String(form.get("message") || ""),
        email: String(form.get("email") || ""),
        pageUrl: window.location.href,
      });
      setSent(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your message could not be saved in Wix.");
    } finally {
      setSending(false);
    }
  };
  return <div className="care-widget"><div className={open ? "care-panel open" : "care-panel"} aria-hidden={!open}><div className="care-head"><div className="care-avatar"><img src={IMAGES.lina} alt="Arctic Tern support"/><span/></div><div><b>Arctic Tern support</b><small>Usually replies in a few minutes</small></div><button onClick={() => setOpen(false)} aria-label="Close support">×</button></div>{sent ? <div className="care-success"><span>✓</span><h3>Message received.</h3><p>Leave this page open or add your email. Our team will follow up shortly.</p><button onClick={() => { setSent(false); setSubmitError(""); }}>Send another message</button></div> : <form onSubmit={submitMessage}><p>Hi! Ask about an experience, trip planning or becoming a Buddy.</p><label>Your message<textarea name="message" required placeholder="How can we help?"/></label><label>Email (optional)<input name="email" type="email" placeholder="you@example.com"/></label>{submitError && <p className="form-error" role="alert">{submitError}</p>}<button className="primary" type={memberLoggedIn ? "submit" : "button"} disabled={sending} onClick={() => { if (!memberLoggedIn) { setSubmitError("Please sign in or register before sending a support message."); requestSignIn(); } }}>{sending ? "Saving to Wix…" : memberLoggedIn ? "Send message ↗" : "Sign in to send"}</button><small>Member message · Human support</small></form>}</div><button className={open ? "care-trigger active" : "care-trigger"} onClick={() => setOpen(!open)} aria-label="Contact customer support"><span>{open ? "×" : "?"}</span><b>{open ? "Close" : "Ask Arctic Tern"}</b></button></div>;
}

function AuthModal({ close, memberLoggedIn, busy, error, connected, startLogin, signOut }: { close: () => void; memberLoggedIn: boolean; busy: boolean; error: string; connected: boolean; startLogin: () => void; signOut: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div className="auth-modal"><button className="modal-close" onClick={close} aria-label="Close account dialog">×</button><p className="eyebrow">Arctic Tern membership</p><h2 id="auth-title">{memberLoggedIn ? "You’re signed in." : "Keep your China closer."}</h2><p>{memberLoggedIn ? "Your Wix member session is active. Booking requests can now be linked to your account." : "Use Wix’s secure member page to sign in or create an account."}</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary auth-primary" disabled={busy} onClick={memberLoggedIn ? signOut : startLogin}>{busy ? "Connecting…" : memberLoggedIn ? "Sign out" : "Continue to secure sign in"}</button><small><span className={connected ? "service-dot online" : "service-dot"}/>{connected ? "Wix CMS connected" : "Wix member access ready · CMS collections pending"}</small></div></div>; }

function Footer() { return <footer className="footer"><div className="footer-brand"><img className="brand-logo footer-logo" src={logo} alt="Arctic Tern China Travel Buddy"/><div><b>ARCTIC TERN</b><p>China Buddy experiences, thoughtfully hosted.</p></div></div><div><h4>Explore</h4><button onClick={() => go("home")}>Find A Buddy</button><button onClick={() => go("community")}>Community</button><button onClick={() => go("buddy")}>Our Buddies</button></div><div><h4>Support</h4><button type="button">Booking help</button><button type="button">Safety & trust</button><button type="button">Cancellation</button><button type="button">About us</button></div><div className="newsletter"><h4>Notes from China</h4><p>One useful local note, occasionally.</p><label><input placeholder="Email address"/><button>→</button></label></div><p className="copyright">© 2026 Arctic Tern · China Buddy · Built around people, not checklists</p></footer>; }
