'use client';

import { useEffect, useRef, useState } from 'react';


// reveal value section
export default function RevealValue() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  // reveal when the block is in view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(entry.isIntersecting),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
    id="contact"
    className="relative bg-[#f6fbf6]">
      <section className="relative py-24 bg-gradient-to-t from-[#cfead6] via-[#eef9f0] to-white">
        
        <div ref={ref} className="mx-auto max-w-6xl px-6 text-center">

          {/* pill */}
          <div
            className={[
              'mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-900/10',
              'bg-white/80 px-3 py-1 text-sm text-emerald-900 shadow-sm ring-1 ring-black/5',
              'transition-all duration-600',
              show ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4',
            ].join(' ')}
            aria-label="Value"
          >
            {/* value icon */}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-green-700"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 3C7.6 3 4 6.6 4 11c0 5.2 6.5 9.5 7.7 10.2.2.1.5.1.6 0C14.5 20.5 21 16.2 21 11 21 6.6 17.4 3 13 3h-1Z" />
            </svg>
            <span>Value</span>
          </div>

          {/* headline */}
          <h2
            className={[
              'mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-emerald-950',
              'transition-all duration-700',
              show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            ].join(' ')}
          >
            All-in-One ECO Impact Companion
          </h2>

          {/* sub text */}
          <p
            className={[
              'mx-auto mt-3 max-w-2xl text-neutral-700',
              'transition-all duration-700 delay-100',
              show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            ].join(' ')}
          >
            AutoGreen helps you reduce waste at checkout, verify actions, and
            celebrate progress without extra taps.
          </p>
        </div>
      </section>
    
    </section>
  );
}