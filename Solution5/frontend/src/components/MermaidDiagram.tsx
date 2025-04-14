// MermaidDiagram.jsx
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with any custom configuration if needed.
mermaid.initialize({
  startOnLoad: false, // We'll call render manually
  htmlLabels: true,
  theme: 'base',
  
  securityLevel: 'loose',
});

interface MermaidDiagramProps {
  chart: string; // Define the type of the 'chart' prop
}

const MermaidDiagram = ({ chart, sx }: MermaidDiagramProps & { sx?: React.CSSProperties }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chartRef.current && chart) {
      // Generate a unique id for the diagram element
      const diagramId = `mermaid-${Date.now()}`;

      // Use mermaid.render to convert the Mermaid code into an SVG string.
      mermaid.render(diagramId, chart).then(({ svg }) => {
        // Set the inner HTML of the target div to the generated SVG
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;

          // Apply the styles defined in sx to the generated SVG element
          const svgElement = chartRef.current.querySelector('svg');
          if (svgElement && sx) {
        Object.assign(svgElement.style, sx);
          }
        }
      }).catch((error) => {
        console.error('Error rendering Mermaid diagram:', error);
      });
    }
  }, [chart]);

  return <section ref={chartRef} style={sx} />;
};

export default MermaidDiagram;
