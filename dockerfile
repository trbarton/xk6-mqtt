# # Build the k6 binary with the extension
ARG TARGETARCH=linux/amd64

# FROM --platform=${TARGETARCH} golang:1.23 AS builder

# RUN GOARCH=amd64 go install go.k6.io/xk6/cmd/xk6@latest

# COPY . /src

# WORKDIR /src

# # For our example, we'll add support for output of test metrics to InfluxDB v2.
# # Feel free to add other extensions using the '--with ...'.
# RUN xk6 build \
#     --with github.com/pmalhaire/xk6-mqtt=. \
#     --output /k6

# # Use the operator's base image and override the k6 binary
# FROM --platform=${TARGETARCH} grafana/k6:latest
# COPY --from=builder /k6 /usr/bin/k6

FROM --platform=${TARGETARCH} grafana/k6:latest
COPY /k6-amd64 /usr/bin/k6