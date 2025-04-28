# Use Node official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (make sure it's the correct port your app runs on)
EXPOSE 5002

# Start app
CMD ["npm", "start"]
