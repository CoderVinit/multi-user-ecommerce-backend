# Multi-stage Dockerfile for backend

# Base dependencies layer
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# Install only production dependencies here (will be reused by prod stage)
RUN npm ci --omit=dev

# Development stage (optional) - not used by compose currently
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5600
ENV NODE_ENV=development
CMD ["npm","run","dev"]

# Production stage
FROM node:20-alpine AS prod
WORKDIR /app
# Copy installed node_modules from base layer
COPY --from=base /app/node_modules ./node_modules
COPY package*.json ./
# Copy sequelize configuration helper so CLI paths resolve
COPY .sequelizerc ./
# Copy only necessary source files
COPY src ./src
EXPOSE 5600
ENV NODE_ENV=production
CMD ["npm","start"]
