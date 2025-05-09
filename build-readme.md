## Build Binary and Docker Image for x86

1. Install Golang

```bash
brew install go
```

2. Add go binary directory to your .zshrc or equivalent

```bash
export PATH=$PATH:~/go/bin
```

3. Install xk6 go package

```bash
go install go.k6.io/xk6/cmd/xk6@latest
```

4. Build the k6 binary with the xk6-mqtt extension. We set the go OS and go Arch flags to cross compile for x86. If your test runner machines are not x86 machines adjust these options accordingly.

```bash
GOOS=linux GOARCH=amd64 xk6 build \                 
    --with github.com/pmalhaire/xk6-mqtt=. \
    --output ./k6-amd64
```

2. Build the Docker image. Note that the container architecture is set to amd64 in the dockerfile. If you need to build for a different platform adjust accordingly.

```bash
docker build -t <image>:<tag> .
```

3. Push image to container registry

```bash
docker push <image>:<tag>
```