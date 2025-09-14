# Multi-stage Dockerfile for cross-platform Electron builds
FROM node:18-alpine as base

# Install dependencies for Electron builds
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate icons
RUN node generate-icons.js

# Build stage for Linux
FROM base as build-linux
RUN npm run build-linux

# Build stage for Mac (requires macOS runner)
FROM base as build-mac
RUN npm run build-mac

# Final stage
FROM alpine:latest as final
RUN apk add --no-cache nodejs npm
WORKDIR /dist
COPY --from=build-linux /app/dist/ ./linux/
# Mac builds would be copied from macOS runner
VOLUME ["/output"]
CMD ["sh", "-c", "cp -r /dist/* /output/"]