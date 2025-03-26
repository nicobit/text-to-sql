
# SAML2 Authentication In .Net
Below is an example of a complete solution that uses a popular SAML2 library for .NET – [Sustainsys.Saml2](https://github.com/Sustainsys/Saml2) (formerly Kentor). In this example, the backend is an ASP.NET Web API application (running on the .NET Framework and hosted in IIS) that protects its REST endpoints using SAML2 authentication. The ReactJS frontend is assumed to reside on another domain and will call the REST APIs (after the user authenticates via SAML2). We configure CORS for cross‑domain calls. 

> **Note:** In real‑world scenarios you might exchange the SAML assertion for a JWT token to “statelessly” protect API calls. For simplicity, this example uses cookie‑based SAML authentication via OWIN middleware.

---

### Project Structure

```
MySamlApi/
├── Controllers/
│   └── ValuesController.cs         // Sample REST API controller (protected)
├── App_Start/
│   └── Startup.cs                  // OWIN startup configuration (SAML2 + CORS)
├── Web.config                      // IIS and Sustainsys.Saml2 configuration
├── packages.config                 // NuGet package list (includes Sustainsys.Saml2, Microsoft.Owin, etc.)
└── Global.asax                     // Optional (OWIN startup will be used)
```

---

### 1. Install NuGet Packages

Make sure your project references at least these packages:
- **Sustainsys.Saml2**
- **Microsoft.Owin**
- **Microsoft.Owin.Host.SystemWeb**
- **Microsoft.Owin.Cors**
- **Microsoft.Owin.Security.Cookies**

You can install them using the NuGet Package Manager or via Package Manager Console:

```powershell
Install-Package Sustainsys.Saml2
Install-Package Microsoft.Owin
Install-Package Microsoft.Owin.Host.SystemWeb
Install-Package Microsoft.Owin.Cors
Install-Package Microsoft.Owin.Security.Cookies
```

---

### 2. Web.config

Below is a sample web.config snippet. This sets up the Sustainsys.Saml2 configuration and denies anonymous access (so only authenticated users can call the REST endpoints).  
Replace the placeholder values with your own IdP metadata URL, entity IDs, etc.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <configSections>
    <section name="sustainsys.saml2" 
             type="Sustainsys.Saml2.Configuration.SustainsysSaml2Section, Sustainsys.Saml2" 
             requirePermission="false" />
  </configSections>
  
  <sustainsys.saml2 entityId="https://your-app-domain.com/Saml2" returnUrl="https://your-app-domain.com/">
    <identityProviders>
      <!-- Example IdP; set metadataLocation or configure manually -->
      <add entityId="https://idp.example.com/SAML2"
           metadataLocation="https://idp.example.com/metadata"
           loadMetadata="true" />
    </identityProviders>
  </sustainsys.saml2>
  
  <system.web>
    <authentication mode="None" />
    <authorization>
      <deny users="?" />
    </authorization>
  </system.web>
  
  <!-- Other settings as needed -->
</configuration>
```

---

### 3. OWIN Startup Configuration

Create a file named **Startup.cs** in the **App_Start** folder. This file configures OWIN middleware for SAML2 authentication and enables CORS so that your React frontend (on another domain) can access the API.

```csharp
// App_Start/Startup.cs
using System;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security.Cookies;
using Owin;
using Sustainsys.Saml2;
using Sustainsys.Saml2.Owin;

[assembly: OwinStartup(typeof(MySamlApi.Startup))]
namespace MySamlApi
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Enable CORS (adjust origins as needed)
            app.UseCors(CorsOptions.AllowAll);
            
            // Use cookie authentication to persist the SAML2 sign-in
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = "ApplicationCookie",
                LoginPath = new PathString("/Saml2/SignIn")
            });

            // Configure SAML2 authentication middleware.
            // 'true' below means that authentication challenges will trigger a redirect.
            app.UseSaml2Authentication(new Saml2AuthenticationOptions(true)
            {
                // SP options (service provider)
                SPOptions = new Sustainsys.Saml2.Configuration.SPOptions
                {
                    EntityId = new EntityId("https://your-app-domain.com/Saml2"),
                    // Optional: set the return URL after sign-in.
                    ReturnUrl = new Uri("https://your-app-domain.com/")
                },
                // Configure your Identity Provider(s) here.
                IdentityProviders =
                {
                    new Sustainsys.Saml2.Configuration.IdentityProvider(
                        new EntityId("https://idp.example.com/SAML2"),
                        new Uri("https://idp.example.com/SAML2/SSOService"))
                    {
                        LoadMetadata = true
                        // You can also specify certificate details if needed.
                    }
                }
            });
        }
    }
}
```

---

### 4. Sample REST API Controller

Create a sample controller that requires SAML2 authentication. For example, **ValuesController.cs** in the **Controllers** folder:

```csharp
// Controllers/ValuesController.cs
using System.Collections.Generic;
using System.Web.Http;

