import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { getAllItems } from '@/services/Items';
import { Skeleton } from '@heroui/react';
import { Network } from 'lucide-react';

// Types pour la hiérarchie D3
interface HierarchyNode {
  name: string;
  type?: string;
  id?: string;
  children?: HierarchyNode[];
  itemCount?: number;
}

// Mapping des types vers des labels français
const TYPE_LABELS: Record<string, string> = {
  // Événements
  seminaire: 'Séminaires',
  colloque: 'Colloques',
  journee_etudes: "Journées d'étude",
  // Acteurs
  actant: 'Actants',
  student: 'Étudiants',
  // Références
  keyword: 'Mots-clés',
  bibliography: 'Bibliographies',
  bibliographie: 'Bibliographies',
  mediagraphie: 'Médiagraphies',
  citation: 'Citations',
  annotation: 'Annotations',
  // Institutions
  university: 'Universités',
  laboratory: 'Laboratoires',
  laboritory: 'Laboratoires',
  doctoralschool: 'Écoles doctorales',
  doctoralchool: 'Écoles doctorales',
  // Contenus
  recit_artistique: 'Récits Artistiques',
  recitArtistique: 'Récits Artistiques',
  recit_scientifique: 'Récits Scientifiques',
  recit_techno_industriel: 'Récits Techno-Industriels',
  recit_mediatique: 'Récits Médiatiques',
  recit_citoyen: 'Récits Citoyens',
  // Éléments narratifs/esthétiques
  elementNarratif: 'Éléments Narratifs',
  elementNarratifs: 'Éléments Narratifs',
  elementEsthetique: 'Éléments Esthétiques',
  'analyse-critique': 'Analyses Critiques',
  microResume: 'Micro-Résumés',
  // Outils et expérimentations
  tool: 'Outils',
  experimentation: 'Expérimentations',
  experimentationStudents: 'Expérimentations Étudiants',
  feedback: "Retours d'expérience",
  // Autres
  collection: 'Collections',
  edition: 'Éditions',
  comment: 'Commentaires',
};

// Couleurs par type
const TYPE_COLORS: Record<string, string> = {
  // Événements (bleus/violets)
  seminaire: '#3b82f6',
  colloque: '#8b5cf6',
  journee_etudes: '#06b6d4',
  // Acteurs (oranges/verts)
  actant: '#f59e0b',
  student: '#22c55e',
  // Références (verts/rouges/roses)
  keyword: '#10b981',
  bibliography: '#ef4444',
  bibliographie: '#ef4444',
  mediagraphie: '#ec4899',
  citation: '#6366f1',
  annotation: '#fbbf24',
  // Institutions (oranges/verts/violets)
  university: '#f97316',
  laboratory: '#84cc16',
  laboritory: '#84cc16',
  doctoralschool: '#a855f7',
  doctoralchool: '#a855f7',
  // Contenus - Récits (roses/rouges variés)
  recit_artistique: '#f43f5e',
  recitArtistique: '#f43f5e',
  recit_scientifique: '#0891b2',
  recit_techno_industriel: '#7c3aed',
  recit_mediatique: '#db2777',
  recit_citoyen: '#16a34a',
  // Éléments narratifs/esthétiques (teals/cyans)
  elementNarratif: '#14b8a6',
  elementNarratifs: '#14b8a6',
  elementEsthetique: '#06b6d4',
  'analyse-critique': '#0d9488',
  microResume: '#2dd4bf',
  // Outils et expérimentations (gris/bleus)
  tool: '#64748b',
  experimentation: '#0ea5e9',
  experimentationStudents: '#38bdf8',
  feedback: '#eab308',
  // Autres
  collection: '#14b8a6',
  edition: '#a78bfa',
  comment: '#94a3b8',
  default: '#6b7280',
};

interface RadialClusterViewProps {
  externalData?: any[];
  onNodeClick?: (node: { id: string; type: string; name: string }) => void;
  visibleTypes?: string[];
}

