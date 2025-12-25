# Base image from oven/bun:latest
FROM oven/bun:latest

# Set parent directory for the monorepo
WORKDIR /workspace

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Move into the scraper app
WORKDIR /workspace/apps/scraper

# Run the application
CMD ["bun", "run", "src/index.ts"]