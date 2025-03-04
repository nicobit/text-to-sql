import { API_BASE_URL } from '../config/settings';

//export async function fetchUserProfile() {
//  try {
//    const response = await fetch('/.auth/me', { credentials: 'include' });
//    
    
//    if (!response.ok) {
//      return null;
//    }
//    const data = await response.json();
    // Returns the clientPrincipal object or null if not logged in
//    return data.clientPrincipal || null;
//  } catch (err) {
//    console.error('Failed to fetch user profile', err);
//    return null;
//  }
// }

export async function submitQuery(queryText) {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: queryText }),
      credentials: 'include'
    });
    if (!response.ok) {
      // Try to parse error message from response
      const errText = await response.text();
      throw new Error(errText || 'Request failed');
    }
    const resultData = await response.json();
    return resultData;
  } catch (err) {
    console.error('Query submission error:', err);
    throw err;
  }
}