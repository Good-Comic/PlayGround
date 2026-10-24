# syntax=docker/dockerfile:1
FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS node-runtime

FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS node-dependencies
WORKDIR /dependencies
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npm_ca,target=/run/secrets/npm-ca.pem,required=false \
    if [ -f /run/secrets/npm-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm-ca.pem; fi; \
    npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && npm ls --omit=dev --all

FROM python:3.12.12-slim-bookworm@sha256:593bd06efe90efa80dc4eee3948be7c0fde4134606dd40d8dd8dbcade98e669c AS python-runtime

FROM buildpack-deps:bookworm@sha256:ccb050a415a94a3a78acbe35084ec8f06ae46fa158e3650c96f9b4fb514de6d3

WORKDIR /app
COPY --from=python-runtime /usr/local/ /usr/local/
COPY --from=node-runtime /usr/local/ /usr/local/
COPY --chown=1000:1000 . /app/
COPY --from=node-dependencies --chown=1000:1000 /dependencies/node_modules /app/node_modules
RUN npm ls --omit=dev --all \
    && mkdir -p /data /workspace \
    && chown -R 1000:1000 /data /workspace

USER 1000:1000
EXPOSE 8080
CMD ["python", "/app/app.py"]
