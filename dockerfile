# Base image from oven/bun:latest
FROM oven/bun:latest

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Run the application
CMD ["bun", "run", "src/index.ts"]