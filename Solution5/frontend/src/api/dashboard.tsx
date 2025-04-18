import { TabConfig } from '../types';
const API = '/api/dashboard';
export const loadDashboard = async () => (await fetch(API, { credentials: 'include' })).json() as Promise<TabConfig[]>;
export const saveDashboard = async (tabs: TabConfig[]) => { await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tabs }) }); };
