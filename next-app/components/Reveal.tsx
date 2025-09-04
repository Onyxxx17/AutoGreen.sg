'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

export function Reveal({
  children,
  index = 0,
  from = 'up', // 'left' | 'right' | 'up'
  delayStep = 120, // ms between items
}: {
  children: ReactNode;
  index?: number;
  from?: 'left' | 'right' | 'up';
  delayStep?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShow(true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const offscreen =
    from === 'left'
      ? '-translate-x-6'
      : from === 'right'
      ? 'translate-x-6'
      : 'translate-y-6';

  return (
    <div
      ref={ref}
      className={[
        'transition-all duration-700 ease-out will-change-transform',
        show ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${offscreen}`,
        'motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100',
      ].join(' ')}
      style={{ transitionDelay: `${index * delayStep}ms` }}
    >
      {children}
    </div>
  );
}
