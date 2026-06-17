import { RouteTemplate } from './types';
import fangshan from '@/data/templates/fangshan.json';
import huanling from '@/data/templates/huanling.json';
import jiangxinzhou from '@/data/templates/jiangxinzhou.json';
import taihu from '@/data/templates/taihu.json';
import hainan from '@/data/templates/hainan.json';
import qinghai from '@/data/templates/qinghai.json';

const presets: RouteTemplate[] = [
  fangshan as RouteTemplate,
  huanling as RouteTemplate,
  jiangxinzhou as RouteTemplate,
  taihu as RouteTemplate,
  hainan as RouteTemplate,
  qinghai as RouteTemplate,
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
