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

# Install Rust via package manager (more stable for Alpine)
RUN apt-get install -y rustc

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

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    openjdk17-jdk \
    gcc \
    g++ \
    php \
    ruby \
    R \
    bash \
    musl-dev \
    libc6-compat \
    rust \
    cargo

# Copy language binaries from runtime-installer
COPY --from=runtime-installer /opt/kotlinc /opt/kotlinc

# Install TypeScript globally
RUN npm install -g typescript tsx

# Set environment variables
ENV PATH=$PATH:/opt/kotlinc/bin

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Copy application code first
COPY . .

# Install dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
