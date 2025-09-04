#!/bin/bash

# Install script for CodePad language runtimes
# This script installs all required compilers and interpreters

echo "Installing language runtimes for CodePad..."

# Update package lists
apt-get update

# Install basic build tools
apt-get install -y build-essential curl wget

# Install Node.js (already available in Vercel)
echo "Node.js: Already available"

# Install Python3
apt-get install -y python3 python3-pip
echo "Python3 installed"

# Install Java (OpenJDK)
apt-get install -y openjdk-17-jdk
echo "Java 17 installed"

# Install GCC/G++ for C/C++
apt-get install -y gcc g++
echo "GCC/G++ installed"

# Install .NET SDK for C#
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
apt-get update
apt-get install -y dotnet-sdk-8.0
echo ".NET SDK installed"

# Install Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo "Go installed"

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env
echo "Rust installed"

# Install PHP
apt-get install -y php-cli
echo "PHP installed"

# Install Ruby
apt-get install -y ruby-full
echo "Ruby installed"

# Install R
apt-get install -y r-base
echo "R installed"

# Install Kotlin (requires Java)
wget https://github.com/JetBrains/kotlin/releases/download/v1.9.10/kotlin-compiler-1.9.10.zip
unzip kotlin-compiler-1.9.10.zip
mv kotlinc /opt/
export PATH=$PATH:/opt/kotlinc/bin
echo 'export PATH=$PATH:/opt/kotlinc/bin' >> ~/.bashrc
echo "Kotlin installed"

echo "All language runtimes installed successfully!"
