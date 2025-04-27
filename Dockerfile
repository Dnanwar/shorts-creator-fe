# 1. Base Image: Use Node 20 for compatibility
FROM node:20-slim

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package.json package-lock.json* ./

# Install dependencies (better performance if lockfile exists)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 4. Copy rest of the app code
COPY . .

# 5. Build the Next.js app
RUN npm run build

# 6. Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# 7. Expose the port
EXPOSE 3000

# 8. Start the Next.js app
CMD ["npm", "start"]
    