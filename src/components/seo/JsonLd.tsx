import { ServerInsertedJsonLd } from "@/components/seo/ServerInsertedJsonLd";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

type JsonLdProps = {
  locale: string;
  description: string;
};

function toJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ locale, description }: JsonLdProps) {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description,
    url: SITE_URL,
    image: `${SITE_URL}/images/keydtech-logo.png`,
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mogadishu",
      addressCountry: "SO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 2.0469,
      longitude: 45.3182,
    },
    areaServed: {
      "@type": "Country",
      name: "Somalia",
    },
    sameAs: [getWhatsAppSameAs()],
    inLanguage: locale,
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Odoo ERP by KeydTech",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      url: `${SITE_URL}/${locale}/pricing`,
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <ServerInsertedJsonLd
      payloads={[toJsonLd(localBusiness), toJsonLd(software)]}
    />
  );
}

function getWhatsAppSameAs() {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "252617476312";
  return `https://wa.me/${number}`;
}
