import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ContentTitleProps {
  title: string;
  onHelpClick?: () => void;
}

export default function ContentTitle({ title, onHelpClick }: ContentTitleProps) {
  return (
    <header className="bg-indigo-600 text-white shadow flex items-center justify-between px-4 py-3">
      <h1 className="text-xl font-semibold truncate">{title}</h1>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="text-sm px-2 py-1 border border-white rounded hover:bg-indigo-500 focus:outline-none"
        >
          Web setup
        </button>
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            className="p-1 rounded hover:bg-indigo-500 focus:outline-none"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
