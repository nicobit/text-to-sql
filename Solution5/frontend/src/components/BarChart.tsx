import { useContext, useRef, useEffect, useState } from 'react';
import { QueryContext } from '../contexts/QueryContext';
import * as d3 from 'd3';
import { Loader2 } from 'lucide-react';

interface DataEntry {
  [key: string]: any;
}

export default function BarChart() {
  const queryContext = useContext(QueryContext);
  const chartRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setWidth(chartRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    if (!chartRef.current || !queryContext) return;

    const { queries, selectedIndex } = queryContext;
    const currentEntry = selectedIndex !== null && selectedIndex < queries.length
      ? queries[selectedIndex]
      : null;
    const data: DataEntry[] | null =
      currentEntry && currentEntry.result && Array.isArray(currentEntry.result)
        ? currentEntry.result
        : null;

    if (!data || data.length === 0) return;

    const sample = data[0];
    const keys = Object.keys(sample);
    if (keys.length < 2) return;

    const xField = keys[0];
    const yField = keys[1];
    const chartData = data.filter(d => typeof d[yField] === 'number');

    const height = 400;
    const margin = { top: 20, right: 20, bottom: 100, left: 40 };

    const xScale = d3.scaleBand<string>()
      .domain(chartData.map(d => d[xField]))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yMax = d3.max(chartData, d => d[yField]) as number;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.selectAll('rect')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d[xField])!)
      .attr('y', d => yScale(d[yField])!)
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d[yField])!)
      .attr('class', 'fill-indigo-600');

    svg.selectAll('text.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label text-xs text-gray-700')
      .attr('x', d => (xScale(d[xField])! + xScale.bandwidth() / 2))
      .attr('y', height - margin.bottom + 40)
      .attr('text-anchor', 'end')
      .attr('transform', d =>
        `rotate(-45, ${xScale(d[xField])! + xScale.bandwidth() / 2}, ${height - margin.bottom + 40})`
      )
      .text(d => d[xField]);

    const yAxis = d3.axisLeft(yScale).ticks(5);
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);
  }, [queryContext, width]);

  if (!queryContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full max-h-[60vh] h-96 relative">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Chart</h2>
      <svg ref={chartRef} width="100%" height="100%" />
    </div>
  );
}
