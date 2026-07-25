FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy database schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Execute database migrations and start Next.js production server
CMD npx prisma migrate deploy && npm run start
