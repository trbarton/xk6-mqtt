## Build Binary and Docker Image for x86

1. Build Binary (Cross compiled)

```bash
GOOS=linux GOARCH=amd64 xk6 build \                 
    --with github.com/pmalhaire/xk6-mqtt=. \
    --output ./k6-amd64
```

2. Build Dockerimage

```bash
docker build -t <image>:<tag> .
```

3. Push image to container registry

```bash
docker push <image>:<tag>
```