import * as THREE from "three";
export interface SpatialGalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  fallbackSrc: string;
  index: number;
}

export interface SpatialFilterOption {
  id: string;
  label: string;
}

export interface SpatialGallery3DProps {
  items: SpatialGalleryItem[];
  filters: SpatialFilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  loading?: boolean;
  error?: string;
  onSelectItem: (item: SpatialGalleryItem) => void;
  isLightboxOpen?: boolean;
  onScrollToFooter?: () => void;
}

export interface HelixSlot {
  slotKey: string;
  item: SpatialGalleryItem;
  width: number;
  height: number;
  baseTheta: number;
  baseY: number;
}

export interface MeshEntry {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  slot: HelixSlot;
  planeAspect: number;
  hoverLift: number;
  loadMix: number;
  hasTexture: boolean;
}

export interface Canvas2DPlateEntry {
  slot: HelixSlot;
  planeAspect: number;
  image: HTMLImageElement | null;
  hoverLift: number;
  loadMix: number;
}

export interface ProjectedStripPoint {
  sxTop: number;
  syTop: number;
  sxBot: number;
  syBot: number;
}

export interface Canvas2DHitPlate {
  slot: HelixSlot;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pts: ProjectedStripPoint[];
}
