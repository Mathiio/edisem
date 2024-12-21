import { FC, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CenterIcon, ZoomInIcon, ZoomOutIcon } from '@/components/utils/icons';
import { Button } from '@nextui-org/react';

interface ZoomControlProps {
  svgRef: React.RefObject<SVGSVGElement>;
  width?: number;
  height?: number;
}

const ZoomControl: FC<ZoomControlProps> = ({ svgRef, width = 600, height = 400 }) => {
  const zoomBehavior = useRef(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 2]).on('zoom', handleZoom));

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

      if (svg.select('.zoom-group').empty()) {
        svg.append('g').attr('class', 'zoom-group');
      }

      svg.call(zoomBehavior.current);

      const existingElements = svg.selectAll('g:not(.zoom-group)');
      if (!existingElements.empty()) {
        const zoomGroup = svg.select('.zoom-group');
        existingElements.each(function () {
          const element = d3.select(this);
          if (element.attr('class') !== 'zoom-group') {
            const node = zoomGroup.node();
            if (node && node instanceof Element) {
              const currentNode = this as Node;
              node.appendChild(currentNode);
            }
          }
        });
      }
    }
  }, [svgRef]);

  function handleZoom(e: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    if (!svgRef.current) return;

    d3.select<SVGSVGElement, unknown>(svgRef.current).select('.zoom-group').attr('transform', e.transform.toString());
  }

  function zoomIn() {
    if (!svgRef.current) return;
    d3.select<SVGSVGElement, unknown>(svgRef.current).transition().call(zoomBehavior.current.scaleBy, 2);
  }

  function zoomOut() {
    if (!svgRef.current) return;
    d3.select<SVGSVGElement, unknown>(svgRef.current).transition().call(zoomBehavior.current.scaleBy, 0.5);
  }

  function resetZoom() {
    if (!svgRef.current) return;
    d3.select<SVGSVGElement, unknown>(svgRef.current)
      .transition()
      .call(zoomBehavior.current.transform, d3.zoomIdentity);
  }

  return (
    <div className='fixed bottom-25 right-25 rounded-8 p-2 bg-default-100 flex flex-col gap-3 shadow-lg'>
      <Button
        size='md'
        className='cursor-pointer group text-16 p-10 rounded-8 text-default-500 bg-default-100 hover:bg-default-action transition-all ease-in-out duration-200'
        onPress={zoomIn}>
        <ZoomInIcon
          size={20}
          className='text-default-500 group-hover:text-default-selected transition-all ease-in-out duration-200'
        />
      </Button>
      <Button
        size='md'
        className='cursor-pointer group text-16 p-10 rounded-8 text-default-500 bg-default-100 hover:bg-default-action transition-all ease-in-out duration-200'
        onPress={zoomOut}>
        <ZoomOutIcon
          size={20}
          className='text-default-500 group-hover:text-default-selected transition-all ease-in-out duration-200'
        />
      </Button>
      <Button
        size='md'
        className='cursor-pointer group text-16 p-10 rounded-8 text-default-500 bg-default-100 hover:bg-default-action transition-all ease-in-out duration-200'
        onPress={resetZoom}>
        <CenterIcon
          size={20}
          className='text-default-500 group-hover:text-default-selected transition-all ease-in-out duration-200'
        />
      </Button>
    </div>
  );
};

export default ZoomControl;
