// src/components/Palette.tsx
import React, { useEffect, useState } from 'react';
import { WidgetType } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
}

const Palette: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [options, setOptions] = useState<{
    type: WidgetType;
    label: string;
    icon: React.ReactNode;
  }[]>([]);

  useEffect(() => {
    const loadWidgets = async () => {
      const widgetFiles = Object.entries(
        import.meta.glob('../components/widgets/*Widget.tsx', { eager: true })
      );

      const loadedOptions = widgetFiles.map(([path, module]: [string, any]) => {
        const nameMatch = path.match(/\/([^/]+)Widget\.tsx$/);
        const name = nameMatch?.[1] || '';
        const label = name
          ? name
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .trim()
              .replace(/^./, (str) => str.toUpperCase())
          : '';
        const icon = module?.icon || null;
        return name
          ? { type: name.toLowerCase() as WidgetType, label, icon }
          : { type: '' as WidgetType, label: '', icon: null };
      });

      setOptions(loadedOptions);
    };

    loadWidgets();
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-xs mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Widget
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Close"
          >
            {/* Optional close icon if desired */}
            ×
          </button>
        </header>

        <ul className="max-h-64 overflow-y-auto">
          {options.map(({ type, label, icon }) => (
            <li key={type}>
              <button
                onClick={() => {
                  onAdd(type);
                  onClose();
                }}
                className="flex items-center w-full px-4 py-2 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {icon && <span className="mr-3 h-5 w-5">{icon}</span>}
                <span className="flex-1 text-sm font-medium capitalize">
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Palette;
