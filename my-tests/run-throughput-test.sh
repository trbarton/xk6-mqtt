#!/bin/bash

BROKER_HOST="192.168.66.101" \
BROKER_PORT="30773" \
TARGET_VUS=100 \
./k6 run test-throughput.js