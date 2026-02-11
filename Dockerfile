# Use official Node.js runtime
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose the port your app runs on
EXPOSE 4700

# Start the application
CMD ["node", "server.js"]