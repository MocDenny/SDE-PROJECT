FROM node:24.11.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
EXPOSE 3004
CMD [ "npm", "run", "dev" ]