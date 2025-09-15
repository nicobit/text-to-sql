import { Layouts } from 'react-grid-layout';
export type WidgetType = 'chart' | 'text' | 'table';
export interface WidgetConfig { id: string; type: WidgetType; }
export interface TabConfig { id: string; name: string; widgets: WidgetConfig[]; layouts: Layouts; }