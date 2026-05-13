import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Gauge, Layers3, LineChart, MapPinned, Radar, ShieldCheck, Sparkles, TrendingUp, WalletCards } from "lucide-react";

export const metadata: Metadata = {
  title: "Wynajem czy zakup mieszkania w Warszawie?",
  description:
    "Premium kalkulator rent-vs-buy dla Warszawy. Porównaj koszty najmu, kredytu i alternatywnego inwestowania kapitału w konkretnych dzielnicach."
};

const modelItems = [
  { icon: Building2, label: "Cena mieszkania za m²" },
  { icon: MapPinned, label: "Najem za m²" },
  { icon: Gauge, label: "Oprocentowanie kredytu" },
  { icon: WalletCards, label: "Wkład własny" },
  { icon: Layers3, label: "Czynsz administracyjny" },
  { icon: ShieldCheck, label: "Utrzymanie i remonty" },
  { icon: BadgeCheck, label: "Ubezpieczenie" },
  { icon: TrendingUp, label: "Wzrost najmu" },
  { icon: LineChart, label: "Zwrot z inwestycji" },
  { icon: Radar, label: "Symulacja Monte Carlo" }
];

const steps = [
  {
    eyebrow: "01",
    title: "Wybierz dzielnicę",
    copy: "Zacznij od realnego miejsca: Mokotów, Wola, Ursynów, Śródmieście albo dowolna inna dzielnica Warszawy."
  },
  {
    eyebrow: "02",
    title: "Dostosuj założenia",
    copy: "Ustaw metraż, wkład własny, oprocentowanie, horyzont mieszkania, wzrost najmu i zwrot z inwestycji."
  },
  {
    eyebrow: "03",
    title: "Sprawdź scenariusze",
    copy: "Zobacz moment opłacalności, rozkład wyników i porównanie dzielnic w jednym czytelnym widoku."
  }
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" href="/">
          <span>W</span>
          <div>
            <strong>Warsaw Home Compass</strong>
            <small>Warszawska inteligencja mieszkaniowa</small>
          </div>
        </Link>
        <nav aria-label="Nawigacja strony">
          <a href="#problem">Problem</a>
          <a href="#model">Model</a>
          <a href="#zaufanie">Zaufanie</a>
        </nav>
        <Link className="nav-cta" href="/kalkulator">
          Uruchom kalkulator
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker">
            <Sparkles size={16} />
            Publiczne MVP dla warszawskiego rynku mieszkań
          </span>
          <h1>Wynajem czy zakup mieszkania w Warszawie?</h1>
          <p>
            Porównaj koszty najmu, kredytu i alternatywnego inwestowania kapitału w konkretnych dzielnicach Warszawy.
            Zobacz decyzję mieszkaniową jak model finansowy, nie jak zgadywankę.
          </p>
          <div className="landing-actions">
            <Link className="landing-primary" href="/kalkulator">
              Uruchom kalkulator
              <ArrowRight size={18} />
            </Link>
            <a className="landing-secondary" href="#model">
              Zobacz jak działa model
            </a>
          </div>
          <div className="hero-proof">
            <span>18 dzielnic</span>
            <span>500+ ścieżek Monte Carlo</span>
            <span>Szacunkowe dane lokalne</span>
          </div>
        </div>

        <div className="hero-product" aria-label="Podgląd dashboardu kalkulatora">
          <div className="hero-product-top">
            <div>
              <span>Wybrana dzielnica</span>
              <strong>Mokotów</strong>
            </div>
            <small>Scenariusz: para</small>
          </div>
          <div className="preview-grid">
            <div className="preview-map">
              <span className="map-dot one">Śródmieście</span>
              <span className="map-dot two">Wola</span>
              <span className="map-dot three">Mokotów</span>
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="preview-metrics">
              <div>
                <span>Moment opłacalności</span>
                <strong>11 lat</strong>
              </div>
              <div>
                <span>Relacja najmu do ceny</span>
                <strong>5,18%</strong>
              </div>
              <div>
                <span>Szansa przewagi zakupu</span>
                <strong>58%</strong>
              </div>
            </div>
          </div>
          <div className="preview-chart">
            <span />
            <span />
            <span />
            <svg viewBox="0 0 520 130" role="img" aria-label="Podgląd symulacji Monte Carlo">
              <path d="M8 88 C80 72 110 70 165 66 C225 61 282 38 338 53 C405 72 443 25 512 18" />
              <path d="M8 94 C92 92 132 75 190 80 C264 86 319 61 365 70 C430 82 461 54 512 48" />
              <path d="M8 104 C98 84 154 106 219 83 C286 59 332 88 398 62 C446 43 482 38 512 31" />
            </svg>
          </div>
        </div>
      </section>

      <section id="problem" className="landing-band problem-band">
        <div className="section-heading">
          <span>Dlaczego to trudna decyzja</span>
          <h2>Jedno mieszkanie, wiele zmiennych finansowych.</h2>
        </div>
        <div className="problem-grid">
          <article>
            <strong>Wysokie ceny zakupu</strong>
            <p>Cena za metr i wkład własny mocno zmieniają próg wejścia, zwłaszcza w centralnych dzielnicach.</p>
          </article>
          <article>
            <strong>Stopy i koszt kredytu</strong>
            <p>Rata kredytu, refinansowanie i wariant stałego oprocentowania wpływają na wynik bardziej niż sama cena.</p>
          </article>
          <article>
            <strong>Wzrost najmu</strong>
            <p>Rosnące czynsze mogą skracać moment opłacalności zakupu, ale efekt zależy od horyzontu mieszkania.</p>
          </article>
          <article>
            <strong>Koszt alternatywny kapitału</strong>
            <p>Wkład własny można wydać na mieszkanie albo inwestować. Model pokazuje różnicę majątku w czasie.</p>
          </article>
          <article>
            <strong>Niepewna aprecjacja</strong>
            <p>Wartość mieszkania nie rośnie liniowo, dlatego symulacja pokazuje zakres scenariuszy, nie jedną obietnicę.</p>
          </article>
        </div>
      </section>

      <section className="landing-band how-band">
        <div className="section-heading">
          <span>Jak to działa</span>
          <h2>Od dzielnicy do scenariusza w kilka minut.</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.eyebrow} className="step-card">
              <span>{step.eyebrow}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="model" className="landing-band model-band">
        <div className="section-heading">
          <span>Co uwzględnia model</span>
          <h2>Nie tylko rata kredytu. Pełniejszy obraz decyzji.</h2>
        </div>
        <div className="model-grid">
          {modelItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="model-card">
                <Icon size={21} />
                <strong>{item.label}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section id="zaufanie" className="trust-section">
        <div>
          <span>Edukacyjne MVP</span>
          <h2>Model ma pomagać myśleć, nie podejmować decyzję za Ciebie.</h2>
        </div>
        <p>
          Dane w aplikacji są statyczne i szacunkowe. Narzędzie nie stanowi porady finansowej, kredytowej, prawnej ani
          inwestycyjnej. Przed decyzją zweryfikuj założenia samodzielnie i skonsultuj je z odpowiednimi specjalistami.
        </p>
      </section>

      <section className="final-cta">
        <span>Gotowy na pierwszy test?</span>
        <h2>Sprawdź swoją dzielnicę.</h2>
        <Link className="landing-primary" href="/kalkulator">
          Sprawdź swoją dzielnicę
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
