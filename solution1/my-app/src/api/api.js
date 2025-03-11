import { API_BASE_URL } from '../config/settings';
import React, { useState } from "react";

import { MsalProvider, useMsal } from "@azure/msal-react";

import { msalInstance, loginRequest } from "../authConfig";



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

export async function submitQuery(instance, queryText) {
  try {
    
    const tokenResponse = await instance.acquireTokenSilent(loginRequest);

    const token = tokenResponse.accessToken;

    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify({ query: queryText, session_id:"" }),
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