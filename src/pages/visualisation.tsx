import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { getItemsDataViz } from '@/services/api';

import { motion, Variants } from 'framer-motion';
import { Navbar } from '@/components/navbar/Navbar';
import { Toolbar } from '@/components/datavisualisation/Toolbar';
import { SearchHelper } from '@/components/datavisualisation/SearchHelper';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 10 } },
};

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

const Visualisation = () => {
  const [itemsDataviz, setItemsDataviz] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<any[]>([]);

  const [dimensions, setDimensions] = useState({
    width: 1450,
    height: 1080,
  });

  const containerRef = useRef(null);
  const svgRef = useRef(null);

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
      const data = await getItemsDataViz();
      setItemsDataviz(data as any);
      processDataForVisualization(data);
    };

    fetchData();
  }, []);

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

  const processDataForVisualization = (data: any[], selectedItemId = null) => {
    if (data.length === 0 || !selectedItemId) return;

    console.log(data);

    const item = data.find((dataItem) => dataItem.id === selectedItemId);

    if (!item || !item.links) {
      console.error('Item ou ses liens sont indéfinis :', item);
      return;
    }

    console.log(item);

    const caracter = 10;

    let nodes: any[] = [];
    let links: any[] = [];

    nodes.push({
      id: item.id,
      title: item.title.length > caracter ? item.title.substring(0, caracter) + '...' : item.title,
      type: item.type,
      isMain: true,
    });

    const linkedResources = data.filter((resource) => item.links.includes(resource.id));

    linkedResources.forEach((resource) => {
      nodes.push({
        id: resource.id,
        title: resource.title.length > caracter ? resource.title.substring(0, caracter) + '...' : resource.title,
        type: resource.type,
        isMain: false,
      });

      links.push({
        source: item.id,
        target: resource.id,
      });
    });

    linkedResources.forEach((resource) => {
      const innerLinks = resource.links;

      if (innerLinks && Array.isArray(innerLinks)) {
        innerLinks.forEach((linkedId) => {
          const linkedNode = linkedResources.find((r) => r.id === linkedId);

          if (linkedNode) {
            links.push({
              source: resource.id,
              target: linkedNode.id,
            });
          }
        });
      } else {
        console.warn("innerLinks est indéfini ou n'est pas un tableau :", innerLinks);
      }
    });

    nodes = Array.from(new Set(nodes.map((n) => JSON.stringify(n)))).map((n) => JSON.parse(n));
    links = Array.from(new Set(links.map((l) => JSON.stringify(l)))).map((l) => JSON.parse(l));

    setFilteredNodes(nodes);
    setFilteredLinks(links);
  };

  const handleSearch = (searchResults: string | any[]) => {
    console.log(searchResults);
    if (!searchResults || searchResults.length === 0) {
      console.warn('Aucun résultat de recherche');
      processDataForVisualization(itemsDataviz);
      return;
    }

    const selectedResult = searchResults[0];

    const itemToVisualize = itemsDataviz.find(
      (item) =>
        item.id === selectedResult.id ||
        (item.ressources && item.ressources.some((r: { id: any }) => r.id === selectedResult.id)),
    );

    if (itemToVisualize) {
      processDataForVisualization(itemsDataviz, itemToVisualize.id);
    } else {
      console.error('Aucun élément trouvé pour la recherche:', selectedResult);
    }
  };

  useEffect(() => {
    if (!filteredNodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

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

    const simulationNodes = filteredNodes.map((node: any) => ({
      ...node,
      x: undefined,
      y: undefined,
      fx: undefined,
      fy: undefined,
    }));

    const simulation = d3
      .forceSimulation(simulationNodes as any)
      .force(
        'link',
        d3
          .forceLink(filteredLinks)
          .id((d: any) => d.id)
          .distance(300),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(100));

    const link = svg
      .append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    const node = svg
      .append('g')
      .selectAll<SVGCircleElement, any>('circle')
      .data(simulationNodes)
      .join('circle')
      .attr('r', (d: any) => getRadiusForType(d.type) / 2)
      .attr('fill', (d: any) => {
        const patternId = `node-pattern-${d.type}`;
        return `url(#${patternId})`;
      });

    const drag = d3
      .drag<SVGCircleElement, any>()
      .on('start', (event: any, d: any) => {
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: any) => {
        if (!event.active && simulation) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    node.call(drag);

    const label = svg
      .append('g')
      .selectAll('text')
      .data(simulationNodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d: any) => d.title)
      .attr('font-size', (d: any) => getSizeForType(d.type))
      .attr('fill', '#fff')
      .attr('font-family', 'Inter, sans-serif');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x ?? 0)
        .attr('y1', (d: any) => d.source.y ?? 0)
        .attr('x2', (d: any) => d.target.x ?? 0)
        .attr('y2', (d: any) => d.target.y ?? 0);

      node.attr('cx', (d: any) => d.x ?? 0).attr('cy', (d: any) => d.y ?? 0);
      -label.attr('x', (d: any) => d.x ?? 0).attr('y', (d: any) => d.y ?? 0);
    });

    return () => {
      if (simulation) simulation.stop();
    };
  }, [filteredNodes, filteredLinks, dimensions]);

  const getImageForType = (type: string) => {
    const images: { [key: string]: string } = {
      conf: 'bulle1.png',
      bibliography: 'bulle2.png',
      actant: 'bulle7.png',
      mediagraphie: 'bulle3.png',
      citation: 'bulle6.png',
      keyword: 'bulle5.png',
      university: 'bulle4.png',
      school: 'bulle4.png',
      laboratory: 'bulle4.png',
    };
    return images[type] || 'bulle1.png';
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
    };
    return sizes[type] || '16px';
  };

  return (
    <div className='relative h-screen overflow-y-hidden'>
      <motion.main
        className='mx-auto h-full  max-w-screen-2xl w-full max-w-xl  xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'
        initial='hidden'
        animate='visible'
        variants={containerVariants}>
        <motion.div className='col-span-10' variants={itemVariants}>
          <Navbar />
        </motion.div>
        <SearchHelper items={itemsDataviz} />
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
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}></svg>
        </motion.div>
      </motion.main>
      <Toolbar itemsDataviz={itemsDataviz} onSearch={handleSearch} />
    </div>
  );
};
export default Visualisation;
