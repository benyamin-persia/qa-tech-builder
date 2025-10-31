import React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export const ExpandingCards = React.forwardRef(
  ({ className, items, defaultActiveIndex = 0, selectedItems = [], ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const gridStyle = React.useMemo(() => {
      if (activeIndex === null) return {};
      
      if (isDesktop) {
        const columns = items
          .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
          .join(" ");
        return { gridTemplateColumns: columns };
      } else {
        const rows = items
          .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
          .join(" ");
        return { gridTemplateRows: rows };
      }
    }, [activeIndex, items.length, isDesktop]);

    const handleMouseEnter = (index) => {
      setActiveIndex(index);
    };

    const handleClick = (index) => {
      setActiveIndex(index);
      if (items[index].onClick) {
        items[index].onClick();
      }
    };

    return (
      <ul
        className={cn(
          "w-full max-w-6xl gap-2",
          "grid",
          "h-[250px] md:h-[220px]",
          "transition-[grid-template-columns,grid-template-rows] duration-500 ease-out",
          className,
        )}
        style={{
          ...gridStyle,
          ...(isDesktop 
            ? { gridTemplateRows: '1fr' }
            : { gridTemplateColumns: '1fr' }
          )
        }}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-lg border-2 shadow-2xl transition-all duration-300",
              "md:min-w-[80px]",
              "min-h-0 min-w-0",
              selectedItems.includes(item.id) 
                ? "border-blue-400 bg-blue-500/20" 
                : "border-white/20 bg-white/10"
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onFocus={() => handleMouseEnter(index)}
            onClick={() => handleClick(index)}
            tabIndex={0}
            data-active={activeIndex === index}
          >
            <img
              src={item.imgSrc}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-contain transition-all duration-300 ease-out group-data-[active=true]:scale-100 scale-110 grayscale"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Selected checkmark */}
            {selectedItems.includes(item.id) && (
              <div className="absolute top-2 right-2 z-20 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <article
              className="absolute inset-0 flex flex-col justify-end gap-2 p-4"
            >
              <h3 className="hidden origin-left text-xs font-light uppercase tracking-wider text-white/80 opacity-100 transition-all duration-300 ease-out md:block group-data-[active=true]:opacity-0 absolute left-4 top-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap">
                {item.title}
              </h3>

              <div className="text-white/90 opacity-0 transition-all duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
                {item.icon}
              </div>

              <h3 className="text-base font-bold text-white opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
                {item.title}
              </h3>

              <p className="w-full max-w-xs text-xs text-white/80 opacity-0 transition-all duration-300 delay-225 ease-out group-data-[active=true]:opacity-100">
                {item.description}
              </p>

              {item.popularity !== undefined && (
                <div className="opacity-0 transition-all duration-300 delay-300 ease-out group-data-[active=true]:opacity-100">
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/60 text-[10px] font-medium">Popularity</span>
                    <span className="text-white/80 text-[10px] font-semibold">{item.popularity}%</span>
                  </div>
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    );
  }
);

ExpandingCards.displayName = "ExpandingCards";
