import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChartView = ({ data, chartType }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !chartType || chartType === "table") return;
    const { columns, rows } = data;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous renders

    const width = 500, height = 300;
    svg.attr("width", width).attr("height", height);

    // Example: assume first column is category (x axis), second column is value (y axis) for simplicity
    if (chartType === "bar") {
      const x = d3.scaleBand().range([0, width]).domain(rows.map(r => r[0])).padding(0.1);
      const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(rows, r => r[1])]);
      // Draw bars
      svg.selectAll(".bar")
        .data(rows)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d[0]))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d[1]))
          .attr("height", d => height - y(d[1]))
          .attr("fill", "#4e79a7");
      // Add axes (simplified)
      svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
      svg.append("g").call(d3.axisLeft(y));
    } else if (chartType === "line") {
      // For line chart, assume data is time series or numerical progression
      const xScale = d3.scaleLinear().range([0, width]).domain([0, rows.length - 1]);
      const yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(rows, r => r[1])]);
      const line = d3.line().x((d,i) => xScale(i)).y(d => yScale(d[1]));
      svg.append("path")
        .datum(rows)
        .attr("fill", "none")
        .attr("stroke", "#59a14f")
        .attr("stroke-width", 2)
        .attr("d", line);
      // X/Y axis
      svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale).ticks(rows.length));
      svg.append("g").call(d3.axisLeft(yScale));
    } else if (chartType === "pie") {
      // For pie, assume first column is category, second column is value
      const radius = Math.min(width, height) / 2;
      const pie = d3.pie().value(d => d[1]);
      const data_ready = pie(rows);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      svg.attr("viewBox", `0 0 ${width} ${height}`)
      const g = svg.append("g").attr("transform", `translate(${width/2},${height/2})`);
      g.selectAll("path")
        .data(data_ready)
        .enter().append("path")
          .attr("d", arc)
          .attr("fill", (d, i) => d3.schemeCategory10[i]);
    }
  }, [data, chartType]);

  if (!data) return null;
  if (chartType === "table") {
    // Render simple HTML table if table selected or by default for non-graphable data
    return (
      <table className="result-table">
        <thead>
          <tr>{data.columns.map(col => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>{row.map((val, j) => <td key={j}>{val}</td>)}</tr>
          ))}
        </tbody>
      </table>
    );
  }

  return <svg ref={svgRef}></svg>;
};

export default ChartView;