# Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built frontend files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config if needed
EXPOSE 80
