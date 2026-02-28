export default function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SimbisData",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "Platform SaaS analisis data penjualan UMKM Indonesia menggunakan 15 algoritma Machine Learning dan AI narasi.",
        url: "https://simbisdata.com",
        offers: [
            {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "IDR",
                description: "3 upload/bulan, 1000 rows, 5 ML algorithms",
            },
            {
                "@type": "Offer",
                name: "Starter",
                price: "29000",
                priceCurrency: "IDR",
                description: "10 upload/bulan, 5000 rows, semua ML algorithms",
            },
            {
                "@type": "Offer",
                name: "Pro",
                price: "79000",
                priceCurrency: "IDR",
                description: "Unlimited upload, 50000 rows, AI narasi, Smart alerts",
            },
            {
                "@type": "Offer",
                name: "Enterprise",
                price: "199000",
                priceCurrency: "IDR",
                description: "Unlimited semua, API access, white-label reports",
            },
        ],
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "127",
        },
        creator: {
            "@type": "Organization",
            name: "SimbisData",
            url: "https://simbisdata.com",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
