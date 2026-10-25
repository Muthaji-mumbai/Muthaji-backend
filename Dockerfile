# Use official lightweight Node.js 20 LTS Alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install curl/wget for health check
RUN apk add --no-cache curl wget

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Create uploads directory structure
RUN mkdir -p uploads/images uploads/pdfs uploads/temp

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE_DRIVER=local

# Expose port (Dokploy will route traffic to this port)
EXPOSE 3000

# Health check to ensure Dokploy can verify container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "index.js"]
