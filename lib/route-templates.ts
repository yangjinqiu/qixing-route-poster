import { RouteTemplate } from './types';
import fangshan from '@/data/templates/fangshan.json';
import huanling from '@/data/templates/huanling.json';
import jiangxinzhou from '@/data/templates/jiangxinzhou.json';
import taihu from '@/data/templates/taihu.json';
import hainan from '@/data/templates/hainan.json';
import qinghai from '@/data/templates/qinghai.json';

const templates: RouteTemplate[] = [
  fangshan as RouteTemplate,
  huanling as RouteTemplate,
  jiangxinzhou as RouteTemplate,
  taihu as RouteTemplate,
  hainan as RouteTemplate,
  qinghai as RouteTemplate,
];

export function getAllTemplates(): RouteTemplate[] {
  return templates;
}

export function getTemplateById(id: string): RouteTemplate | undefined {
  return templates.find((t) => t.id === id);
}
