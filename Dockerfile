# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.16.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

ARG PNPM_VERSION=8
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential openssl 

# Install node modules
COPY --link package.json pnpm-lock.yaml panda.config.ts ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Run the setup script
RUN pnpm run setup

# Build application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod --config.ignore-scripts


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Make the entrypoint executable
RUN chmod +x /app/docker-entrypoint.js

# Entrypoint prepares the database.
ENTRYPOINT [ "/app/docker-entrypoint.js" ]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "/app/node_modules/@remix-run/serve/dist/cli.js", "/app/build" ]
