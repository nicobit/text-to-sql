// src/components/widgets/WidgetWrapper.tsx
import React from 'react';
import { X } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';


const registry = Object.fromEntries(
  Object.entries(import.meta.glob('./*Widget.tsx', { eager: true }))
    .map(([path, module]) => {
      const match = path.match(/\.\/([^/]+)Widget\.tsx$/);
      const name = match?.[1]?.toLowerCase();
      return name
        ? [name, (module as { default: React.ComponentType }).default]
        : null;
    })
    .filter((entry): entry is [string, React.ComponentType] => entry !== null)
) as Record<string, React.ComponentType>;

interface Props {
  widget: { id: string; type: string };
  editMode: boolean;
  onRemove: () => void;
  layout: { i: string; x: number; y: number; w: number; h: number };
  onLayoutChange: (layout: { i: string; x: number; y: number; w: number; h: number }) => void;
}

const WidgetWrapper: React.FC<Props> = ({ widget, editMode, onRemove, layout }) => {
  const Component = registry[widget.type];
  const title = widget.type.toUpperCase();

  return (
    <div
      className="relative w-full h-full"
      style={{
        gridArea: `${layout.y + 1} / ${layout.x + 1} / span ${layout.h} / span ${layout.w}`,
      }}
    >
      <div
        className={`flex flex-col bg-white dark:bg-gray-800 rounded shadow h-full overflow-hidden
          ${editMode ? 'cursor-move drag-handle' : 'cursor-default'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          {editMode && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none no-drag"
              aria-label="Remove widget"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {Component ? <Component /> : <div className="text-sm text-gray-500">Component not found</div>}
        </div>
      </div>
    </div>
  );
};

export default WidgetWrapper;
