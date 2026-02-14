"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP Hero Reveal — wraps the hero section to add:
 *  1. Staggered clip-path text reveal on mount
 *  2. Parallax float on the gradient blobs via ScrollTrigger
 *  3. Slight upward fade-out as user scrolls past
 */
export function GsapHeroReveal({ children }: { children: React.ReactNode }) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            // ── Text line reveal ────────────────────────────────
            const revealTargets = el.querySelectorAll("[data-gsap-reveal]");
            gsap.fromTo(
                revealTargets,
                {
                    clipPath: "inset(0 0 100% 0)",
                    y: 40,
                    opacity: 0,
                },
                {
                    clipPath: "inset(0 0 0% 0)",
                    y: 0,
                    opacity: 1,
                    duration: 0.9,
                    ease: "power3.out",
                    stagger: 0.12,
                }
            );

            // ── Parallax blobs — move slower than scroll ────────
            const blobs = el.querySelectorAll("[data-gsap-blob]");
            blobs.forEach((blob, i) => {
                gsap.to(blob, {
                    y: (i % 2 === 0 ? -80 : -50),
                    ease: "none",
                    scrollTrigger: {
                        trigger: el,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            });

            // ── Fade-out on scroll ─────────────────────────────
            gsap.to(el, {
                opacity: 0.3,
                y: -40,
                ease: "none",
                scrollTrigger: {
                    trigger: el,
                    start: "60% top",
                    end: "bottom top",
                    scrub: 1,
                },
            });
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className="will-change-transform">
            {children}
        </div>
    );
}
