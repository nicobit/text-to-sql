import { TabConfig } from '../types';
import { API_BASE_URL } from '../config/settings';
import { loginRequest } from '../authConfig';
import { IPublicClientApplication } from "@azure/msal-browser";


const API = `${API_BASE_URL}/dashboard/data`;



export async function loadDashboard(instance: IPublicClientApplication): Promise<TabConfig[]> {
  try {
    
    const tokenResponse = await instance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;

    const response = await fetch(`${API_BASE_URL}/dashboard/data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Request failed');
    }

    const resultData = await response.json() as Promise<TabConfig[]>;
    return resultData;
  } catch (err) {
    console.error('Query submission error:', err);
    throw err;
  }
}


export const saveDashboard = async (instance: IPublicClientApplication,tabs: TabConfig[]) => {
    const tokenResponse = await instance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;
    await fetch(API, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        credentials: 'include',
        body: JSON.stringify({ tabs }),
    });
};
