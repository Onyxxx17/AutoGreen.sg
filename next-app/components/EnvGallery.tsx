'use client';

import Image from 'next/image';

type Pic = { src: string; label: string; alt: string };

const rowA: Pic[] = [
    { src: '/env/recycle-bins.jpg', label: 'Recycling', alt: 'Colour-coded recycling bins' },
    { src: '/env/city-in-nature.jpg', label: 'City in Nature', alt: 'Park connector with trees' },
    { src: '/env/green-delivery.jpg', label: 'Green Delivery', alt: 'Cyclist delivering parcels' },
    { src: '/env/paperless.jpg', label: 'Paperless', alt: 'Digital receipt on phone' },
];

const rowB: Pic[] = [
    { src: '/env/energy-reset.jpg', label: 'Energy Reset', alt: 'Solar panels under sun' },
    { src: '/env/food-waste.jpg', label: 'Reduce Waste', alt: 'Food waste reduction signage' },
    { src: '/env/community.jpg', label: 'Community', alt: 'Neighbourhood volunteers' },
    { src: '/env/green-economy.jpg', label: 'Green Economy', alt: 'Workers at sustainable facility' },
];

function Tile({ p }: { p: Pic }) {
    return (
        <figure className="group relative min-w-[260px] md:min-w-[320px] aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm">
            <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={false}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 320px, 420px"
            />
            <span className="grain" aria-hidden />
            {/* subtle dark gradient  */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
            <figcaption className="absolute bottom-2 left-3 rounded-md bg-white/40 px-3 py-1 text-xs font-medium text-black-900 backdrop-blur">
                {p.label}
            </figcaption>
        </figure>
    );
}

export default function EnvGallery() {
    return (
        <section
            id="environment"
            className="bg-[#eafcec] py-16"
        >
            <div className="mx-auto max-w-6xl px-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-emerald-900">
                    Singapore Green Plan 2030
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-emerald-950">
                    Sustainability at a Glance: Recycling • Energy • Nature • Community
                </h2>
                <p className="mt-2 max-w-3xl text-neutral-700">
                    Visual cues that tie to the Green Plan pillars: Sustainable Living, City in Nature,
                    Energy Reset, and a thriving Green Economy.
                </p>

                {/* row 1 ) */}
                <div className="relative mt-8 overflow-hidden">
                    <div className="marquee flex gap-4">
                        {[...rowA, ...rowA].map((p, i) => (
                            <Tile key={`a-${i}`} p={p} />
                        ))}
                    </div>
                </div>

                {/* row 2  */}
                <div className="relative mt-6 overflow-hidden">
                    <div className="marquee-reverse flex gap-4">
                        {[...rowB, ...rowB].map((p, i) => (
                            <Tile key={`b-${i}`} p={p} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
