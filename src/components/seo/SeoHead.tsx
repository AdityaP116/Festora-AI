import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'Festora AI — AI Celebration & Event Planner';
const DEFAULT_DESC =
  'Plan weddings, birthdays, anniversaries, and community gatherings with structured AI plans, deterministic budgets, task checklists, and timelines.';
const SITE_URL = 'https://festora.ai';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description = DEFAULT_DESC,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  structuredData,
}) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | Festora AI` : DEFAULT_TITLE;
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${SITE_URL}${currentPath === '/' ? '' : currentPath}`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to update or inject meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // 2. Meta description
    setMeta('description', description);

    // 3. Open Graph (OG) tags
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', 'Festora AI', true);

    // 4. Twitter Cards
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // 5. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    // 6. Structured Data (Schema.org JSON-LD)
    const scriptId = 'schema-json-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const defaultSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${SITE_URL}/#app`,
          name: 'Festora AI',
          url: SITE_URL,
          applicationCategory: 'EventPlanningApplication',
          operatingSystem: 'All',
          description: DEFAULT_DESC,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#org`,
          name: 'Festora AI',
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'support@festora.ai',
            contactType: 'customer support',
          },
        },
      ],
    };

    const finalSchema = structuredData
      ? Array.isArray(structuredData)
        ? { '@context': 'https://schema.org', '@graph': [...(defaultSchema['@graph'] as Record<string, unknown>[]), ...structuredData] }
        : { '@context': 'https://schema.org', '@graph': [...(defaultSchema['@graph'] as Record<string, unknown>[]), structuredData] }
      : defaultSchema;

    script.textContent = JSON.stringify(finalSchema);
  }, [fullTitle, description, canonicalUrl, ogType, ogImage, structuredData]);

  return null;
};
