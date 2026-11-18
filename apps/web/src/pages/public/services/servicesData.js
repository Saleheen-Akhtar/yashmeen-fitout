import {
  FiLayout,
  FiPenTool,
  FiFileText,
  FiLayers,
  FiTool,
  FiHome,
  FiGrid,
  FiImage,
  FiBox,
  FiDroplet,
  FiScissors,
  FiBriefcase,
  FiZap,
  FiMaximize,
  FiUsers,
  FiSun,
  FiVolume2,
  FiShield,
} from "react-icons/fi";

import { DEFAULT_WEBSITE_CONTENT } from "../../../../../../shared/siteContent.js";

export const SERVICE_ICONS = { FiLayout, FiPenTool, FiFileText, FiLayers, FiTool, FiHome, FiGrid, FiImage, FiBox, FiDroplet, FiScissors, FiBriefcase, FiZap, FiMaximize, FiUsers, FiSun, FiVolume2, FiShield };
export const SERVICES_DATA = Object.fromEntries(DEFAULT_WEBSITE_CONTENT.services.map(s => [s.slug, { ...s, heroBgImage:s.image, introTitle:s.shortDesc, introCopy:s.description, introPoints:s.highlights }]));
