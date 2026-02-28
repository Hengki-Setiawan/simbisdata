"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const partners = [
    { name: "Kaos Kami", logo: "/partners/kaos-kami.png" },
];

export default function PartnersSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden border-t border-b border-border">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Partners</span>
                    </h2>
                    <p className="text-muted-foreground max-w-[600px] mx-auto text-lg">
                        Dipercaya dan berkolaborasi dengan brand inovatif untuk mendobrak batasan data analitik.
                    </p>
                </div>

                <div className="relative w-full max-w-5xl mx-auto overflow-hidden">
                    {/* Gradient Fading Edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

                    {/* Scrolling Marquee Area */}
                    <div className="flex w-[200%] gap-8 py-8 animate-marquee-fast hover:[animation-play-state:paused] items-center">
                        {/* Render duplicates to create seamless loop */}
                        {[...partners, ...partners, ...partners, ...partners, ...partners, ...partners, ...partners, ...partners].map((partner, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 flex items-center justify-center p-4 bg-surface border border-border rounded-xl w-40 h-24 hover:border-primary transition-colors cursor-pointer group"
                            >
                                <div className="relative w-full h-full opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
                                    <Image
                                        src={partner.logo}
                                        alt={`${partner.name} logo`}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Inline CSS for Tailwind since tw-animate might not have marquee-fast configured */}
            <style jsx>{`
                @keyframes marquee-fast {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-fast {
                    animation: marquee-fast 30s linear infinite;
                }
            `}</style>
        </section>
    );
}
