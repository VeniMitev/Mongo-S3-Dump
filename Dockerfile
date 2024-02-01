# Stage 1: Build stage using Node.js 16-slim as the base image
FROM node:16-slim AS builder

# Set the working directory in the build stage
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install both dependencies and devDependencies
RUN npm install

# Copy TypeScript configuration and source code
COPY tsconfig.json .
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Setup runtime stage with Node.js 16-slim as the base image
FROM node:16-slim

# Install MongoDB tools in the final image as well
RUN apt-get update && apt-get install -y gnupg wget && \
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list && \
    apt-get update && \
    apt-get install -y mongodb-org-tools

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the build stage
COPY --from=builder /app/package*.json ./

# Install only runtime dependencies
RUN npm install --only=production

# Copy the compiled JavaScript from the build stage
COPY --from=builder /app/dist ./dist

# Your application will start on this command
CMD ["node", "dist/script.js"]