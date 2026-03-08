import { Search, X } from 'lucide-react';

export default function BoardFilter({ searchQuery, onSearchChange, tags, selectedTags, onToggleTag, searchInputRef }) {
  const usedTags = tags || [];

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-b shrink-0">
      {/* Search input */}
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="検索..."
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1">
        {usedTags.map((tag) => {
          const active = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onToggleTag(tag.id)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-all ${
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
  );
}
