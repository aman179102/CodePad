# Multi-stage build for CodePad with all language runtimes
FROM ubuntu:22.04 as runtime-installer

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install basic tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Python3
RUN apt-get install -y python3 python3-pip

# Install Java (OpenJDK 17)
RUN apt-get install -y openjdk-17-jdk

# Install GCC/G++ for C/C++
RUN apt-get install -y gcc g++

# Install .NET 8 SDK
RUN wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y dotnet-sdk-8.0

# Install Go
RUN wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz && \
    rm go1.21.5.linux-amd64.tar.gz
ENV PATH=$PATH:/usr/local/go/bin

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH=$PATH:/root/.cargo/bin

# Install PHP
RUN apt-get install -y php-cli

# Install Ruby
RUN apt-get install -y ruby-full

# Install R
RUN apt-get install -y r-base

# Install Kotlin
RUN wget https://github.com/JetBrains/kotlin/releases/download/v1.9.20/kotlin-compiler-1.9.20.zip && \
    unzip kotlin-compiler-1.9.20.zip && \
    mv kotlinc /opt/ && \
    rm kotlin-compiler-1.9.20.zip
ENV PATH=$PATH:/opt/kotlinc/bin

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Production stage
FROM node:20-alpine as production

# Install runtime dependencies only
RUN apk add --no-cache \
    python3 \
    openjdk17-jdk \
    gcc \
    g++ \
    php \
    ruby \
    R

# Copy language binaries from runtime-installer
COPY --from=runtime-installer /usr/local/go /usr/local/go
COPY --from=runtime-installer /root/.cargo /root/.cargo
COPY --from=runtime-installer /opt/kotlinc /opt/kotlinc
COPY --from=runtime-installer /usr/share/dotnet /usr/share/dotnet

# Set environment variables
ENV PATH=$PATH:/usr/local/go/bin:/root/.cargo/bin:/opt/kotlinc/bin:/usr/share/dotnet

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
