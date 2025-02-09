import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { getAllItems } from '@/services/Items';

import { motion, Variants } from 'framer-motion';
import { Navbar } from '@/components/navbar/Navbar';
import { Toolbar } from '@/components/datavisualisation/Toolbar';
import ZoomControl from '@/components/datavisualisation/ZoomControl';
import Legend from '@/components/datavisualisation/Legend';

import { images } from '@/components/utils/images';

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

export interface GeneratedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const Visualisation = () => {
  const [itemsDataviz, setItemsDataviz] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<any[]>([]);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

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
      const data = await getAllItems();
      setItemsDataviz(data);
    };
    fetchData();
  }, []);

  const handleExportClick = async () => {
    try {
      const image = await generateVisualizationImage();
      setGeneratedImage(image);
      return image; // Retourne l'image pour indiquer qu'elle est prête
    } catch (error) {
      console.error('Error generating visualization image:', error);
      throw error;
    }
  };

  const processDataForVisualization = (data: any[]) => {
    if (!data?.length) return;

    const CHARACTER_LIMIT = 10;
    const nodes = new Map();
    const links = new Set();

    data.forEach((item) => {
      if (!nodes.has(item.id)) {
        let title = item.title;
        if (item.type === 'actant' && title.includes(' ')) {
          const [firstName, ...lastName] = title.split(' ');
          title = `${firstName.charAt(0)}. ${lastName.join(' ')}`;
          item.title = title;
        }

        nodes.set(item.id, {
          id: item.id,
          title: item.title.length > CHARACTER_LIMIT ? `${item.title.substring(0, CHARACTER_LIMIT)}...` : item.title,
          type: item.type,
          isMain: false,
        });
      }
    });

    data.forEach((item) => {
      if (!Array.isArray(item.links)) return;

      item.links.forEach((linkedId: string) => {
        if (nodes.has(linkedId)) {
          links.add(
            JSON.stringify({
              source: item.id,
              target: linkedId,
            }),
          );
        } else {
          const linkedItem = itemsDataviz.find((d) => d.id === linkedId);
          if (linkedItem) {
            let linkedTitle = linkedItem.title;
            if (linkedItem.type === 'actant' && linkedTitle.includes(' ')) {
              const [firstName, ...lastName] = linkedTitle.split(' ');
              linkedTitle = `${firstName.charAt(0)}. ${lastName.join(' ')}`;
            }

            nodes.set(linkedId, {
              id: linkedId,
              title:
                linkedTitle.length > CHARACTER_LIMIT ? `${linkedTitle.substring(0, CHARACTER_LIMIT)}...` : linkedTitle,
              type: linkedItem.type,
              isMain: false,
            });
            links.add(
              JSON.stringify({
                source: item.id,
                target: linkedId,
              }),
            );
          }
        }
      });
    });

    setFilteredNodes(Array.from(nodes.values()));
    setFilteredLinks(Array.from(links).map((link) => JSON.parse(link as any)));
  };

  const handleSearch = (searchResults: any[]) => {
    if (!searchResults?.length) {
      console.warn('No search results found');
      return;
    }
    processDataForVisualization(searchResults);
  };

  useEffect(() => {
    if (!filteredNodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const zoomGroup = svg.append('g').attr('class', 'zoom-group');

    const defs = zoomGroup.append('defs');

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

    const link = zoomGroup
      .append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    const node = zoomGroup
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

    const label = zoomGroup
      .append('g')
      .selectAll('text')
      .data(simulationNodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d: any) => d.title)
      .attr('font-size', (d: any) => getSizeForType(d.type))
      .attr('fill', '#fff')
      .attr('font-family', 'Inter, sans-serif')
      .style('user-select', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x ?? 0)
        .attr('y1', (d: any) => d.source.y ?? 0)
        .attr('x2', (d: any) => d.target.x ?? 0)
        .attr('y2', (d: any) => d.target.y ?? 0);

      node.attr('cx', (d: any) => d.x ?? 0).attr('cy', (d: any) => d.y ?? 0);
      label.attr('x', (d: any) => d.x ?? 0).attr('y', (d: any) => d.y ?? 0);
    });

    return () => {
      if (simulation) simulation.stop();
    };
  }, [filteredNodes, filteredLinks, dimensions]);

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

  // Function to generate the image
  const generateVisualizationImage = async (): Promise<GeneratedImage> => {
    if (!svgRef.current) {
      throw new Error('SVG reference not found');
    }

    const svg = svgRef.current;
    const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [];
    const width = viewBox[2] || svg.getBoundingClientRect().width;
    const height = viewBox[3] || svg.getBoundingClientRect().height;

    // Create a deep clone of the SVG
    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;

    // Add white background
    const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');

    clonedSvg.insertBefore(backgroundRect, clonedSvg.firstChild);

    // Set explicit dimensions
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());

    // Wait for all images to load
    const images = Array.from(clonedSvg.querySelectorAll('image'));
    await Promise.all(
      images.map((img) => {
        return new Promise<void>((resolve, reject) => {
          const imageElement = img as SVGImageElement;
          if (imageElement.complete) {
            resolve();
          } else {
            imageElement.onload = () => resolve();
            imageElement.onerror = () => reject(new Error('Failed to load image'));
          }
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
      const scale = 2; // For better quality
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/png');
      return { dataUrl, width, height };
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className='relative h-screen bg-50 overflow-y-hidden'>
      <motion.main
        className='mx-auto h-full max-w-screen-2xl w-full max-w-xl xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'
        initial='hidden'
        animate='visible'
        variants={containerVariants}>
        <motion.div className='col-span-10' variants={itemVariants}>
          <Navbar />
        </motion.div>
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
            xmlns='http://www.w3.org/2000/svg'
            width={dimensions.width}
            height={dimensions.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}></svg>
        </motion.div>
      </motion.main>
      <Toolbar
        itemsDataviz={itemsDataviz}
        onSearch={handleSearch}
        handleExportClick={handleExportClick}
        generatedImage={generatedImage}
      />
      <ZoomControl svgRef={svgRef} width={dimensions.width} height={dimensions.height} />
      <Legend />
    </div>
  );
};

export default Visualisation;
