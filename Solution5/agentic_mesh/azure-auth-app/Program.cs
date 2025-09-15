using System;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Core;

class Program
{
    private const string IncludeProductionCredentialEnvVarName = "AZURE_MCP_INCLUDE_PRODUCTION_CREDENTIALS";
    static void Main()
    {

        
        try
        {
            var credential = new EnvironmentCredential();
            var tokenRequestContext = new TokenRequestContext(new[] { "https://management.azure.com/.default" });
            var token = credential.GetToken(tokenRequestContext, default);
            Console.WriteLine($"Token acquired: {token.Token}");

            DefaultAzureCredential defaultCredential = CreateDefaultCredential(null);
            var token1 = defaultCredential.GetToken(tokenRequestContext, default);
            
            Console.WriteLine($"Token acquired 1: {token1.Token}");

            // Closing the try block
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to acquire token: {ex.Message}");
        }
    }

     private static DefaultAzureCredential CreateDefaultCredential(string? tenantId)
    {
        var includeProdCreds = EnvironmentHelpers.GetEnvironmentVariableAsBool(IncludeProductionCredentialEnvVarName);

        DefaultAzureCredentialOptions defaultCredentialOptions = new DefaultAzureCredentialOptions
        {
            ExcludeWorkloadIdentityCredential = !includeProdCreds,
            ExcludeManagedIdentityCredential = !includeProdCreds
        };

        if (!string.IsNullOrEmpty(tenantId))
        {
            defaultCredentialOptions.TenantId = tenantId;
        }
        
        return new DefaultAzureCredential(defaultCredentialOptions);
    }

    public static class EnvironmentHelpers
    {
        public static bool GetEnvironmentVariableAsBool(string envVarName)
        {
            return Environment.GetEnvironmentVariable(envVarName) switch
            {
                "true" => true,
                "True" => true,
                "T" => true,
                "1" => true,
                _ => false
            };
        }
    }

}
