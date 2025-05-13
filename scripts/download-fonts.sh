#!/bin/bash

# Create directories if they don't exist
mkdir -p public/fonts/inter
mkdir -p public/fonts/jetbrains-mono

# Download Inter font
echo "Downloading Inter font..."
curl -L "https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip" -o inter.zip
unzip -o inter.zip -d temp_inter
cp temp_inter/Inter\ Web/Inter-*.woff2 public/fonts/inter/
rm -rf temp_inter inter.zip

# Download JetBrains Mono font
echo "Downloading JetBrains Mono font..."
curl -L "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip" -o jetbrains.zip
unzip -o jetbrains.zip -d temp_jetbrains
cp temp_jetbrains/fonts/webfonts/*.woff2 public/fonts/jetbrains-mono/
rm -rf temp_jetbrains jetbrains.zip

echo "Font download completed!"
