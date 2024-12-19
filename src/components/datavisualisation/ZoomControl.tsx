import { FC, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ZoomControlProps {
  svgRef: React.RefObject<SVGSVGElement>;
  width?: number;
  height?: number;
}

const ZoomControl: FC<ZoomControlProps> = ({ svgRef, width = 600, height = 400 }) => {
  const zoomBehavior = useRef(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 10]).on('zoom', handleZoom));

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
            zoomGroup.node()?.appendChild(this);
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

  function center() {
    if (!svgRef.current) return;
    const currentWidth = svgRef.current.clientWidth || width;
    const currentHeight = svgRef.current.clientHeight || height;

    d3.select<SVGSVGElement, unknown>(svgRef.current)
      .transition()
      .call(zoomBehavior.current.translateTo, currentWidth * 0.5, currentHeight * 0.5);
  }

  function panLeft() {
    if (!svgRef.current) return;
    d3.select<SVGSVGElement, unknown>(svgRef.current).transition().call(zoomBehavior.current.translateBy, -50, 0);
  }

  function panRight() {
    if (!svgRef.current) return;
    d3.select<SVGSVGElement, unknown>(svgRef.current).transition().call(zoomBehavior.current.translateBy, 50, 0);
  }

  return (
    <div className='fixed bottom-20 right-0 p-4 flex flex-col gap-2 bg-gray-800 rounded-lg shadow-lg'>
      <button onClick={zoomIn} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white'>
        Zoom In
      </button>
      <button onClick={zoomOut} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white'>
        Zoom Out
      </button>
      <button onClick={resetZoom} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white'>
        Reset
      </button>
      <button onClick={center} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white'>
        Center
      </button>
      <div className='flex gap-2'>
        <button onClick={panLeft} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white'>
          ←
        </button>
        <button onClick={panRight} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white'>
          →
        </button>
      </div>
    </div>
  );
};

export default ZoomControl;