namespace MySamlApi.Controllers
{
    // The [Authorize] attribute ensures that only authenticated users can access these endpoints.
    [Authorize]
    [RoutePrefix("api/values")]
    public class ValuesController : ApiController
    {
        // GET api/values
        [HttpGet, Route("")]
        public IEnumerable<string> Get()
        {
            // Returns a simple message for demonstration.
            return new string[] { "Value1", "Value2", "Hello, authenticated user!" };
        }
    }
}
```

---

### 5. Global.asax (Optional)

If your project is not OWIN‑only, you can include a Global.asax. In an OWIN‑integrated ASP.NET application, the OWIN startup is invoked automatically. A simple Global.asax might be:

```csharp
// Global.asax.cs
using System.Web;
using System.Web.Http;

namespace MySamlApi
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
        }
    }
}
```

And your **WebApiConfig.cs** in **App_Start** might be:

```csharp
// App_Start/WebApiConfig.cs
using System.Web.Http;

namespace MySamlApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Enable attribute routing
            config.MapHttpAttributeRoutes();

            // Optionally, configure other Web API settings.
        }
    }
}
```

---

### 6. React Frontend Considerations

Since your REST API is on a different domain, ensure that your React app uses proper CORS settings. In our OWIN Startup we enabled CORS with `CorsOptions.AllowAll` (for development). For production, replace this with a more secure CORS policy.

---

### 7. How the Flow Works

1. **User Authentication:**  
   When an unauthenticated REST API request is made (for example, when the React app calls an endpoint), the [Authorize] attribute causes an authentication challenge.  
   The OWIN middleware then redirects the user to the SAML2 sign‑in endpoint (configured via Sustainsys.Saml2). The user authenticates at the IdP, and the IdP sends a SAML response back to your application.

2. **Cookie Issuance:**  
   After successful SAML2 authentication, the middleware issues a cookie (using cookie authentication). This cookie is used for subsequent API calls.

3. **REST API Access:**  
   Authenticated API calls (from the same browser or with the token/cookie passed along) succeed and return data. The React frontend, even though on another domain, must properly handle cookies (or an alternative token exchange) according to your CORS and cross‑domain policies.

---

### 8. Summary

This complete example demonstrates how to integrate SAML2 authentication for your .NET Framework REST services deployed on IIS using the Sustainsys.Saml2 library. The key parts include:

- Configuring SAML2 via web.config (or via OWIN startup options).
- Using OWIN middleware to handle SAML2 authentication and issuing cookies.
- Protecting your API controllers with the [Authorize] attribute.
- Enabling CORS so that a React frontend on another domain can access the backend.

You can extend or modify this sample to suit your production needs (e.g. exchanging the SAML assertion for a JWT token for stateless authentication).


# REACTJS

Below is a simple example of a ReactJS application that calls your secured REST API. It assumes that your React app is hosted on another domain but shares the same Identity Provider for SSO. In this example, the browser holds the SSO cookie (or token) so that when you make API calls with credentials included, the IIS‑hosted Web API recognizes the authenticated user.

We’ll use Axios to send a POST request to the API endpoint. (You can also use fetch; the important part is to set the option to include credentials.)

> **Note:** Ensure that your backend CORS policy is set to allow credentials from your React app’s domain. Also, adjust the API URL as needed.

---

### Example React Code

```jsx
// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // State for storing API response and potential errors
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  
  // Example query; in a real app this might be entered by the user
  const userQuestion = "What was the product line with the highest revenue in 2022?";

  useEffect(() => {
    // Call the backend API.
    // The 'withCredentials' flag tells Axios to include SSO cookies.
    axios.post(
      'https://your-api-domain.com/api/values',  // Update with your API URL
      { question: userQuestion },
      { withCredentials: true }
    )
    .then((res) => {
      setResponseData(res.data);
    })
    .catch((err) => {
      setError(err.message);
    });
  }, [userQuestion]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>NL-to-SQL Answer</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {responseData ? (
        <div>
          <p><strong>Generated SQL Query:</strong></p>
          <pre>{responseData.sql}</pre>
          <p><strong>Final Answer:</strong> {responseData.answer}</p>
        </div>
      ) : (
        <p>Loading answer...</p>
      )}
    </div>
  );
}

export default App;
```

---

### Additional Notes

- **CORS & Credentials:**  
  Make sure your backend (IIS-hosted Web API) is configured with CORS to allow requests from your React app domain and that `Access-Control-Allow-Credentials` is set to true. For example, in your OWIN Startup, you might use:
  ```csharp
  app.UseCors(CorsOptions.AllowAll); // For development – in production, configure specific origins
  ```
  Then, your React app’s Axios request includes `{ withCredentials: true }` to send SSO cookies.

- **SSO Flow:**  
  Since both your React app and .NET backend use the same Identity Provider, once the user is authenticated (for instance, via SAML2 SSO on the backend), the authentication cookie is set. Axios then automatically sends this cookie with subsequent requests, allowing your backend to recognize the user without further login prompts.

- **Deployment Considerations:**  
  Ensure that your production deployment has the correct domain settings so that cookies are shared appropriately (for example, setting the cookie domain and proper secure flags). You might also exchange the SAML assertion for a token (like JWT) if you prefer stateless authentication.

This example shows the core of a React component that, once loaded, sends a question to the backend and displays the generated SQL and answer. You can expand it with input fields, error handling, and loading indicators as needed for your full application.
