import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, FileText, Gauge, Layers3, LineChart, MapPinned, Radar, ShieldCheck, Sparkles, TrendingUp, WalletCards } from "lucide-react";

export const metadata: Metadata = {
  title: "Wynajem czy zakup mieszkania w Warszawie?",
  description:
    "Porównaj najem i zakup mieszkania w Warszawie. Zobacz, jak kredyt, wkład własny, czynsz i inwestowanie oszczędności zmieniają wynik po latach.",
  openGraph: {
    title: "Wynajem czy zakup mieszkania w Warszawie?",
    description:
      "Porównaj najem i zakup mieszkania w Warszawie. Zobacz, jak kredyt, wkład własny, czynsz i inwestowanie oszczędności zmieniają wynik po latach.",
    type: "website",
    locale: "pl_PL"
  }
};

const modelItems = [
  { icon: Building2, label: "Cena zakupu za m²" },
  { icon: MapPinned, label: "Stawka najmu za m²" },
  { icon: Gauge, label: "Oprocentowanie kredytu" },
  { icon: WalletCards, label: "Wkład własny" },
  { icon: Layers3, label: "Czynsz administracyjny" },
  { icon: ShieldCheck, label: "Utrzymanie i remonty" },
  { icon: BadgeCheck, label: "Ubezpieczenie" },
  { icon: TrendingUp, label: "Wzrost najmu" },
  { icon: LineChart, label: "Zwrot z inwestycji" },
  { icon: Radar, label: "Symulacja Monte Carlo" }
];

const outcomeItems = [
  {
    icon: Gauge,
    title: "Moment opłacalności zakupu",
    copy: "Sprawdź, po ilu latach zakup może zacząć wypadać lepiej niż najem przy Twoich założeniach."
  },
  {
    icon: WalletCards,
    title: "Ile możesz mieć po latach",
    copy: "Porównaj wartość mieszkania z najmem i inwestowaniem pieniędzy, których nie wkładasz w zakup."
  },
  {
    icon: MapPinned,
    title: "Porównanie dzielnic Warszawy",
    copy: "Zobacz obok siebie dzielnice z różnymi cenami zakupu, stawkami najmu i założeniami wzrostu wartości."
  },
  {
    icon: Radar,
    title: "Zakres możliwych wyników",
    copy: "Zobacz nie tylko jedną liczbę, ale też zakres wyników, gdy część założeń zmienia się w czasie."
  },
  {
    icon: FileText,
    title: "Podsumowanie w PDF",
    copy: "Zapisz wybrane ustawienia jako krótkie podsumowanie do rozmowy z partnerem, doradcą albo bankiem."
  }
];

const steps = [
  {
    eyebrow: "01",
    title: "Wybierz dzielnicę",
    copy: "Zacznij od miejsca, które realnie bierzesz pod uwagę: Mokotów, Wola, Ursynów, Śródmieście albo inna dzielnica."
  },
  {
    eyebrow: "02",
    title: "Ustaw swoje liczby",
    copy: "Podaj metraż, wkład własny, oprocentowanie, planowany czas mieszkania, wzrost najmu i zwrot z inwestycji."
  },
  {
    eyebrow: "03",
    title: "Porównaj wynik",
    copy: "Zobacz moment opłacalności, zakres wyników i różnice między dzielnicami w jednym widoku."
  }
];

const methodologyPoints = [
  "Porównujemy zakup mieszkania na kredyt z najmem i inwestowaniem pieniędzy, które w innym przypadku poszłyby na zakup.",
  "Uwzględniamy m.in. dzielnicę, metraż, oprocentowanie kredytu, wkład własny, utrzymanie mieszkania, wzrost najmu, wzrost wartości lokalu i zwrot z inwestycji.",
  "Wynik służy do orientacyjnej analizy. Nie jest rekomendacją zakupu, najmu, inwestycji ani wyboru kredytu."
];

