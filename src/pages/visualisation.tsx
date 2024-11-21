import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { getCollections } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const Visualisation: React.FC = () => {
  const width = 1920;
  const height = 1080;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous elements

    // Add defs for pattern
    const defs = svg.append('defs');
    defs
      .append('pattern')
      .attr('id', 'jon-snow')
      .attr('patternUnits', 'objectBoundingBox') // Use global coordinates
      .attr('width', 10) // Adjust pattern width for better scaling
      .attr('height', 10) // Adjust pattern height for better scaling
      .append('image')
      .attr('href', 'bubble.png') // Image source
      .attr('width', 200) // Increased size (maintain high quality)
      .attr('height', 200) // Increased size (maintain high quality)
      .attr('preserveAspectRatio', 'xMidYMid slice'); // Ensure proper cropping

    // Example data
    const nodes = [{ id: 'Node 1' }, { id: 'Node 2' }, { id: 'Node 3' }, { id: 'Node 4' }, { id: 'Node 5' }];
    const links = [
      { source: 'Node 1', target: 'Node 2' },
      { source: 'Node 1', target: 'Node 3' },
      { source: 'Node 3', target: 'Node 4' },
      { source: 'Node 4', target: 'Node 5' },
    ];

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(200),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Add links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    // Add nodes
    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 100) // Adjusted size for the larger bubble
      .attr('fill', 'url(#jon-snow)')
      .call(
        d3
          .drag()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Add labels
    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', 12)
      .attr('y', 4)
      .text((d: any) => d.id)
      .attr('font-size', '10px')
      .attr('fill', '#333');

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

      label.attr('x', (d: any) => d.x + 12).attr('y', (d: any) => d.y + 4);
    });

    // Cleanup function to stop simulation
    return () => simulation.stop();
  }, []);

  return (
    <motion.div variants={containerVariants} initial='hidden' animate='visible'>
      <svg ref={svgRef} width={width} height={height}></svg>
    </motion.div>
  );
};

export default Visualisation;