export const RadialClusterView: React.FC<RadialClusterViewProps> = ({ externalData, onNodeClick, visibleTypes }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Fetch des données
  useEffect(() => {
    const loadData = async () => {
      console.log('RadialClusterView: Chargement des données...');

      if (externalData && externalData.length > 0) {
        console.log('RadialClusterView: Utilisation des données externes:', externalData.length);
        setItems(externalData);
        setIsLoading(false);
        return;
      }

      try {
        const allItems = await getAllItems();
        console.log('RadialClusterView: Items chargés:', allItems?.length || 0);
        setItems(allItems || []);
      } catch (error) {
        console.error('RadialClusterView: Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [externalData]);

  // Observer le redimensionnement
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const size = Math.min(width, height);
      setDimensions({ width: size, height: size });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Grouper les données par type
  const groupedData = useMemo(() => {
    if (!items.length) return new Map<string, any[]>();

    const grouped = new Map<string, any[]>();

    items.forEach((item) => {
      const type = item.type || 'unknown';

      if (visibleTypes && visibleTypes.length > 0 && !visibleTypes.includes(type)) {
        return;
      }

      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(item);
    });

    return grouped;
  }, [items, visibleTypes]);

  // Toggle expansion d'un type
  const toggleTypeExpansion = useCallback((type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Construire la hiérarchie avec expand/collapse
  const hierarchyData = useMemo(() => {
    if (!groupedData.size) return null;

    const hierarchy: HierarchyNode = {
      name: 'EDISEM',
      children: [],
    };

    groupedData.forEach((typeItems, type) => {
      const isExpanded = expandedTypes.has(type);
      const maxItems = 30;

      const typeNode: HierarchyNode = {
        name: TYPE_LABELS[type] || type,
        type: type,
        itemCount: typeItems.length,
        children: isExpanded
          ? typeItems.slice(0, maxItems).map((item) => ({
              name: item.title || item.name || `Item ${item.id}`,
              id: String(item.id),
              type: type,
            }))
          : [],
      };

      hierarchy.children!.push(typeNode);
    });

    // Trier par nombre d'items
    hierarchy.children?.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));

    return hierarchy;
  }, [groupedData, expandedTypes]);

  // Rendu D3
  useEffect(() => {
    if (!svgRef.current || !hierarchyData || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 140;

    // Layout radial
    const tree = d3
      .cluster<HierarchyNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const root = tree(d3.hierarchy(hierarchyData).sort((a, b) => d3.ascending(a.data.name, b.data.name)));

    // Setup SVG
    svg.attr('width', width).attr('height', height).attr('viewBox', [-cx, -cy, width, height].join(' ')).style('font', '10px sans-serif');

    // Groupe principal
    const g = svg.append('g');

    // Zoom simple
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        currentTransformRef.current = event.transform;
      });

    svg.call(zoom);

    // Restaurer le zoom précédent
    if (currentTransformRef.current !== d3.zoomIdentity) {
      svg.call(zoom.transform, currentTransformRef.current);
    }

    // Liens
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d3
          .linkRadial<d3.HierarchyPointLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
          .angle((d) => d.x)
          .radius((d) => d.y),
      );

    // Noeuds
    const nodes = g
      .append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`)
      .style('cursor', 'pointer');

    // Cercles
    nodes
      .append('circle')
      .attr('fill', (d) => {
        if (d.depth === 0) return '#fff';
        return TYPE_COLORS[d.data.type || 'default'] || TYPE_COLORS.default;
      })
      .attr('stroke', (d) => {
        if (d.depth === 0) return '#555';
        if (d.depth === 1) return '#fff';
        return 'none';
      })
      .attr('stroke-width', (d) => (d.depth <= 1 ? 2 : 0))
      .attr('r', (d) => {
        if (d.depth === 0) return 12;
        if (d.depth === 1) {
          const count = d.data.itemCount || 0;
          return Math.min(8 + Math.log(count + 1) * 3, 20);
        }
        return 4;
      })
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', () => {
            if (d.depth === 0) return 14;
            if (d.depth === 1) {
              const count = d.data.itemCount || 0;
              return Math.min(10 + Math.log(count + 1) * 3, 22);
            }
            return 6;
          });
      })
      .on('mouseout', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', () => {
            if (d.depth === 0) return 12;
            if (d.depth === 1) {
              const count = d.data.itemCount || 0;
              return Math.min(8 + Math.log(count + 1) * 3, 20);
            }
            return 4;
          });
      })
      .on('click', (_event, d) => {
        _event.stopPropagation();

        // Clic sur une catégorie (depth 1) -> toggle expand
        if (d.depth === 1 && d.data.type) {
          toggleTypeExpansion(d.data.type);
          return;
        }

        // Clic sur un item (depth 2) -> callback
        if (d.depth === 2 && d.data.id && onNodeClick) {
          onNodeClick({
            id: d.data.id,
            type: d.data.type || '',
            name: d.data.name,
          });
        }
      });

    // Indicateur expand/collapse pour les catégories
    nodes
      .filter((d) => d.depth === 1)
      .append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => (expandedTypes.has(d.data.type || '') ? '−' : '+'));

    // Labels - positionnés vers l'extérieur
    g.append('g')
      .selectAll('text')
      .data(root.descendants())
      .join('text')
      .attr('transform', (d) => {
        // Point central : pas de rotation, texte en dessous
        if (d.depth === 0) {
          return `translate(0,20)`;
        }
        // Autres points : rotation normale
        const angle = (d.x * 180) / Math.PI - 90;
        const rotate = d.x >= Math.PI ? 180 : 0;
        return `rotate(${angle}) translate(${d.y},0) rotate(${rotate})`;
      })
      .attr('dy', '0.35em')
      .attr('x', (d) => {
        if (d.depth === 0) return 0; // Centré horizontalement
        if (d.depth === 1) {
          const count = d.data.itemCount || 0;
          const nodeRadius = Math.min(8 + Math.log(count + 1) * 3, 20);
          return d.x >= Math.PI ? -(nodeRadius + 8) : nodeRadius + 8;
        }
        return d.x >= Math.PI ? -8 : 8;
      })
      .attr('text-anchor', (d) => {
        if (d.depth === 0) return 'middle'; // Centré
        return d.x >= Math.PI ? 'end' : 'start';
      })
      .attr('fill', (d) => {
        if (d.depth === 0) return '#fff';
        if (d.depth === 1) return TYPE_COLORS[d.data.type || 'default'] || TYPE_COLORS.default;
        return '#a1a1aa';
      })
      .attr('font-size', (d) => {
        if (d.depth === 0) return '14px';
        if (d.depth === 1) return '11px';
        return '10px';
      })
      .attr('font-weight', (d) => (d.depth <= 1 ? '600' : '400'))
      .style('pointer-events', 'none')
      .text((d) => {
        if (d.depth === 1) {
          const count = d.data.itemCount || 0;
          return `${d.data.name} (${count})`;
        }
        const maxLength = 30;
        return d.data.name.length > maxLength ? d.data.name.substring(0, maxLength) + '...' : d.data.name;
      });
  }, [hierarchyData, dimensions, isLoading, onNodeClick, expandedTypes, toggleTypeExpansion]);

  if (isLoading) {
    return (
      <div className='flex-1 w-full h-full flex items-center justify-center bg-c1'>
        <div className='flex flex-col items-center gap-4'>
          <Skeleton className='w-[300px] h-[300px] rounded-full' />
          <p className='text-c4 text-sm'>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!hierarchyData || (hierarchyData.children?.length || 0) === 0) {
    return (
      <div className='flex-1 w-full h-full flex flex-col justify-center items-center gap-8 py-50 bg-c1'>
        <div className='max-w-lg flex flex-col justify-center items-center gap-15'>
          <Network size={42} className='text-c4' />
          <div className='flex flex-col justify-center items-center gap-3'>
            <h2 className='text-c6 text-xl font-semibold'>Aucune donnée</h2>
            <p className='text-c4 text-sm text-center'>Aucune donnée disponible pour afficher le graphe hiérarchique.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='flex-1 w-full h-full bg-c1 overflow-hidden relative'>
      <div className='absolute top-4 left-4 z-10 bg-c2/80 backdrop-blur-sm rounded-8 p-3 text-xs text-c4'>Cliquez sur une catégorie (+) pour voir ses éléments</div>
      <svg ref={svgRef} className='w-full h-full' />
    </div>
  );
};
