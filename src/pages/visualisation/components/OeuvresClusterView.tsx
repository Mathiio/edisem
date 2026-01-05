import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { getRecitsArtistiques, getRecitsTechnoIndustriels, getRecitsScientifiques, getRecitsMediatiques, getRecitsCitoyens } from '@/services/Items';

// Note: Les fonctions dans Items.ts sont:
// - getRecitsArtistiques (type: 'oeuvre')
// - getRecitsScientifiques (type: 'recitScientifique')
// - getRecitsTechnoIndustriels (type: 'recitTechnoIndustriel')
// - getRecitsCitoyens (type: 'recitCitoyen')
// - getRecitsMediatiques (type: 'recitMediatique')
import { Skeleton } from '@heroui/react';
import { Sparkles } from 'lucide-react';

// Types pour la hiérarchie D3
interface HierarchyNode {
  name: string;
  type?: string;
  id?: string;
  children?: HierarchyNode[];
  itemCount?: number;
}

// Labels et couleurs pour chaque type de récit
const RECIT_TYPES = {
  oeuvre: { label: 'Récits Artistiques', color: '#f43f5e' },
  recitScientifique: { label: 'Récits Scientifiques', color: '#3b82f6' },
  recitTechnoIndustriel: { label: 'Récits Techno-industriels', color: '#8b5cf6' },
  recitCitoyen: { label: 'Récits Citoyens', color: '#10b981' },
  recitMediatique: { label: 'Récits Médiatiques', color: '#f59e0b' },
};

interface RecitsClusterViewProps {
  onNodeClick?: (node: { id: string; type: string; name: string }) => void;
}

export const OeuvresClusterView: React.FC<RecitsClusterViewProps> = ({ onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [recits, setRecits] = useState<Map<string, any[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Fetch de tous les récits
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Chargement des récits...');

        const [artistiques, scientifiques, technoIndustriels, citoyens, mediatiques] = await Promise.all([
          getRecitsArtistiques().catch((e) => {
            console.error('Erreur artistiques:', e);
            return [];
          }),
          getRecitsScientifiques().catch((e) => {
            console.error('Erreur scientifiques:', e);
            return [];
          }),
          getRecitsTechnoIndustriels().catch((e) => {
            console.error('Erreur techno:', e);
            return [];
          }),
          getRecitsCitoyens().catch((e) => {
            console.error('Erreur citoyens:', e);
            return [];
          }),
          getRecitsMediatiques().catch((e) => {
            console.error('Erreur mediatiques:', e);
            return [];
          }),
        ]);

        console.log('Récits chargés:', {
          artistiques: artistiques?.length || 0,
          scientifiques: scientifiques?.length || 0,
          technoIndustriels: technoIndustriels?.length || 0,
          citoyens: citoyens?.length || 0,
          mediatiques: mediatiques?.length || 0,
        });

        const recitsMap = new Map<string, any[]>();
        recitsMap.set('oeuvre', Array.isArray(artistiques) ? artistiques : []);
        recitsMap.set('recitScientifique', Array.isArray(scientifiques) ? scientifiques : []);
        recitsMap.set('recitTechnoIndustriel', Array.isArray(technoIndustriels) ? technoIndustriels : []);
        recitsMap.set('recitCitoyen', Array.isArray(citoyens) ? citoyens : []);
        recitsMap.set('recitMediatique', Array.isArray(mediatiques) ? mediatiques : []);

        setRecits(recitsMap);
      } catch (error) {
        console.error('Erreur lors du chargement des récits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  // Compter le total des récits
  const totalRecits = useMemo(() => {
    let total = 0;
    recits.forEach((items) => {
      total += items.length;
    });
    return total;
  }, [recits]);

  // Construire la hiérarchie
  const hierarchyData = useMemo(() => {
    if (!recits.size) return null;

    const hierarchy: HierarchyNode = {
      name: 'Mises en récits',
      children: [],
    };

    recits.forEach((items, type) => {
      const typeInfo = RECIT_TYPES[type as keyof typeof RECIT_TYPES];
      if (!typeInfo || items.length === 0) return;

      const maxItems = 50;

      const typeNode: HierarchyNode = {
        name: typeInfo.label,
        type: type,
        itemCount: items.length,
        children: items.slice(0, maxItems).map((item) => ({
          name: item.title || item.name || `Item ${item.id}`,
          id: String(item.id),
          type: type,
        })),
      };

      hierarchy.children!.push(typeNode);
    });

    // Trier par nombre d'items
    hierarchy.children?.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));

    return hierarchy;
  }, [recits]);

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

    // Fonction pour obtenir la couleur d'un type
    const getColor = (type?: string) => {
      if (!type) return '#fff';
      return RECIT_TYPES[type as keyof typeof RECIT_TYPES]?.color || '#6b7280';
    };

    // Liens
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('stroke', (d) => {
        const type = d.target.data.type || d.source.data.type;
        return getColor(type);
      })
      .attr('stroke-opacity', 0.4)
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
        return getColor(d.data.type);
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

        // Clic sur un item (depth 2) -> callback
        if (d.depth === 2 && d.data.id && onNodeClick) {
          onNodeClick({
            id: d.data.id,
            type: d.data.type || '',
            name: d.data.name,
          });
        }
      });

    // Labels
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
        if (d.depth === 1) return getColor(d.data.type);
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
  }, [hierarchyData, dimensions, isLoading, onNodeClick]);

  if (isLoading) {
    return (
      <div className='flex-1 w-full h-full flex items-center justify-center bg-c1'>
        <div className='flex flex-col items-center gap-4'>
          <Skeleton className='w-[300px] h-[300px] rounded-full' />
          <p className='text-c4 text-sm'>Chargement des récits...</p>
        </div>
      </div>
    );
  }

  if (!hierarchyData || totalRecits === 0) {
    return (
      <div className='flex-1 w-full h-full flex flex-col justify-center items-center gap-8 py-50 bg-c1'>
        <div className='max-w-lg flex flex-col justify-center items-center gap-15'>
          <Sparkles size={42} className='text-c4' />
          <div className='flex flex-col justify-center items-center gap-3'>
            <h2 className='text-c6 text-xl font-semibold'>Aucun récit</h2>
            <p className='text-c4 text-sm text-center'>Aucun récit disponible pour afficher.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='flex-1 w-full h-full bg-c1 overflow-hidden relative'>
      <div className='absolute top-4 left-4 z-10 bg-c2/80 backdrop-blur-sm rounded-8 p-3 text-xs text-c4'>{totalRecits} mises en récits de l'IA</div>
      <svg ref={svgRef} className='w-full h-full' />
    </div>
  );
};
