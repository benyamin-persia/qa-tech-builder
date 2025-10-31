import React, { useState } from 'react';

// Accordion Item Component
const AccordionItem = ({ item, isActive, onMouseEnter }) => {
  return (
    <div
      className={`
        group relative h-[220px] rounded-lg overflow-hidden cursor-pointer
        border-2 shadow-2xl transition-all duration-300
        ${isActive ? 'w-[400px] border-white/40' : 'w-[80px] border-white/20 bg-white/10'}
      `}
      onMouseEnter={onMouseEnter}
      data-active={isActive}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-contain transition-all duration-300 ease-out group-data-[active=true]:scale-100 scale-110 grayscale"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%238b5cf6;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grad)" /%3E%3C/svg%3E'; 
        }}
      />

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Rotated title when inactive */}
      <h3 className="hidden origin-left text-xs font-light uppercase tracking-wider text-white/80 opacity-100 transition-all duration-300 ease-out md:block group-data-[active=true]:opacity-0 absolute left-4 top-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap">
        {item.title}
      </h3>

      {/* Content when active */}
      <article className="absolute inset-0 flex flex-col justify-end gap-2 p-4">
        {/* Icon */}
        <div className="text-white/90 opacity-0 transition-all duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
          {item.icon}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="w-full max-w-xs text-xs text-white/80 opacity-0 transition-all duration-300 delay-225 ease-out group-data-[active=true]:opacity-100">
            {item.description}
          </p>
        )}

        {/* Popularity */}
        {item.popularity !== undefined && (
          <div className="opacity-0 transition-all duration-300 delay-300 ease-out group-data-[active=true]:opacity-100">
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/60 text-[10px] font-medium">Popularity</span>
              <span className="text-white/80 text-[10px] font-semibold">{item.popularity}%</span>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

// Main Component
export function TechStackAccordion({ items = [], defaultActiveIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  const handleItemHover = (index) => {
    setActiveIndex(index);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-white">
        <p>No technologies selected yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-center gap-2 overflow-x-auto p-4">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => handleItemHover(index)}
        />
      ))}
    </div>
  );
}

