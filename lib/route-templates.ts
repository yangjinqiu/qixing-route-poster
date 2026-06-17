import { RouteTemplate } from './types';
import fangshan from '@/data/templates/fangshan.json';
import huanling from '@/data/templates/huanling.json';
import jiangxinzhou from '@/data/templates/jiangxinzhou.json';
import taihu from '@/data/templates/taihu.json';
import hainan from '@/data/templates/hainan.json';
import qinghai from '@/data/templates/qinghai.json';

// === AUTO_IMPORTS_START ===
import 石臼湖 from '@/data/templates/石臼湖.json';
// === AUTO_IMPORTS_END ===

const presets: RouteTemplate[] = [
  fangshan as RouteTemplate,
  huanling as RouteTemplate,
  jiangxinzhou as RouteTemplate,
  taihu as RouteTemplate,
  hainan as RouteTemplate,
  qinghai as RouteTemplate,
  // === AUTO_ENTRIES_START ===
  石臼湖 as RouteTemplate,
// === AUTO_ENTRIES_END ===
];

export function getPresetTemplates(): RouteTemplate[] {
  return presets;
}

export function getAllTemplates(customTemplates: RouteTemplate[] = []): RouteTemplate[] {
  return [...presets, ...customTemplates];
}

export function getTemplateById(id: string, customTemplates: RouteTemplate[] = []): RouteTemplate | undefined {
  return getAllTemplates(customTemplates).find((t) => t.id === id);
}
