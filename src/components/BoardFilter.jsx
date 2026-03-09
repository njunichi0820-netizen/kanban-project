import { Search, X } from 'lucide-react';

export default function BoardFilter({ searchQuery, onSearchChange, tags, selectedTags, onToggleTag, searchInputRef }) {
  const usedTags = tags || [];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border-b shrink-0 md:gap-2 md:px-4 md:py-2">
      {/* Search input */}
      <div className="relative min-w-[100px] max-w-[140px] md:min-w-[160px] md:max-w-xs shrink-0">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 md:left-2.5" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="検索..."
          className="w-full pl-6 pr-6 py-1 text-[11px] bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-colors md:pl-8 md:pr-8 md:py-1.5 md:text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 md:right-2"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Tag chips — scrollable horizontally on mobile */}
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1">
          {usedTags.map((tag) => {
            const active = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => onToggleTag(tag.id)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all whitespace-nowrap shrink-0 md:py-1 ${
                  active
                    ? 'ring-2 ring-offset-1 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: tag.color + (active ? '30' : '15'),
                  color: tag.color,
                  ringColor: tag.color,
                }}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
