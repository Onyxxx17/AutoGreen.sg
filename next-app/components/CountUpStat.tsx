'use client';

import { useEffect, useRef, useState } from 'react';

// number that counts up when in view
function Count({
  to,
  suffix = '',
  duration = 750,
  inView,
}: { to: number; suffix?: string; duration?: number; inView: boolean }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ease = (t: number) => 1 - Math.pow(1 - t, 3); 

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(to * ease(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);

  return (
    <span className="tabular-nums">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function CountStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2, root: null, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="impact"
      ref={ref}
      className="min-h-[90vh] flex items-center bg-neutral-50 scroll-mt-16"
    >
      <div className="mx-auto max-w-6xl px-6 w-full">
        <h2 className="text-5xl font-semibold text-emerald-950">Impact</h2>
        <p className="mt-2 max-w-3xl text-neutral-700">
          AutoGreen makes greener choices the default, highlighting eco products and auto-selecting options like
          <em> No cutlery</em>, <em>green delivery </em>, and <em>paperless receipts</em>.
        </p>

        {/* title + line, number + description */}
        <div className="mt-20 grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16">
          {/* 1 */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Total Users</h3>
            <div className="mt-2 h-[2px] w-85 bg-neutral-300" />
            <div className="mt-6 flex items-baseline gap-10">
              <div className="text-6xl font-bold text-emerald-900">
                <Count to={95} suffix="+" inView={inView} />
              </div>
              <p className="max-w-sm text-neutral-700">of users across HDB sectors.</p>
            </div>
          </div>

          {/* 2 */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">No-cutlery Actions</h3>
            <div className="mt-2 h-[2px] w-85 bg-neutral-300" />
            <div className="mt-6 flex items-baseline gap-10">
              <div className="text-6xl font-bold text-emerald-900">
                <Count to={180} suffix="+" inView={inView} />
              </div>
              <p className="max-w-sm text-neutral-700">no-cutlery choices verified this month.</p>
            </div>
          </div>

          {/* 3 */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-neutral-900">Auto-Toggle Success</h3>
            <div className="mt-2 h-[2px] w-85 bg-neutral-300" />
            <div className="mt-6 flex items-baseline gap-10">
              <div className="text-6xl font-bold text-emerald-900">
                <Count to={98} suffix="%" inView={inView} />
              </div>
              <p className="max-w-xl text-neutral-700">
                success rate for auto-toggled eco options (paperless receipts, no cutlery).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
