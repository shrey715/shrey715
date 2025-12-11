/**
 * JSON-LD Structured Data for SEO.
 * Provides rich snippets for search engines.
 */

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  alumniOf?: {
    '@type': 'EducationalOrganization';
    name: string;
  };
  sameAs?: string[];
  knowsAbout?: string[];
}

export function generatePersonSchema(): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shreyas Deb',
    url: 'https://shrey715.vercel.app',
    image: 'https://shrey715.vercel.app/shreyas_cropped.png',
    jobTitle: 'Dual Degree Student & Undergraduate Researcher',
    worksFor: {
      '@type': 'Organization',
      name: 'Center for Computational Natural Sciences and Bioinformatics (CCNSB)',
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'International Institute of Information Technology, Hyderabad',
    },
    sameAs: [
      'https://github.com/shrey715',
      'https://www.linkedin.com/in/shreyasdeb/',
    ],
    knowsAbout: [
      'Machine Learning',
      'Deep Learning',
      'Systems Biology',
      'Web Development',
      'Distributed Systems',
      'Operating Systems',
    ],
  };
}

export function JsonLdScript() {
  const schema = generatePersonSchema();
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
