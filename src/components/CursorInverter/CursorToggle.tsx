import React from 'react';

interface CursorToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const CursorToggle: React.FC<CursorToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="fixed bottom-4 left-2 z-50">
      <label className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm cursor-pointer hover:bg-black/30 transition-colors">
        <span>Cursor Effect</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="toggle toggle-sm toggle-info"
        />
      </label>
    </div>
  );
};

export default CursorToggle;
