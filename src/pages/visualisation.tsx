import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllItems } from '@/lib/Items';

import { motion, Variants } from 'framer-motion';
import { Toolbar } from '@/components/features/datavisualisation/Toolbar';
import ZoomControl from '@/components/features/datavisualisation/ZoomControl';

import { images } from '@/components/utils/images';
import {
  compareValues,
  FilterGroup,
  getDataByType,
  getPropertyValue,
  ITEM_TYPES,
  storeSearchHistory,
} from '@/components/features/datavisualisation/FilterPopup';
import OverlaySelector, { PredefinedFilter } from '@/components/features/datavisualisation/OverlaySelector';
import { getLinksFromType } from '@/lib/Links';
import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, useDisclosure } from '@heroui/react';
import { FileIcon, SearchIcon, Sidebar } from '@/components/utils/icons';
import SearchHistory from '@/components/features/datavisualisation/SearchHistory';
import { useSearchParams } from 'react-router-dom';
import { EditModal } from '@/components/features/database/EditModal';
import { useLocalStorageProperties } from './database';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';
import { CreateModal } from '@/components/features/database/CreateModal';
import { Layouts } from '@/components/layout/Layouts';



const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

export interface GeneratedImage {
  dataUrl: string;
  width: number;
  height: number;
}

// Fonction de mapping des types de nœud aux configurations
const getConfigKey = (nodeType: string): string | null => {
  const typeMap: Record<string, string> = {
    conference: 'conferences',
    citation: 'citations',
    actant: 'conferenciers',
    bibliography: 'bibliography',
    mediagraphie: 'mediagraphie',
    pays: 'pays',
    laboratory: 'laboratoire',
    school: 'ecolesdoctorales',
    university: 'universites',
    keyword: 'motcles',
    collection: 'collection',
  };
  return typeMap[nodeType] || null;
};

const predefinedFilters: PredefinedFilter[] = [
  {
    label: 'Rechercher tous les actants liés au mot clés “trucage”',
    groups: [
      {
        // Changé de group à groups (tableau)
        name: 'Mots clés liés à "trucage"',
        isExpanded: true,
        itemType: 'keyword',
        conditions: [
          {
            property: 'title',
            operator: 'contains',
            value: 'trucage',
          },
        ],
        visibleTypes: ['keyword'],
      },
    ],
  },
  {
    label: 'Rechercher toutes les conférences liés au “art trompeur” ',
    groups: [
      {
        name: 'Conférences liées à "art trompeur"',
        isExpanded: false,
        itemType: 'conference',
        conditions: [
          {
            property: 'mot-clé',
            operator: 'contains',
            value: 'art trompeur',
          },
        ],
        visibleTypes: Object.values(ITEM_TYPES),
      },
    ],
  },
  {
    label: 'Rechercher tous les mots clés liés à “Renée Bourassa”',
    groups: [
      {
        name: 'Mots-clés liés à "Renée Bourassa"',
        isExpanded: false,
        itemType: 'mot-clé',
        conditions: [
          {
            property: 'lié à',
            operator: 'contains',
            value: 'Renée Bourassa',
          },
        ],
        visibleTypes: Object.values(ITEM_TYPES),
      },
    ],
  },
  {
    label: 'Rechercher tous les items liés à “Jean Marc Larrue”',
    groups: [
      {
        name: 'Items liés à "Jean Marc Larrue"',
        isExpanded: false,
        itemType: 'item',
        conditions: [
          {
            property: 'lié à',
            operator: 'contains',
            value: 'Jean Marc Larrue',
          },
        ],
        visibleTypes: Object.values(ITEM_TYPES),
      },
    ],
  },
  {
    label: 'Rechercher toutes les bibliographies liées au mot clés “tromperie” ',
    groups: [
      {
        name: 'Bibliographies liées à "tromperie"',
        isExpanded: false,
        itemType: 'bibliographie',
        conditions: [
          {
            property: 'mot-clé',
            operator: 'contains',
            value: 'tromperie',
          },
        ],
        visibleTypes: Object.values(ITEM_TYPES),
      },
    ],
  },
  {
    label: "Rechercher toutes les citations lié à l'intelligence artificiel",
    groups: [
      {
        name: "Citations liées à l'intelligence artificielle",
        isExpanded: false,
        itemType: 'citation',
        conditions: [
          {
            property: 'mot-clé',
            operator: 'contains',
            value: 'intelligence artificielle',
          },
        ],
        visibleTypes: Object.values(ITEM_TYPES),
      },
    ],
  },
];

