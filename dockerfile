# # Build the k6 binary with the extension
ARG TARGETARCH=linux/amd64

FROM --platform=${TARGETARCH} grafana/k6:latest
COPY /k6-amd64 /usr/bin/k6
