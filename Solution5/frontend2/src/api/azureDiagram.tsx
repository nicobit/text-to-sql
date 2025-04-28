import { API_BASE_URL } from '../constants';
import { loginRequest } from '../authConfig';
import { IPublicClientApplication } from "@azure/msal-browser";
import { Node, Edge } from 'reactflow';

interface DiagramData {
    nodes: Node[];
    edges: Edge[];
}

export async function getAzureDiagram(instance: IPublicClientApplication): Promise<DiagramData> {
    try {
        const tokenResponse = await instance.acquireTokenSilent(loginRequest);
        const token = tokenResponse.accessToken;

        const response = await fetch(`${API_BASE_URL}/diagrams/data?subscriptionId=2cc2bc74-f418-497c-8aec-3e23b0e08d87`, {
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

        const resultData = await response.json() as DiagramData;
        return resultData;
    } catch (err) {
        console.error('Query submission error:', err);
        throw err;
    }
}

export async function getAzureDiagramWithSubscription(instance: IPublicClientApplication, subscriptionId: string): Promise<DiagramData> {
    try {
        const tokenResponse = await instance.acquireTokenSilent(loginRequest);
        const token = tokenResponse.accessToken;

        const response = await fetch(`${API_BASE_URL}/diagrams/data?subscriptionId=${subscriptionId}`, {
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

        const resultData = await response.json() as DiagramData;
        return resultData;
    } catch (err) {
        console.error('Query submission error:', err);
        throw err;
    }
}

