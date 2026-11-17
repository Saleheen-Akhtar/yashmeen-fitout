import type { SpatialGalleryItem, HelixSlot } from "./types";
import { DESKTOP_PLATE_SIZES, MOBILE_PLATE_SIZES } from "./geometry";
export function createHelixLayout(items: SpatialGalleryItem[], viewportWidth: number) {
    const isMobile = viewportWidth < 640;
    const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

    const radius = isMobile ? 4.75 : isTablet ? 5.65 : 6.2;
    const cols = isMobile ? 14 : isTablet ? 15 : 16;
    const ringPitch = isMobile ? 1.66 : 1.88;
    const defaultCamDist = isMobile ? 11.8 : isTablet ? 11.5 : 11.4;
    const minCamDist = isMobile ? 8.0 : 8.4;
    const maxCamDist = isMobile ? 16.0 : 16.0;

    if (items.length === 0) {
      return {
        slots: [] as HelixSlot[],
        radius,
        cols,
        ringPitch,
        spanY: ringPitch * 4,
        defaultCamDist,
        minCamDist,
        maxCamDist,
      };
    }

    // Pad evenly to integer rings so vertical wraps & columns remain flush at all category sizes
    const turns = Math.max(3, Math.ceil(items.length / cols));
    const poolCount = turns * cols;
    const totalHeight = turns * ringPitch;
    const angleStep = (Math.PI * 2) / cols;
    const yStep = ringPitch / cols;
    const sizePalette = isMobile ? MOBILE_PLATE_SIZES : DESKTOP_PLATE_SIZES;

    const slots: HelixSlot[] = Array.from({ length: poolCount }, (_, i) => {
      const item = items[i % items.length];
      const [width, height] = sizePalette[(i * 3 + Math.floor(i / cols)) % sizePalette.length];

      // Ascending spiral ribbon anchored cleanly at slot 0 center with zero seam
      const baseTheta = i * angleStep;
      const baseY = i * yStep;

      return {
        slotKey: `${item.id}-${i}`,
        item,
        width,
        height,
        baseTheta,
        baseY,
      };
    });

    return {
      slots,
      radius,
      cols,
      ringPitch,
      spanY: totalHeight,
      defaultCamDist,
      minCamDist,
      maxCamDist,
    };
  }
