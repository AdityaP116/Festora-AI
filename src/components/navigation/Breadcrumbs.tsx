import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const fullItems: BreadcrumbItem[] = [{ label: 'Home', path: '/' }, ...items];

  // Inject Schema.org BreadcrumbList structured data
  useEffect(() => {
    const scriptId = 'breadcrumbs-json-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: fullItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.path ? `https://festora.ai${item.path}` : undefined,
      })),
    };

    script.textContent = JSON.stringify(breadcrumbSchema);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.4rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
        }}
      >
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1;

          return (
            <li
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {index > 0 && <ChevronRight size={14} color="var(--color-border-focus)" />}

              {isLast || !item.path ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast ? 'var(--color-text)' : 'var(--color-text-muted)',
                    fontWeight: isLast ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  style={{
                    color: 'var(--color-text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'color var(--transition-fast)',
                  }}
                >
                  {index === 0 && <Home size={14} />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
