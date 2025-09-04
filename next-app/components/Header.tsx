"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";


const nav = [
    { href: "#features", label: "About Us" },
    { href: "#leaderboard", label: "Leaderboard" },
    { href: "#contact", label: "Contact Us" },

];

export default function Header() {

    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const ids = ["features", "leaderboard", "contact"]; // the sections to watch
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveId(e.target.id);
                });
            },
            {
                rootMargin: "-30% 0px -60% 0px",
                threshold: 0.01,
            }
        );

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });

        return () => io.disconnect();
    }, []);

    return (

        <header className="fixed top-0 z-50 border-b border-black/10 bg-[#bce4bd] backdrop-blur">

            <div className="flex h-18 w-screen items-center justify-between px-8">
                <Link href="/" className="flex items-center gap-4">
                    <Image
                        src="/logo.png"
                        alt="AutoGreen"
                        width={40}
                        height={40}
                        className="block"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                    />
                    <span className="text-xl font-extrabold tracking-tight">
                        <span className="text-black text-2xl">Auto</span>
                        <span className="font-light text-emerald-950 text-2xl"> Green</span>
                    </span>
                </Link>


                {/* Right: nav */}
                <nav className="hidden md:flex items-center gap-30 mr-[27px]">
                    {nav.map((item) => {
                        const isActive = activeId && item.href === `#${activeId}`;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`group relative text-sm transition-colors
          ${isActive ? "text-[#38ae1d]" : "text-neutral-800 hover:text-[#38ae1d]"}`}
                            >
                                {item.label}
                                <span
                                    className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] bg-[#38ae1d] transition-all duration-300
            ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                                />
                            </a>
                        );
                    })}
                </nav>

            </div>
        </header>

    );
}
