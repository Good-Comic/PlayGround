FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS node-runtime

FROM python:3.12.12-slim-bookworm@sha256:593bd06efe90efa80dc4eee3948be7c0fde4134606dd40d8dd8dbcade98e669c AS python-runtime

FROM buildpack-deps:bookworm@sha256:ccb050a415a94a3a78acbe35084ec8f06ae46fa158e3650c96f9b4fb514de6d3

WORKDIR /app
COPY --from=python-runtime /usr/local/ /usr/local/
COPY --from=node-runtime /usr/local/ /usr/local/
COPY app.py /app/app.py
COPY providers.py /app/providers.py
COPY github_integration.py /app/github_integration.py
COPY static /app/static

RUN mkdir -p /data /workspace \
    && chown -R 1000:1000 /data /app /workspace

USER 1000:1000
EXPOSE 8080
CMD ["python", "/app/app.py"]
