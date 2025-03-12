import React, { useContext, useRef, useEffect, useState } from 'react';
import { QueryContext } from '../context/QueryContext';
import * as d3 from 'd3';

import { Box, Typography } from '@mui/material';


interface DataEntry {
  [key: string]: any;
}

function BarChart() {
  const queryContext = useContext(QueryContext);
  
  if (!queryContext) {
    return <div>Loading...</div>;
  }
    
  const { queries, selectedIndex } = queryContext;
  
  const currentEntry = (selectedIndex !== null && selectedIndex < queries.length) ? queries[selectedIndex] : null;
  const data: DataEntry[] | null = currentEntry && currentEntry.result && Array.isArray(currentEntry.result) ? currentEntry.result : null;
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
    // Clear previous content
    svg.selectAll('*').remove();

    if (!data || data.length === 0) {
      return;
    }
    // Determine fields for chart: use first two columns if available
    const sample = data[0];
    const keys = Object.keys(sample);
    if (keys.length < 2) {
      return;
    }
    // Assume first column is category (x) and second column is numeric value (y)
    const xField = keys[0];
    const yField = keys[1];
    // Filter data to include only items with numeric yField values
    const chartData = data.filter(d => typeof d[yField] === 'number');

    // Dimensions
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 100, left: 40 }; // Increased bottom margin for x-axis labels

    // Scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d[xField]))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, (d: DataEntry)  => d[yField]) as number])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Draw bars
    svg.selectAll('rect')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', (d: DataEntry) => xScale(d[xField])!)
      .attr('y', (d: DataEntry) => yScale(d[yField])!)
      .attr('width', xScale.bandwidth())
      .attr('height', (d: DataEntry) => height - margin.bottom - yScale(d[yField])!)
      .attr('fill', '#3f51b5'); // Using a Material-UI theme primary color

    // Add X-axis labels below bars and rotate them 45 degrees
    svg.selectAll('text.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d: DataEntry)  => xScale(d[xField])! + xScale.bandwidth() / 2)
      .attr('y', height - margin.bottom + 40) // Adjusted to position below the x-axis
      .attr('text-anchor', 'start') // Changed from 'end' to 'start'
      .attr('transform', (d: DataEntry)  => `rotate(-45, ${xScale(d[xField])! + xScale.bandwidth() / 2}, ${height - margin.bottom + 40})`)
      .text((d: DataEntry)  => d[xField]);

    // Add Y-axis (value) on the left
    const yAxis = d3.axisLeft(yScale).ticks(5);
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
  }, [data, width]);

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      <Typography variant="h6">Bar Chart</Typography>
      <svg ref={chartRef} width="100%" height="600"></svg>
    </Box>
  );
}

export default BarChart;
