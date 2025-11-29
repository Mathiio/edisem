import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';

interface BreadcrumbConfig {
  label: string;
  href?: string;
}

/**
 * Génère les breadcrumbs en fonction de l'URL actuelle
 */
const generateBreadcrumbs = (pathname: string, params: any, itemTitle?: string): BreadcrumbConfig[] => {
  const breadcrumbs: BreadcrumbConfig[] = [{ label: 'Accueil', href: '/' }];

  // Découpe le chemin en segments
  const segments = pathname.split('/').filter(Boolean);

  // Gestion des différentes routes
  if (segments[0] === 'corpus') {
    // Ne pas ajouter "Corpus" car ce n'est pas une page

    // Routes de collection (séminaires, colloques, etc.)
    if (segments[1] === 'seminaires') {
      breadcrumbs.push({ label: 'Séminaires', href: '/corpus/seminaires' });

      if (segments[2] === 'conference' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Conférence #${params.id}`,
          href: `/corpus/seminaires/conference/${params.id}`,
        });
      }
    } else if (segments[1] === 'colloques') {
      breadcrumbs.push({ label: 'Colloques', href: '/corpus/colloques' });

      if (segments[2] === 'conference' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Conférence #${params.id}`,
          href: `/corpus/colloques/conference/${params.id}`,
        });
      }
    } else if (segments[1] === 'journees-etudes') {
      breadcrumbs.push({ label: "Journées d'études", href: '/corpus/journees-etudes' });

      if (segments[2] === 'conference' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Conférence #${params.id}`,
          href: `/corpus/journees-etudes/conference/${params.id}`,
        });
      }
    } else if (segments[1] === 'pratiques-narratives') {
      breadcrumbs.push({ label: 'Pratiques narratives', href: '/corpus/pratiques-narratives' });
    } else if (segments[1] === 'mise-en-recits') {
      breadcrumbs.push({ label: 'Mise en récits', href: '/corpus/mise-en-recits' });

      if (segments[2] === 'mise-en-recit' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Mise en récit #${params.id}`,
        });
      }
    } else if (segments[1] === 'mise-en-recit' && params.id) {
      breadcrumbs.push({ label: 'Mise en récits', href: '/corpus/mise-en-recits' });
      breadcrumbs.push({
        label: itemTitle || `Mise en récit #${params.id}`,
      });
    } else if (segments[1] === 'experimentations') {
      breadcrumbs.push({ label: 'Expérimentations', href: '/corpus/experimentations' });

      if (segments[2] === 'experimentation' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Expérimentation #${params.id}`,
        });
      }
    } else if (segments[1] === 'experimentation' && params.id) {
      breadcrumbs.push({ label: 'Expérimentations', href: '/corpus/experimentations' });
      breadcrumbs.push({
        label: itemTitle || `Expérimentation #${params.id}`,
      });
    } else if (segments[1] === 'oeuvres') {
      breadcrumbs.push({ label: 'Œuvres', href: '/corpus/oeuvres' });

      if (segments[2] === 'genre' && params.slug) {
        breadcrumbs.push({
          label: params.slug,
        });
      }
    } else if (segments[1] === 'oeuvre' && params.id) {
      breadcrumbs.push({ label: 'Œuvres', href: '/corpus/oeuvres' });
      breadcrumbs.push({
        label: itemTitle || `Œuvre #${params.id}`,
      });
    } else if (segments[1] === 'element-narratif' && params.id) {
      breadcrumbs.push({ label: 'Éléments narratifs' });
      breadcrumbs.push({
        label: itemTitle || `Élément narratif #${params.id}`,
      });
    } else if (segments[1] === 'element-esthetique' && params.id) {
      breadcrumbs.push({ label: 'Éléments esthétiques' });
      breadcrumbs.push({
        label: itemTitle || `Élément esthétique #${params.id}`,
      });
    } else if (segments[1] === 'analyse-critique' && params.id) {
      breadcrumbs.push({ label: 'Analyses critiques' });
      breadcrumbs.push({
        label: itemTitle || `Analyse critique #${params.id}`,
      });
    } else if (segments[1] === 'objet-techno' && params.id) {
      breadcrumbs.push({ label: 'Objets technologiques' });
      breadcrumbs.push({
        label: itemTitle || `Objet techno #${params.id}`,
      });
    } else if (segments[1] === 'tool' && params.id) {
      breadcrumbs.push({ label: 'Outils' });
      breadcrumbs.push({
        label: itemTitle || `Outil #${params.id}`,
      });
    } else if (segments[1] === 'documentation-scientifique' && params.id) {
      breadcrumbs.push({ label: 'Documentation scientifique' });
      breadcrumbs.push({
        label: itemTitle || `Documentation #${params.id}`,
      });
    }
  } else if (segments[0] === 'intervenants') {
    breadcrumbs.push({ label: 'Intervenants', href: '/intervenants' });

    if (params.id) {
      breadcrumbs.push({
        label: itemTitle || `Intervenant #${params.id}`,
      });
    }
  } else if (segments[0] === 'visualisation') {
    breadcrumbs.push({ label: 'Visualisation' });
  } else if (segments[0] === 'database') {
    breadcrumbs.push({ label: 'Base de données' });
  } else if (segments[0] === 'recherche') {
    breadcrumbs.push({ label: 'Recherche' });
  } else if (segments[0] === 'feedback' && params.id) {
    breadcrumbs.push({ label: 'Feedbacks' });
    breadcrumbs.push({
      label: itemTitle || `Feedback #${params.id}`,
    });
  }

  return breadcrumbs;
};

interface DynamicBreadcrumbsProps {
  /**
   * Titre optionnel de l'item actuel (ex: titre de la conférence)
   * Si non fourni, utilisera un label générique
   */
  itemTitle?: string;

  /**
   * Style de soulignement des breadcrumbs
   */
  underline?: 'none' | 'hover' | 'always' | 'active' | 'focus';

  /**
   * Classe CSS personnalisée
   */
  className?: string;
}

/**
 * Composant Breadcrumbs dynamique qui s'adapte automatiquement à la route actuelle
 *
 * @example
 * // Usage basique
 * <DynamicBreadcrumbs />
 *
 * @example
 * // Avec titre personnalisé
 * <DynamicBreadcrumbs itemTitle={conference?.titre} />
 */
export const DynamicBreadcrumbs: React.FC<DynamicBreadcrumbsProps> = ({ itemTitle, underline = 'hover', className = '' }) => {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = generateBreadcrumbs(location.pathname, params, itemTitle);

  // Ne rien afficher si on est sur la page d'accueil
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumbs underline={underline} className={className}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <BreadcrumbItem key={`${crumb.href || crumb.label}-${index}`} isCurrent={isLast}>
            {crumb.href && !isLast ? <Link to={crumb.href}>{crumb.label}</Link> : crumb.label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
};
