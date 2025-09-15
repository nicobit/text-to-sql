FROM node:18

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["npx", "supergateway", "--port", "3003", "--stdio", "npx @modelcontextprotocol/server-sequential-thinking"]
