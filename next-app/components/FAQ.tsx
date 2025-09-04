'use client';

import { useEffect, useRef, useState, useId, ReactNode } from 'react';

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function AnimatedRow({
  children,
  inView,
  index,
  delayStep = 120,
}: {
  children: ReactNode;
  inView: boolean;
  index: number;
  delayStep?: number;
}) {
  return (
    
    <div
    
      className={[
        'transition-all duration-700 ease-out will-change-transform',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        'motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100',
      ].join(' ')}
      style={{ transitionDelay: `${index * delayStep}ms` }}
    >
      {children}
    </div>
  );
}

/* q and ans */
type QA = { q: string; a: string };

const faqs: QA[] = [
  {
    q: 'How does AutoGreen verify “no cutlery” or green delivery?',
    a: 'The extension reads only the needed data on the order confirmation page (e.g., “no cutlery”, “green delivery”).',
  },
  {
    q: 'How does AutoGreen support Singapore’s Green Plan 2030?',
    a: 'AutoGreen nudges low-waste defaults at checkout (e.g., no cutlery, green delivery, paperless receipts) and highlights eco-friendly products. These behaviours align with the Green Plan’s Sustainable Living pillars, cutting waste, encouraging greener consumption, and normalising everyday eco choices.',
  },
  {
    q: 'Which sites are supported?',
    a: 'We start with popular SG food delivery and e-commerce sites.',
  },
  {
    q: 'Can I see my personal impact in terms of Green Plan goals?',
    a: 'Yes, block-level leaderboards encourage neighbourhood participation, mirroring the Green Plan’s community emphasis while keeping your data private and minimal.',
  },
  {
    q: 'Do small choices like green delivery and paperless receipts really help the Green Plan 2030?',
    a: 'Yes. At scale, defaulting to green delivery reduces last-mile trips, and paperless receipts + “no cutlery/bags” cut single-use waste. AutoGreen bundles these into easy defaults and tracks verified actions so neighbourhoods can see collective progress.',
  },
];

/* - item  */
function Item({ q, a }: QA) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-green-900/5">
      <button
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left"
      >
        <span className="text-[15px] md:text-base font-medium text-emerald-950">
          {q}
        </span>

        <span
          className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M12 5v14"
              className={open ? 'opacity-0 transition-opacity duration-200' : 'opacity-100 transition-opacity duration-200'}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        ref={contentRef}
        style={{ maxHeight: open ? contentRef.current?.scrollHeight || 0 : 0 }}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
      >
        <div className="px-6 pb-6 pt-0 text-sm text-emerald-950/80">{a}</div>
      </div>
    </div>
  );
}

/* - section - */
export default function FAQSection() {
  // observe the list wrapper to trigger the stagger
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <section id="faq" 
    className="relative py-16 md:py-24 bg-[#f6fbf7]">
      {/* soft top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-24 w-[88%] rounded-[72px] bg-emerald-300/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900/90 px-3 py-1 text-xs font-medium shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            FAQ
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-emerald-950">
            Got questions? We’ve got answers
          </h2>
          <p className="mt-2 text-green-900/70">
            Not sure where to start? These answers will point you in the right direction.
          </p>
        </div>

        {/* animated list */}
        <div ref={ref} className="space-y-4">
          {faqs.map((qa, i) => (
            <AnimatedRow key={qa.q} inView={inView} index={i}>
              <Item {...qa} />
            </AnimatedRow>
          ))}
        </div>
      </div>
    </section>
  );
}
