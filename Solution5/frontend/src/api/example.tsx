import { API_BASE_URL } from '../config/settings';
import { loginRequest } from "../authConfig";
import { IPublicClientApplication } from "@azure/msal-browser";

export interface IExample {
  doc_id: string;
  question: string;
  sql: string;
  sql_embedding?: number[];
}

export async function getDatabases(msalInstance: IPublicClientApplication): Promise<string[]> {
  try {
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;
    const response = await fetch(`${API_BASE_URL}/queryexamples/databases`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch databases');
    }
    const data = await response.json();
    return data.databases;
  } catch (err) {
    console.error('Error fetching databases:', err);
    throw err;
  }
}

export async function getExamples(msalInstance: IPublicClientApplication, database: string): Promise<IExample[]> {
  try {
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;
    const response = await fetch(`${API_BASE_URL}/queryexamples/examples?database=${encodeURIComponent(database)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch examples');
    }
    const data = await response.json();
    return data.examples;
  } catch (err) {
    console.error('Error fetching examples:', err);
    throw err;
  }
}

export async function deleteExample(msalInstance: IPublicClientApplication, doc_id: string, database: string): Promise<any> {
  try {
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;
    const response = await fetch(
      `${API_BASE_URL}/queryexamples/delete_example?doc_id=${encodeURIComponent(doc_id)}&database=${encodeURIComponent(database)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete example');
    }
    return await response.json();
  } catch (err) {
    console.error('Error deleting example:', err);
    throw err;
  }
}

export async function updateExample(
  msalInstance: IPublicClientApplication,
  doc_id: string,
  question: string,
  sql: string,
  database: string
): Promise<any> {
  try {
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;
    const response = await fetch(`${API_BASE_URL}/queryexamples/update_example`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        doc_id,
        question,
        sql,
        database
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to update example');
    }
    return await response.json();
  } catch (err) {
    console.error('Error updating example:', err);
    throw err;
  }
}

export async function addExample(
  msalInstance: IPublicClientApplication,
  question: string,
  sql: string,
  database: string = "default"
): Promise<any> {
  try {
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;
    const response = await fetch(`${API_BASE_URL}/queryexamples/add_example`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        question,
        sql,
        database
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to add example');
    }
    return await response.json();
  } catch (err) {
    console.error('Error adding example:', err);
    throw err;
  }
}