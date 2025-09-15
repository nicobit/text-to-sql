FROM node:20-slim

# Runtime deps + curl for health probes
RUN apt-get update && \
    apt-get install -y --no-install-recommends libicu-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Make Kestrel listen on all interfaces/port 3000
ENV ASPNETCORE_URLS=http://0.0.0.0:3000 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

WORKDIR /app
EXPOSE 3000

# Long-running SSE server
CMD ["npx","-y","@azure/mcp@latest","server","start","--transport","sse","--port","3000"]
