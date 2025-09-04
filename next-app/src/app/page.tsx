import Header from "../../components/Header";
import CountStats from "../../components/CountUpStat";
import Script from "next/script";
import Footer from '../../components/Footer';
import RevealValue from "../../components/Value";
import FAQSection from '../../components/FAQ';
import EnvGallery from "../../components/EnvGallery";
import { Reveal } from '../../components/Reveal';



export default function Page() {
  return (
    <>
      <Header />

      <main>
        {/* sec1 */}
        <section className="relative min-h-[100vh] flex items-end bg-[#eafcec]">
          {/* 2-col grid: keep ONLY the text inside so its layout is independent */}
          <div className="mx-w-full max-w-7xl px-20 pb-20 grid gap-10 md:grid-cols-2">
            {/* LEFT: text */}
            <div className="max-w-2xl">
              <h1 className="reveal-up relative inline-block text-6xl font-bold text-emerald-950">
                <span className="shine-once">AutoGreen</span>


              </h1>

              <p className="reveal-up-del mt-3 max-w-2xl text-neutral-700">
                We highlight eco products and auto-select green checkout options.
              </p>
            </div>

          </div>

          {/* RIGHT: Spline is absolutely positioned so aspect ratio changes don't move the text */}
          <div className="absolute right-7 bottom-4 w-[900px] max-w-[80vw] aspect-[100/55]">
            <Script
              type="module"
              src="https://unpkg.com/@splinetool/viewer@1.10.53/build/spline-viewer.js"
              strategy="afterInteractive"
            />
            {/* @ts-expect-error – Spline custom element */}
            <spline-viewer
              url="https://prod.spline.design/OhSzJIc7wDvMGHm7/scene.splinecode"
              className="absolute inset-0 h-full w-full"
              style={{ background: 'transparent' }}
            />
          </div>
        </section>




        {/* Section 2 — Features */}
        <section
          id="features"
          className="py-30 bg-[#f3fbf4] scroll-mt-24">
          <div className="mx-auto max-w-6xl px-3">
            <h2 className="text-5xl font-semibold text-emerald-950">Features aligned with SG Green Plan 2030</h2>
            <p className="mt-5 text-neutral-700 max-w-3xl">
              AutoGreen nudges greener behaviour by default with supporting pillars like Sustainable Living,
              Energy Reset, Green Economy, and City in Nature.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 */}
              <Reveal index={0} from="right">
                <div className="rounded-2xl border border-emerald-900/10 bg-white/60 p-6 shadow-sm transition hover:shadow-md">
                  {/* Leaf icon */}
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-700" fill="currentColor" aria-hidden="true">
                    <path d="M20.7 4.3a1 1 0 0 0-1-.25C16.4 5.1 9.5 7.6 6 11.1c-2.5 2.5-3.4 5.5-2.5 8.4a1 1 0 0 0 1.1.7c2.9-.4 5.9-1.3 8.4-3.8 3.5-3.5 6-10.4 6.9-13.7a1 1 0 0 0-.25-1zM9.5 18.5c-1.4 1.4-3.3 2.1-5 2.5.4-1.7 1.1-3.6 2.5-5C9.2 13.8 14 11.8 17 11c-.8 3-2.8 7.8-7.5 7.5z" />
                  </svg>
                  <h3 className="mt-10 text-lg font-medium text-green-950">Sustainable Living</h3>
                  <p className="mt-1 text-neutral-700 text-sm">
                    Auto-selects <em>No cutlery</em>, paperless receipts, and other low-waste options by default.
                  </p>
                </div>
              </Reveal>

              {/* Card 2 */}
              <Reveal index={1} from="right">
                <div className="rounded-2xl border border-emerald-900/10 bg-white/60 p-6 shadow-sm transition hover:shadow-md">
                  {/* Bolt icon */}
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-700" fill="currentColor" aria-hidden="true">
                    <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6z" />
                  </svg>
                  <h3 className="mt-10 text-lg font-medium text-green-950">Energy Reset</h3>
                  <p className="mt-1 text-neutral-700 text-sm">
                    Prefers consolidated / green delivery options to cut extra trips and emissions.
                  </p>
                </div>
              </Reveal>

              {/* Card 3 */}
              <Reveal index={1} from="left">
                <div className="rounded-2xl border border-emerald-900/10 bg-white/60 p-6 shadow-sm transition hover:shadow-md">
                  {/* Bag + check icon */}
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-700" fill="currentColor" aria-hidden="true">
                    <path d="M7 7V6a5 5 0 1 1 10 0v1h2a1 1 0 0 1 1 1v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a1 1 0 0 1 1-1h2zm2 0h6V6a3 3 0 1 0-6 0v1zM10.5 15.5l-2-2 1.4-1.4 0.6 0.6 2.5 2.5 3.9-3.9 1.4 1.4-5.3 5.3-2.5-2.5z" />
                  </svg>
                  <h3 className="mt-10 text-lg font-medium text-green-950">Green Economy</h3>
                  <p className="mt-1 text-neutral-700 text-sm">
                    Highlights eco-labelled products and materials so they stand out at a glance.
                  </p>
                </div>
              </Reveal>

              {/* Card 4 */}
              <Reveal index={1} from="left">
                <div className="rounded-2xl border border-emerald-900/10 bg-white/60 p-6 shadow-sm transition hover:shadow-md">
                  {/* Users icon */}
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-700" fill="currentColor" aria-hidden="true">
                    <path d="M7 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm10 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM2 20a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1H2v-1zm11.5 1v-1a5 5 0 0 1 6.5-4.8 4.5 4.5 0 0 1 2 1.3V21h-8.5z" />
                  </svg>
                  <h3 className="mt-10 text-lg font-medium text-emerald-950">City in Nature</h3>
                  <p className="mt-1 text-neutral-700 text-sm">
                    Sector leaderboards (first 2 digits of postal code) to spark friendly, local competition.
                  </p>
                </div>
              </Reveal>

            </div>
          </div>
        </section>


        <EnvGallery />
        <CountStats />

        <FAQSection />
        <RevealValue />
      </main>

      <Footer />
    </>
  );
}