const Visualisation = () => {
  const [itemsDataviz, setItemsDataviz] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<any[]>([]);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const resetActiveIconFunc = useRef<(() => void) | null>(null);
  const [exportEnabled, setExportEnabled] = useState(false);
  const [searchParams] = useSearchParams();

  const [currentItemUrl, setCurrentItemUrl] = useState('');
  const [selectedConfigKey, setSelectedConfigKey] = useState<string | null>(null);
  const [, setSelectedConfig] = useState<string | null>(null);
  const { itemPropertiesData, propertiesLoading } = useLocalStorageProperties();

  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isOpenDrawer, onOpen: onOpenDrawer, onOpenChange: onOpenChangeDrawer } = useDisclosure();
  const { isOpen: isOpenAnnote, onOpen: onOpenAnnote, onClose: onCloseAnnote } = useDisclosure();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isAnnoteMode, setisAnnoteMode] = useState(false);

  const [viewAnnotationMode, setviewAnnotationMode] = useState(false);

  const [firstSelectedNode, setFirstSelectedNode] = useState<any>(null);
  const [secondSelectedNode, setSecondSelectedNode] = useState<any>(null);

  const [createItemId, setCreateItemId] = useState<number | null>(null);

  const [annoteObject, setAnnoteObject] = useState({
    id: '',
    content: '',
    type: '',
  });

  const linkModeRef = useRef({
    isSelecting: false,
    firstNode: null as any,
    secondNode: null as any,
    firstNodeCoords: null as any,
    secondNodeCoords: null as any,
  });

  const handleEditModeChange = useCallback((isActive: boolean) => {
    setIsEditMode(isActive);
  }, []);

  const handleLinkModeChange = useCallback((isActive: boolean) => {
    setIsLinkMode(isActive);
  }, []);

  const handleAddModeChange = useCallback((isActive: boolean) => {
    setIsAddMode(isActive);
  }, []);

  const handleAnnoteModeChange = useCallback((isActive: boolean) => {
    setisAnnoteMode(isActive);
  }, []);

  const handleCreateItem = useCallback(
    (num: number, config: string) => {
      setCreateItemId(num);
      setSelectedConfigKey(config);
      setSelectedConfig(config);
      onOpenCreate();
    },
    [onOpenCreate],
  );

  // Gestionnaire de clic sur un nœud
  const handleNodeClick = (d: any) => {
    const apiBase = 'https://tests.arcanes.ca/omk/api/';
    const itemUrl = `${apiBase}items/${d.id}`;
    console.log('Nœud cliqué:', d);
    setCurrentItemUrl(itemUrl);
    setSelectedConfigKey(getConfigKey(d.type));
    setSelectedConfig(d.type);
    onOpenEdit();

    // Gestion du mode liaison
    if (isLinkMode) {
      if (!linkModeRef.current.isSelecting) {
        // Premier nœud sélectionné
        console.log('Sélection du premier nœud:', d);
        linkModeRef.current.firstNode = d;
        linkModeRef.current.isSelecting = true;

        // Nettoyer tous les éléments de sélection précédents
        d3.select(svgRef.current).selectAll('.node-animated-circle').remove();
        d3.select(svgRef.current).selectAll('.temp-link').remove();

        // Ajouter le cercle animé au premier nœud
        addAnimatedCircleToNode(d);
        setFirstSelectedNode(d);
      } else {
        // Vérification que c'est bien un nœud différent
        const firstId = linkModeRef.current.firstNode?.id;
        const currentId = d?.id;

        if (firstId && currentId && firstId !== currentId) {
          console.log('Sélection du deuxième nœud:', d);
          linkModeRef.current.secondNode = d;
          setSecondSelectedNode(d);

          // IMPORTANT: Supprimer TOUS les cercles animés existants avant d'ajouter les nouveaux
          d3.select(svgRef.current).selectAll('.node-animated-circle').remove();

          // Re-ajouter le cercle au premier nœud
          addAnimatedCircleToNode(linkModeRef.current.firstNode);

          // Ajouter le cercle au deuxième nœud
          addAnimatedCircleToNode(d);

          // Supprimer la ligne temporaire
          d3.select(svgRef.current).select('.temp-link').remove();
        } else {
          console.log('Même nœud sélectionné ou données invalides, opération ignorée');
          // Annuler la sélection si on reclique sur le même nœud
          d3.select(svgRef.current).selectAll('.temp-link').remove();
          d3.select(svgRef.current).selectAll('.node-animated-circle').remove();
          d3.select(svgRef.current).on('mousemove', null);

          linkModeRef.current.isSelecting = false;
          linkModeRef.current.firstNode = null;
          linkModeRef.current.secondNode = null;
          setFirstSelectedNode(null);
          setSecondSelectedNode(null);
        }
      }
    }
    if (isAnnoteMode) {
      setAnnoteObject({
        id: d.id,
        content: d.fullTitle, // Assurez-vous que cela correspond à ce que vous voulez
        type: d.type,
      });

      onOpenAnnote();
    }
  };

  // Fonction helper pour ajouter un cercle animé à un nœud
  const addAnimatedCircleToNode = (node: any) => {
    const validTypes = ['keyword', 'university', 'school', 'laboratory', 'conference', 'citation', 'actant'];

    if (!validTypes.includes(node.type)) return;

    d3.select(svgRef.current)
      .selectAll('.node-circle')
      .filter((n: any) => n && n.id === node.id)
      .each(function () {
        const circle = d3.select(this as SVGCircleElement);
        const parent = d3.select((this as SVGCircleElement).parentNode as SVGGElement);

        const r = parseFloat(circle.attr('r')) || 10;
        const cx = parseFloat(circle.attr('cx')) || 0;
        const cy = parseFloat(circle.attr('cy')) || 0;

        parent
          .append('circle')
          .attr('class', 'node-animated-circle')
          .attr('r', r)
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('fill', 'none')
          .attr('stroke', 'white')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '32 24')
          .style('pointer-events', 'none')
          .style('animation', 'spin 10s linear infinite');
      });
  };

  function CancelLink() {
    // Nettoyer tous les éléments visuels de la liaison
    d3.select(svgRef.current).selectAll('.node-animated-circle').remove();
    d3.select(svgRef.current).selectAll('.temp-link').remove();

    // Supprimer les event listeners de suivi de la souris
    d3.select(svgRef.current).on('mousemove', null);

    // Réinitialiser les états du mode liaison
    linkModeRef.current.isSelecting = false;
    linkModeRef.current.firstNode = null;
    linkModeRef.current.secondNode = null;

    // Réinitialiser les états React
    setFirstSelectedNode(null);
    setSecondSelectedNode(null);

    // Optionnel : réinitialiser le style des nœuds
    d3.select(svgRef.current).selectAll('.node-circle').attr('stroke', null).attr('stroke-width', null);

    console.log('Mode liaison annulé');
  }

  // Réinitialiser les états quand le mode lien est désactivé
  useEffect(() => {
    if (!isLinkMode) {
      linkModeRef.current.isSelecting = false;
      linkModeRef.current.firstNode = null;
      linkModeRef.current.secondNode = null;
      setFirstSelectedNode(null);
      setSecondSelectedNode(null);

      // Réinitialiser les effets visuels
      d3.select(svgRef.current).selectAll('.node-circle').attr('stroke', null).attr('stroke-width', null);
    }
  }, [isLinkMode]);

  // Fonction pour enregistrer la référence à setActiveIcon(null)
  const setResetActiveIconRef = useCallback((resetFunc: () => void) => {
    resetActiveIconFunc.current = resetFunc;
  }, []);

  const [dimensions, setDimensions] = useState({
    width: 1450,
    height: 1080,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllItems();
      setItemsDataviz(data);
    };
    fetchData();
  }, []);

  const handleExportClick = async () => {
    try {
      const image = await generateVisualizationImage();
      setGeneratedImage(image);
      return image;
    } catch (error) {
      console.error('Error generating visualization image:', error);
      throw error;
    }
  };

  const applyFiltersAndPrepareVisualization = async (groups: FilterGroup[]) => {
    console.log('Début de filtrage avec groupes:', groups);

    if (!groups || groups.length === 0) {
      console.warn('Aucun groupe de filtres fourni');
      return {
        allFilteredItems: [],
        groupResults: new Map(),
        typesInUse: [],
        visualizationData: { nodes: [], links: [] },
      };
    }

    const allFilteredItems: any[] = [];
    const groupResults: Map<string, any[]> = new Map();

    // Phase 1: Filtrer les éléments par groupe
    for (const group of groups) {
      if (!group.itemType) {
        console.warn("Groupe sans type d'item spécifié:", group);
        continue;
      }

      //console.log(`Traitement du groupe: ${group.name}, type: ${group.itemType}`);

      try {
        const items = await getDataByType(group.itemType);
        //console.log(`${items.length} items récupérés pour le type ${group.itemType}`);

        const groupFilteredItems = [];

        for (const item of items) {
          let matchesAllConditions = true;

          for (const condition of group.conditions) {
            if (!condition.property || condition.value === undefined || condition.value === null) {
              console.log('Condition incomplète ignorée:', condition);
              continue;
            }

            try {
              const itemValue = await getPropertyValue(item, condition.property);
              //console.log(`Comparaison: ${itemValue} ${condition.operator} ${condition.value}`);
              const matches = await compareValues(itemValue, condition.value, condition.operator);

              if (!matches) {
                matchesAllConditions = false;
                break;
              }
            } catch (error) {
              console.error('Erreur lors du traitement de la condition:', error);
              matchesAllConditions = false;
              break;
            }
          }

          if (matchesAllConditions) {
            try {
              const links = await getLinksFromType(item, group.itemType);
              const title = item.title || (await getPropertyValue(item, 'title')) || 'Sans titre';

              //console.log(`Item correspondant trouvé: ${title} (${item.id})`);

              const resultItem = {
                id: item.id,
                type: group.itemType,
                title,
                links,
                groupId: group.name,
              };

              groupFilteredItems.push(resultItem);
              allFilteredItems.push(resultItem);
            } catch (error) {
              console.error("Erreur lors de l'ajout de l'item au résultat:", error);
            }
          }
        }

        //console.log(`${groupFilteredItems.length} items filtrés pour le groupe ${group.name}`);

        // Stocker les résultats de ce groupe spécifique
        const groupId = group.name;
        groupResults.set(groupId, groupFilteredItems);
      } catch (error) {
        console.error(`Erreur lors du traitement du groupe ${group.name}:`, error);
      }
    }

    //console.log(`Total d'items filtrés: ${allFilteredItems.length}`);

    if (allFilteredItems.length === 0) {
      console.warn('Aucun item ne correspond aux critères de filtrage');
      return {
        allFilteredItems: [],
        groupResults,
        typesInUse: [],
        visualizationData: { nodes: [], links: [] },
      };
    }

    // Phase 2: Construire la visualisation à partir des éléments filtrés
    //console.log('Début de la construction de la visualisation');

    const CHARACTER_LIMIT = 10;
    const nodes = new Map();
    const links = new Set();
    const typesInUse = new Set<string>();

    // Créer une map des groupes pour un accès facile
    const groupsMap = new Map<string, FilterGroup>();
    groups.forEach((group) => groupsMap.set(group.name, group));

    // Ajouter d'abord tous les nœuds principaux (résultats directs de la recherche)
    allFilteredItems.forEach((item) => {
      const group = groupsMap.get(item.groupId);
      if (!group || !group.visibleTypes?.includes(item.type)) {
        return;
      }

      if (!nodes.has(item.id)) {
        let title = item.title || 'Sans titre';
        if (item.type === 'actant' && title.includes(' ')) {
          const [firstName, ...lastName] = title.split(' ');
          title = `${firstName.charAt(0)}. ${lastName.join(' ')}`;
        }

        nodes.set(item.id, {
          id: item.id,
          title: title.length > CHARACTER_LIMIT ? `${title.substring(0, CHARACTER_LIMIT)}...` : title,
          fullTitle: title,
          type: item.type,
          isMain: true,
          groupId: item.groupId,
        });

        typesInUse.add(item.type);
        //console.log(`Nœud principal ajouté: ${title} (${item.id})`);
      }
    });

    //console.log(`${nodes.size} nœuds principaux ajoutés`);

    // Pour chaque item filtré, ajouter ses liens selon les types visibles de son groupe
    allFilteredItems.forEach((item) => {
      if (!item.links || !Array.isArray(item.links)) {
        return;
      }

      const group = groupsMap.get(item.groupId);
      if (!group) {
        return;
      }

      //console.log(`Traitement des liens pour ${item.id}, ${item.links.length} liens trouvés`);

      item.links.forEach((linkedId: string) => {
        if (!linkedId) {
          console.warn('ID de lien invalide détecté');
          return;
        }

        let linkedItem;

        // Essayer de trouver l'item lié dans itemsDataviz
        if (itemsDataviz && Array.isArray(itemsDataviz)) {
          linkedItem = itemsDataviz.find((d) => d.id === linkedId);
        }

        // Si pas trouvé et que l'ID est dans nos résultats filtrés, utiliser celui-ci
        if (!linkedItem) {
          linkedItem = allFilteredItems.find((d) => d.id === linkedId);
        }

        if (!linkedItem) {
          console.warn(`Item lié non trouvé: ${linkedId}`);
          return;
        }

        // Vérifier si le type de l'élément lié est visible dans le groupe de l'item principal
        if (!linkedItem.type || !group.visibleTypes.includes(linkedItem.type)) {
          console.log(
            `Lien ignoré car type non visible dans le groupe ${item.groupId}: ${linkedId} (${linkedItem.type})`,
          );
          return;
        }

        // Ici, nous ne filtrons plus en fonction de l'appartenance au groupe,
        // seulement en fonction du type visible
        if (!nodes.has(linkedId)) {
          let linkedTitle = linkedItem.title || 'Sans titre';
          if (linkedItem.type === 'actant' && linkedTitle.includes(' ')) {
            const [firstName, ...lastName] = linkedTitle.split(' ');
            linkedTitle = `${firstName.charAt(0)}. ${lastName.join(' ')}`;
          }

          nodes.set(linkedId, {
            id: linkedId,
            fullTitle: linkedTitle,
            title:
              linkedTitle.length > CHARACTER_LIMIT ? `${linkedTitle.substring(0, CHARACTER_LIMIT)}...` : linkedTitle,
            type: linkedItem.type,
            // Si l'élément lié est un résultat principal d'un autre groupe, marquer comme principal
            isMain: allFilteredItems.some((fi) => fi.id === linkedId),
            parentNodeId: item.id,
            // Conserver le groupe d'origine s'il existe, sinon utiliser le groupe parent
            groupId: linkedItem.groupId || item.groupId,
          });

          typesInUse.add(linkedItem.type);
          //console.log(`Nœud lié ajouté: ${linkedTitle} (${linkedId})`);
        }

        const linkObject = JSON.stringify({
          source: item.id,
          target: linkedId,
          groupId: item.groupId,
        });

        links.add(linkObject);
        //console.log(`Lien ajouté: ${item.id} -> ${linkedId}`);
      });
    });

    const nodesArray = Array.from(nodes.values());
    const linksArray = Array.from(links).map((link) => JSON.parse(link as string));

    //console.log(`Visualisation construite: ${nodesArray.length} nœuds, ${linksArray.length} liens`);
    // Mettre à jour l'état si nécessaire
    if (typeof setFilteredNodes === 'function') {
      setFilteredNodes(nodesArray);
    }
    if (typeof setFilteredLinks === 'function') {
      setFilteredLinks(linksArray);
    }
    if (typeof setExportEnabled === 'function') {
      setExportEnabled(true);
    }

    // Stocker l'historique de recherche si la fonction existe
    if (typeof storeSearchHistory === 'function') {
      storeSearchHistory(groups);
    }

    const result = {
      allFilteredItems,
      groupResults,
      typesInUse: Array.from(typesInUse),
      visualizationData: {
        nodes: nodesArray,
        links: linksArray,
      },
    };

    //console.log('Résultat final:', result);
    return result;
  };

  const handleSearch = (groups: FilterGroup[]) => {
    const res = applyFiltersAndPrepareVisualization(groups);
    console.log(res);
    setShowOverlay(false);
  };

  useEffect(() => {
    if (!filteredNodes.length) return;
    clearSvg();
    const svg = d3.select(svgRef.current);
    const zoomGroup = svg.append('g').attr('class', 'zoom-group');

    const defs = zoomGroup.append('defs');

    // Définitions des patterns pour les nœuds
    filteredNodes.forEach((node) => {
      const patternId = `node-pattern-${node.type}`;

      if (!defs.select(`#${patternId}`).node()) {
        defs
          .append('pattern')
          .attr('id', patternId)
          .attr('patternUnits', 'objectBoundingBox')
          .attr('width', 1)
          .attr('height', 1)
          .append('image')
          .attr('href', getImageForType(node.type))
          .attr('width', getRadiusForType(node.type))
          .attr('height', getRadiusForType(node.type))
          .attr('preserveAspectRatio', 'xMidYMid slice');
      }
    });

    // Créer des copies fraîches des nœuds pour la simulation
    const simulationNodes = filteredNodes.map((node: any) => ({
      ...node,
      x: node.x || dimensions.width / 2 + (Math.random() - 0.5) * 100,
      y: node.y || dimensions.height / 2 + (Math.random() - 0.5) * 100,
      fx: node.fx,
      fy: node.fy,
    }));

    // Créer des copies fraîches des liens avec référence directe aux objets nœuds
    const simulationLinks = filteredLinks.map((link: any) => {
      const sourceNode = simulationNodes.find((node: any) => node.id === link.source);
      const targetNode = simulationNodes.find((node: any) => node.id === link.target);
      return { source: sourceNode, target: targetNode };
    });

    const simulation = d3
      .forceSimulation(simulationNodes as any)
      .force(
        'link',
        d3
          .forceLink(simulationLinks)
          .id((d: any) => d.id)
          .distance(300),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(100));

    const link = zoomGroup
      .append('g')
      .selectAll('line')
      .data(simulationLinks)
      .join('line')
      .attr('stroke', 'hsl(var(--heroui-c6))')
      .attr('stroke-width', 1);

    // Créer des groupes de nœuds
    const nodeGroup = zoomGroup.append('g').selectAll('g').data(simulationNodes).join('g');

    // Ajouter le cercle principal à chaque groupe
    nodeGroup
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d: any) => getRadiusForType(d.type) / 2)
      .attr('fill', (d: any) => {
        const patternId = `node-pattern-${d.type}`;
        return `url(#${patternId})`;
      });

    // Ajouter le texte à l'intérieur du même groupe
    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d: any) => d.title)
      .attr('class', 'node-text')
      .attr('font-size', (d: any) => getSizeForType(d.type))
      .attr('fill', 'hsl(var(--heroui-c6))')
      .attr('font-family', 'Inter, sans-serif')
      .style('user-select', 'none')
      .style('pointer-events', 'none');

    // Gestion du hover sur les groupes
    nodeGroup
      .on('mouseover', function (_event, d) {
        const allowedTypes = ['keyword', 'university', 'school', 'laboratory', 'conference', 'citation', 'actant'];

        // Si le mode annotation est activé, filtrer les types autorisés
        if (
          (!isAnnoteMode && allowedTypes.includes(d.type)) ||
          (isAnnoteMode && ['mediagraphie', 'bibliography', 'citation', 'conference'].includes(d.type))
        ) {
          const currentRadius = getRadiusForType(d.type) / 2;
          let offset = -2;

          let innerStrokeRadius;
          if (['keyword', 'university', 'school', 'laboratory'].includes(d.type)) {
            innerStrokeRadius = currentRadius * 0.72;
            offset = -2;
          } else if (['bibliography', 'mediagraphie', 'citation'].includes(d.type)) {
            innerStrokeRadius = currentRadius * 0.72;
            offset = -3;
          } else {
            innerStrokeRadius = currentRadius * 0.7;
            offset = -4;
          }

          let colorStroke = 'hsl(var(--heroui-c6))';
          if (isEditMode) colorStroke = 'hsl(var(--heroui-datavisOrange))';
          if (isLinkMode) colorStroke = 'hsl(var(--heroui-datavisBlue))';
          if (isAnnoteMode) colorStroke = 'hsl(var(--heroui-datavisYellow))';

          d3.select(this).attr('class', 'pointer-cursor');
          d3.select(this)
            .append('circle')
            .attr('class', 'inner-stroke')
            .attr('r', innerStrokeRadius)
            .attr('fill', 'none')
            .attr('stroke', colorStroke)
            .attr('stroke-width', 2)
            .attr('cy', offset)
            .attr('cursor', 'pointer');
        }
      })
      .on('mouseout', function () {
        d3.select(this).selectAll('.inner-stroke').remove();
      })
      .on('click', function (_event, d) {
        const allowedTypes = ['keyword', 'university', 'school', 'laboratory', 'conference', 'citation', 'actant'];

        if (
          (!isAnnoteMode && allowedTypes.includes(d.type)) ||
          (isAnnoteMode && ['mediagraphie', 'bibliography', 'citation', 'conference'].includes(d.type))
        ) {
          handleNodeClick(d);
        }
      });

    // Configurer le drag sur les groupes
    const drag = d3
      .drag<SVGGElement, any>()
      .on('start', (event: any, d: any) => {
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any) => {
        if (!event.active && simulation) simulation.alphaTarget(0);
        // Conserver les positions fixes après le drag pour maintenir la stabilité
        // C'est un choix de conception, vous pouvez aussi les remettre à null
        // pour permettre aux nœuds de continuer à bouger
      });

    nodeGroup.call(drag as any);

    simulation.on('tick', () => {
      // Mettre à jour les positions des liens basées directement sur les objets
      // simulationNodes qui sont mis à jour par la simulation
      link
        .attr('x1', (d: any) => d.source.x ?? 0)
        .attr('y1', (d: any) => d.source.y ?? 0)
        .attr('x2', (d: any) => d.target.x ?? 0)
        .attr('y2', (d: any) => d.target.y ?? 0);

      // Positionner les groupes de nœuds
      nodeGroup.attr('transform', (d: any) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Fonction pour réajuster la simulation lors de redimensionnements
    const handleResize = () => {
      simulation.force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2));
      simulation.alpha(0.3).restart(); // Redémarrer avec une force alpha modérée
    };

    // Appliquer immédiatement et quand les dimensions changent
    handleResize();

    return () => {
      if (simulation) simulation.stop();
    };
  }, [filteredNodes, filteredLinks, dimensions, isEditMode, isLinkMode, isAnnoteMode]);

  const getImageForType = (type: string) => {
    return images[type] || images['conf'];
  };

  const getRadiusForType = (type: string) => {
    const radii: { [key: string]: number } = {
      conf: 250,
      bibliography: 200,
      actant: 250,
      mediagraphie: 200,
      citation: 200,
      keyword: 150,
      university: 150,
      school: 150,
      laboratory: 150,
      collection: 250,
    };
    return radii[type] || 250;
  };

  const getSizeForType = (type: string) => {
    const sizes: { [key: string]: string } = {
      conf: '18px',
      bibliography: '16px',
      actant: '18px',
      mediagraphie: '16px',
      citation: '16px',
      keyword: '14px',
      university: '14px',
      school: '14px',
      laboratory: '14px',
      collection: '18px',
    };
    return sizes[type] || '16px';
  };

  const generateVisualizationImage = async (): Promise<GeneratedImage> => {
    const svg = svgRef.current;
    console.log(svg);
    if (!svg) {
      throw new Error('SVG reference not found');
    }

    const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [];
    const width = viewBox[2] || svg.getBoundingClientRect().width;
    const height = viewBox[3] || svg.getBoundingClientRect().height;

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;

    const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');

    backgroundRect.setAttribute('fill', '#000');

    clonedSvg.insertBefore(backgroundRect, clonedSvg.firstChild);
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());

    const images = Array.from(clonedSvg.querySelectorAll('image'));
    await Promise.all(
      images.map((img) => {
        return new Promise<void>((resolve, reject) => {
          const href = img.getAttribute('href');
          if (!href) {
            reject(new Error('Image href not found'));
            return;
          }

          const imageElement = new Image();
          imageElement.onload = () => resolve();
          imageElement.onerror = () => reject(new Error('Failed to load image'));
          imageElement.src = href;
        });
      }),
    );

    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.scale(scale, scale);

      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/png');
      return { dataUrl, width, height };
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // Fonction pour gérer la connexion entre deux nœuds
  const handleConnect = () => {
    console.log(`Connexion entre tototoototot`);

    // Réinitialiser les nœuds sélectionnés après connexion
    setFirstSelectedNode('');
    setSecondSelectedNode('');

    // Désactiver le mode lien après connexion
    setIsLinkMode(false);
  };

  const saveFilterGroups = (filterGroups: FilterGroup[]): void => {
    try {
      const serializedData = JSON.stringify(filterGroups);
      localStorage.setItem('filterGroups', serializedData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des filtres:', error);
    }
  };

  const handleOverlaySelect = (groups: FilterGroup[]) => {
    handleSearch(groups);
    saveFilterGroups(groups);
    storeSearchHistory(groups);
    setShowOverlay(false);
  };

  const clearSvg = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
  };

  useEffect(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const decoded = decodeURIComponent(configParam);
        const maybeStringifiedArray = JSON.parse(decoded);

        // Si le résultat est une string (encodée deux fois), on parse encore
        const parsed =
          typeof maybeStringifiedArray === 'string' ? JSON.parse(maybeStringifiedArray) : maybeStringifiedArray;

        handleOverlaySelect(parsed);
      } catch (e) {
        console.error('Erreur de parsing double :', e);
      }
    }
  }, [searchParams]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
    
    <div className='relative h-screen bg-c1 overflow-y-hidden'>
      <motion.main
        className='mx-auto h-full w-full transition-all ease-in-out duration-200'
        initial='hidden'
        animate='visible'
        variants={containerVariants}>
        <div className='mt-0 z-100'>
          <Button
            onPress={onOpenDrawer}
            size='lg'
            className='absolute px-4 py-4 flex justify-between bg-c2 gap-2 hover:bg-c3 hover:opacity-100 text-c6 rounded-8 z-50'>
            <Sidebar size={26} />
          </Button>
        </div>
        <motion.div
          className='relative w-full h-full'
          variants={containerVariants}
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          initial='hidden'
          animate='visible'>
          {showOverlay && <OverlaySelector filters={predefinedFilters} onSelect={handleOverlaySelect} />}
          <svg
            className='rounded-12'
            ref={svgRef}
            xmlns='http://www.w3.org/2000/svg'
            width={dimensions.width}
            height={dimensions.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}></svg>
          <div className='absolute bottom-[100px] right-0 z-[50]'>
            <ZoomControl availableControl={!showOverlay} svgRef={svgRef} />
          </div>
        </motion.div>
      </motion.main>
      {/* Drawer à gauche */}
      <Drawer isOpen={isOpenDrawer} hideCloseButton placement='left' onOpenChange={onOpenChangeDrawer}>
        <DrawerContent className='bg-c1 z-[52] flex flex-col gap-4'>
          {(onClose) => (
            <>
              <DrawerHeader className='flex flex-row items-center justify-between text-c6'>
                <Button
                  onPress={onClose}
                  size='lg'
                  className='px-4 py-4 flex justify-between  bg-c2 text-c6 rounded-8 hover:bg-c3 '>
                  <Sidebar size={28} />
                </Button>
                <Button
                  onPress={() => {
                    onClose?.();
                    setShowOverlay(true);
                    setExportEnabled(false);
                    clearSvg();
                    // Appeler la fonction si elle existe
                    if (resetActiveIconFunc.current) {
                      resetActiveIconFunc.current();
                    }
                  }}
                  size='lg'
                  className='px-4 py-4 flex justify-between  bg-c2 text-c6 rounded-8 hover:bg-c3 '>
                  Nouvelle recherche
                  <SearchIcon size={18} />
                </Button>
              </DrawerHeader>
              <DrawerBody className='text-c6 flex flex-col gap-8'>
                <a
                  href='/recherche'
                  className='text-c6 flex flex-row gap-4 border-2 border-c3  hover:border-c4 rounded-12 transition w-fit p-3'>
                  <FileIcon size={20} />
                  <div>Cahier de recherche</div>
                </a>
                <SearchHistory
                  onSelectSearch={(filters) => {
                    handleOverlaySelect(filters);
                  }}
                  onClose={onClose}
                />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <EditModal
        isOpen={isOpenEdit}
        onClose={onCloseEdit}
        itemUrl={currentItemUrl}
        activeConfig={selectedConfigKey}
        itemPropertiesData={itemPropertiesData}
        propertiesLoading={propertiesLoading}
        justView={!isEditMode}
      />
      {createItemId && (
        <CreateModal
          isOpen={isOpenCreate}
          onClose={onCloseCreate}
          activeConfig={selectedConfigKey}
          itemPropertiesData={itemPropertiesData}
          propertiesLoading={propertiesLoading}
          itemId={createItemId}
        />
      )}
      <AnnotationDropdown
        id={Number(annoteObject.id)}
        content={annoteObject.content}
        type={annoteObject.type}
        mode={viewAnnotationMode ? 'annotate' : 'view'}
        isOpen={isOpenAnnote}
        onClose={() => onCloseAnnote()}
      />
      ;
      <Toolbar
        onSearch={handleSearch}
        handleExportClick={handleExportClick}
        generatedImage={generatedImage}
        resetActiveIconRef={setResetActiveIconRef}
        onSelect={handleOverlaySelect}
        exportEnabled={exportEnabled}
        isEditMode={isEditMode}
        isLinkMode={isLinkMode}
        isAddMode={isAddMode}
        isAnnoteMode={isAnnoteMode}
        onViewToggle={setviewAnnotationMode}
        firstSelectedNode={firstSelectedNode}
        secondSelectedNode={secondSelectedNode}
        onConnect={handleConnect}
        onCancel={CancelLink}
        onEditToggle={handleEditModeChange}
        onLinkToggle={handleLinkModeChange}
        onAddToggle={handleAddModeChange}
        onAnnoteToggle={handleAnnoteModeChange}
        onCreateItem={handleCreateItem}
      />
    </div>
    </Layouts>
  );
};

export default Visualisation;
