#
# STAGE 1 - Base develop image
#
# Base develop image used for local development.
#
FROM zcscompany/node:22-dev AS develop

ARG DOCKER_USER=bob
ARG DOCKER_GROUP=bob
ARG FIX_UID=1000
ARG FIX_GID=1000
ARG ANGULAR_CLI=20.1.3

USER 0
# Install angular cli
RUN npm install -g @angular/cli@${ANGULAR_CLI} && \
    /fix-perm.sh

# Run as normal user
USER ${DOCKER_USER}

# Default entrypoint
ENTRYPOINT [ "/bin/sleep", "infinity" ]

#
# STAGE 2 - Build image
#
# Image used to build the application
#
FROM zcscompany/node:22-dev AS build

# Copy application sources and build application
COPY app/package.json app/package-lock.json /app/
RUN npm install && \
    chown -R ${DOCKER_USER}:${DOCKER_GROUP} /app

USER ${DOCKER_USER}
COPY app/ /app/
RUN npm run build


#
# STAGE 3 - Serve image
#
# This stage builds the image used to serve the application
#
FROM bitnami/nginx:latest AS dist

# Copy application dist files from build stage
COPY --from=build /app/dist/ai-influencer-fe/browser /app

# Copy nginx configuration
COPY .build/configs/nginx_angular.conf /opt/bitnami/nginx/conf/server_blocks/
EXPOSE 8080
