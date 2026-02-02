export function WebApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Destiny Loom",
    url: "https://destiny-loom.cyberfaith.app",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "Explore MBTI, Tarot, Zodiac, Four Pillars, and I Ching readings powered by AI. Casual spirituality for the digital generation.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "CyberFaith",
      url: "https://cyberfaith.app",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ReadingArticleJsonLd({
  title,
  description,
  url,
  datePublished,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    author: {
      "@type": "Organization",
      name: "CyberFaith",
      url: "https://cyberfaith.app",
    },
    publisher: {
      "@type": "Organization",
      name: "CyberFaith",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CyberFaith",
    url: "https://cyberfaith.app",
    description: "Digital spirituality for the modern age.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