const trustItems = [
  {
    title: "Dane szacunkowe, nie ogłoszenia na żywo",
    copy: "Ceny i czynsze są statycznymi założeniami dla dzielnic. Przed decyzją sprawdź aktualne oferty i warunki finansowania."
  },
  {
    title: "Widzisz, co wpływa na wynik",
    copy: "Założenia są widoczne i możesz je zmieniać, żeby sprawdzić, które liczby mają największe znaczenie."
  },
  {
    title: "To nie zastępuje porady",
    copy: "Kalkulator pomaga uporządkować temat, ale nie jest poradą finansową, kredytową, prawną ani inwestycyjną."
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
            <small>Najem czy zakup w liczbach</small>
          </div>
        </Link>
        <nav aria-label="Nawigacja strony">
          <a href="#problem">Problem</a>
          <a href="#model">Założenia</a>
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
            Narzędzie do porównania najmu i zakupu w Warszawie
          </span>
          <h1>Wynajem czy zakup mieszkania w Warszawie?</h1>
          <p>
            Zobacz, który wybór może wypaść lepiej po kilku latach. Porównaj ratę kredytu, czynsz najmu, wkład własny,
            wzrost cen i inwestowanie oszczędności w konkretnych dzielnicach Warszawy.
          </p>
          <div className="landing-actions">
            <Link className="landing-primary" href="/kalkulator">
              Uruchom kalkulator
              <ArrowRight size={18} />
            </Link>
            <a className="landing-secondary" href="#model">
              Zobacz, jak to liczymy
            </a>
          </div>
          <p className="cta-note">
            Bez zakładania konta. Dane są szacunkowe i służą do orientacyjnej analizy.
          </p>
          <div className="hero-proof">
            <span>18 warszawskich dzielnic</span>
            <span>500+ symulacji Monte Carlo</span>
            <span>Szacunkowe dane dzielnicowe</span>
          </div>
        </div>

        <div className="hero-product" aria-label="Podgląd kalkulatora">
          <span className="preview-context">Przykładowe porównanie</span>
          <div className="hero-product-top">
            <div>
              <span>Dzielnica</span>
              <strong>Mokotów</strong>
            </div>
            <small>Dla pary</small>
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
                <span>Najem / cena</span>
                <strong>5,18%</strong>
              </div>
              <div>
                <span>Zakup lepszy w symulacji</span>
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

      <section className="landing-band outcome-band" id="efekt">
        <div className="section-heading">
          <span>Co pokaże kalkulator?</span>
          <h2>Porównanie, z którym łatwiej rozmawiać o mieszkaniu, kredycie i najmie.</h2>
          <p>
            W jednym miejscu zbierasz lokalizację, metraż, kredyt, czynsz najmu, koszty utrzymania i inwestowanie
            oszczędności poza mieszkaniem.
          </p>
        </div>
        <div className="outcome-grid">
          {outcomeItems.map((item) => {
            const Icon = item.icon;
            return (
              <article className="outcome-card" key={item.title}>
                <span className="outcome-icon">
                  <Icon size={20} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="problem" className="landing-band problem-band">
        <div className="section-heading">
          <span>Co utrudnia decyzję</span>
          <h2>To nie jest tylko porównanie raty i czynszu.</h2>
        </div>
        <div className="problem-grid">
          <article>
            <strong>Wysokie ceny zakupu</strong>
            <p>Cena za metr i wkład własny mocno zmieniają próg wejścia, szczególnie w centralnych dzielnicach.</p>
          </article>
          <article>
            <strong>Stopy i koszt kredytu</strong>
            <p>Rata, refinansowanie i rodzaj oprocentowania potrafią zmienić wynik bardziej niż sama cena mieszkania.</p>
          </article>
          <article>
            <strong>Wzrost najmu</strong>
            <p>Rosnące czynsze mogą przybliżać moment opłacalności zakupu, ale dużo zależy od tego, jak długo chcesz zostać w mieszkaniu.</p>
          </article>
          <article>
            <strong>Co robisz z wkładem własnym</strong>
            <p>Wkład własny możesz włożyć w mieszkanie albo inwestować. Kalkulator pokazuje, jak ta decyzja zmienia wynik po latach.</p>
          </article>
          <article>
            <strong>Niepewny wzrost wartości</strong>
            <p>Wartość mieszkania nie rośnie równo co roku, dlatego symulacja pokazuje zakres wyników, a nie jedną obietnicę.</p>
          </article>
        </div>
      </section>

      <section className="landing-band how-band">
        <div className="section-heading">
          <span>Jak to działa</span>
          <h2>Od dzielnicy do porównania w kilka minut.</h2>
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
          <span>Co bierzemy pod uwagę</span>
          <h2>Nie tylko rata kredytu. Także koszty utrzymania, wkład własny i czas.</h2>
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

      <section className="landing-band methodology-section" id="metodologia">
        <div className="section-heading compact">
          <span>Jak liczymy wynik</span>
          <h2>Porównujemy dwa sposoby wykorzystania tych samych pieniędzy.</h2>
          <p>
            Nie sprawdzamy tylko, czy rata jest wyższa od czynszu. Liczymy też wkład własny, koszty utrzymania mieszkania
            i możliwy wynik inwestowania oszczędności poza zakupem.
          </p>
        </div>
        <div className="methodology-card">
          {methodologyPoints.map((point, index) => (
            <div className="methodology-point" key={point}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="zaufanie" className="trust-section">
        <div className="trust-copy">
          <span>Edukacyjne MVP</span>
          <h2>Założenia na wierzchu, bez obietnic.</h2>
        </div>
        <div className="trust-grid">
          {trustItems.map((item) => (
            <article className="trust-card" key={item.title}>
              <ShieldCheck size={20} />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <span>Zacznij od jednej dzielnicy</span>
        <h2>Sprawdź swoją dzielnicę.</h2>
        <p>Wybierz lokalizację, ustaw własne liczby i zobacz, jak zmienia się wynik.</p>
        <Link className="landing-primary" href="/kalkulator">
          Sprawdź swoją dzielnicę
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
