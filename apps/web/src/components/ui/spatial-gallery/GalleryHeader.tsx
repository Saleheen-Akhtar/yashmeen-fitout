import { cn } from "@/lib/utils";
import type { SpatialGalleryItem, SpatialFilterOption } from "./types";
interface Props {items:SpatialGalleryItem[];filters:SpatialFilterOption[];activeFilter:string;loading:boolean;error:string;handleFilterClick:(id:string)=>void;}
export default function GalleryHeader({items,filters,activeFilter,loading,error,handleFilterClick}:Props){ return (<header
        data-hud-control="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="pointer-events-none relative z-30 w-full bg-gradient-to-b from-[var(--bg)] from-64% via-[var(--bg)]/96 via-84% to-transparent"
      >
        <div className="mx-auto max-w-[1440px] px-5 pt-8 pb-10 sm:px-10 sm:pt-12 sm:pb-12">
          <div className="pointer-events-auto flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="no-split font-serif text-2xl font-normal tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">
                Gallery <span className="italic text-[var(--muted)]">in Infinite Space</span>
              </h2>
              {!loading && !error && (
                <span className="text-[12px] font-medium tracking-[0.14em] text-[var(--accent)] uppercase">
                  {items.length} Works
                </span>
              )}
            </div>

            <nav
              data-filter-strip="true"
              role="tablist"
              aria-label="Filter 360 gallery by category"
              className="no-scrollbar flex touch-pan-x flex-nowrap items-center gap-x-5 gap-y-1.5 overflow-x-auto py-1 md:flex-wrap"
            >
              {filters.map((f) => {
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleFilterClick(f.id)}
                    className={cn(
                      'relative min-h-11 shrink-0 pb-1 text-[12px] tracking-[0.11em] uppercase transition-colors sm:text-[12px]',
                      active
                        ? 'font-semibold text-[var(--ink)]'
                        : 'font-medium text-[var(--ink)]/45 hover:text-[var(--ink)]',
                    )}
                  >
                    {f.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute right-0 bottom-0 left-0 h-[1.5px] bg-[var(--accent)]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>); }
