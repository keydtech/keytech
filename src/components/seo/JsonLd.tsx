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
    name: "KeydTech Technology Services",
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

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/keydtech-logo.png`,
    email: CONTACT.email,
    telephone: CONTACT.phoneDisplay,
    sameAs: [getWhatsAppSameAs()],
    description,
  };

  return (
    <ServerInsertedJsonLd
      payloads={[
        toJsonLd(localBusiness),
        toJsonLd(organization),
        toJsonLd(software),
      ]}
    />
  );
}

function getWhatsAppSameAs() {
  return `https://wa.me/${CONTACT.whatsappNumber.replace(/\D/g, "")}`;
}
