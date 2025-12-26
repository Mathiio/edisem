import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Breadcrumbs, BreadcrumbItem, Spinner } from '@heroui/react';

interface LoadingBreadcrumbItemProps {
  label: string;
  isLoading?: boolean;
}

const LoadingBreadcrumbItem: React.FC<LoadingBreadcrumbItemProps> = ({ label, isLoading = false }) => (
  <span className='flex items-center'>
    {label}
    {isLoading && <Spinner size='sm' className='ml-2' classNames={{ circle1: 'w-3 h-3', circle2: 'w-3 h-3', wrapper: 'w-3 h-3' }} />}
  </span>
);

interface BreadcrumbConfig {
  label: string;
  href?: string;
  isLoading?: boolean;
}

/**
 * Génère les breadcrumbs en fonction de l'URL actuelle
 */
const generateBreadcrumbs = (pathname: string, params: any, itemTitle?: string): BreadcrumbConfig[] => {
  const isItemLoading = !itemTitle;
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
          label: itemTitle || `Conférence`,
          href: `/corpus/seminaires/conference/${params.id}`,
          isLoading: isItemLoading,
        });
      }
    } else if (segments[1] === 'colloques') {
      breadcrumbs.push({ label: 'Colloques', href: '/corpus/colloques' });

      if (segments[2] === 'conference' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Conférence`,
          href: `/corpus/colloques/conference/${params.id}`,
          isLoading: isItemLoading,
        });
      }
    } else if (segments[1] === 'journees-etudes') {
      breadcrumbs.push({ label: "Journées d'études", href: '/corpus/journees-etudes' });

      if (segments[2] === 'conference' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Conférence`,
          href: `/corpus/journees-etudes/conference/${params.id}`,
          isLoading: isItemLoading,
        });
      }
    } else if (segments[1] === 'pratiques-narratives') {
      breadcrumbs.push({ label: 'Pratiques narratives', href: '/corpus/pratiques-narratives' });
    } else if (segments[1] === 'mise-en-recits') {
      breadcrumbs.push({ label: 'Mise en récits', href: '/corpus/mise-en-recits' });

      if (segments[2] === 'mise-en-recit' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Mise en récit`,
          isLoading: isItemLoading,
        });
      }
    } else if (segments[1] === 'mise-en-recit' && params.id) {
      breadcrumbs.push({ label: 'Mise en récits', href: '/corpus/mise-en-recits' });
      breadcrumbs.push({
        label: itemTitle || `Mise en récit`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'experimentations') {
      breadcrumbs.push({ label: 'Expérimentations', href: '/corpus/experimentations' });

      if (segments[2] === 'experimentation' && params.id) {
        breadcrumbs.push({
          label: itemTitle || `Expérimentation`,
          isLoading: isItemLoading,
        });
      }
    } else if (segments[1] === 'experimentation' && params.id) {
      breadcrumbs.push({ label: 'Expérimentations', href: '/corpus/experimentations' });
      breadcrumbs.push({
        label: itemTitle || `Expérimentation #${params.id}`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'recits-artistiques') {
      breadcrumbs.push({ label: 'Récits artistiques', href: '/corpus/recits-artistiques' });

      if (segments[2] === 'genre' && params.slug) {
        breadcrumbs.push({
          label: params.slug,
        });
      }
    } else if (segments[1] === 'recit-artistique' && params.id) {
      breadcrumbs.push({ label: 'Récits artistiques', href: '/corpus/recits-artistiques' });
      breadcrumbs.push({
        label: itemTitle || `Récit artistique`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'element-narratif' && params.id) {
      breadcrumbs.push({ label: 'Éléments narratifs' });
      breadcrumbs.push({
        label: itemTitle || `Élément narratif`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'element-esthetique' && params.id) {
      breadcrumbs.push({ label: 'Éléments esthétiques' });
      breadcrumbs.push({
        label: itemTitle || `Élément esthétique`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'analyse-critique' && params.id) {
      breadcrumbs.push({ label: 'Analyses critiques' });
      breadcrumbs.push({
        label: itemTitle || `Analyse critique`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'recit-techno-industriel' && params.id) {
      breadcrumbs.push({ label: 'Récit techno-industriel' });
      breadcrumbs.push({
        label: itemTitle || `Objet techno`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'tool' && params.id) {
      breadcrumbs.push({ label: 'Outils' });
      breadcrumbs.push({
        label: itemTitle || `Outil`,
        isLoading: isItemLoading,
      });
    } else if (segments[1] === 'recit-scientifique' && params.id) {
      breadcrumbs.push({ label: 'Récit scientifique' });
      breadcrumbs.push({
        label: itemTitle || `Documentation`,
        isLoading: isItemLoading,
      });
    }
  } else if (segments[0] === 'intervenant' || segments[0] === 'intervenants') {
    breadcrumbs.push({ label: 'Intervenants', href: '/intervenants' });

    if (params.id) {
      breadcrumbs.push({
        label: itemTitle || `Intervenant #${params.id}`,
        isLoading: isItemLoading,
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
      isLoading: isItemLoading,
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

  // Debug logging
  console.log('🔍 DynamicBreadcrumbs Debug:', {
    pathname: location.pathname,
    params,
    itemTitle,
    breadcrumbsCount: breadcrumbs.length,
    breadcrumbs,
  });

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
            {crumb.href && !isLast ? (
              <Link to={crumb.href}>
                <LoadingBreadcrumbItem label={crumb.label} isLoading={crumb.isLoading} />
              </Link>
            ) : (
              <LoadingBreadcrumbItem label={crumb.label} isLoading={crumb.isLoading} />
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
};
