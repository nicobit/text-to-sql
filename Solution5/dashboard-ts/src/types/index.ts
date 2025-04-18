export type WidgetType = 'clock' | 'counter' | 'quote';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
}

export interface DashboardSnapshot {
  widgets: WidgetConfig[];
  layouts: import("react-grid-layout").Layouts;
}
