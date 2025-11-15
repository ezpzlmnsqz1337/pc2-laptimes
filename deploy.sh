#!/bin/bash -i

set -e  # Exit on any error

shopt -s expand_aliases
DESTINATION="hosting@hosting"

# Start timer
START_TIME=$(date +%s)

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🚀 PC2 LAPTIMES DEPLOYMENT 🏁        ║"
echo "║   Starting deployment to homelab...    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if podman is available and working
echo "🔍 Checking Podman availability..."
if ! command -v podman &> /dev/null; then
    echo "❌ ERROR: Podman is not installed or not in PATH"
    exit 1
fi

if ! podman ps &> /dev/null; then
    echo "❌ ERROR: Podman is not working properly. Please check your setup."
    echo "   Try: wsl --terminate podman-machine-default && wsl -d podman-machine-default"
    exit 1
fi
echo "✅ Podman is working!"
echo ""

# Build main app (includes WebSocket server)
echo "📦 Building Docker image..."
podman build --pull --rm -f 'Dockerfile' -t 'pc2-laptimes:latest' '.'
echo "✅ Build complete!"
echo ""

echo "💾 Saving image to tar..."
podman save pc2-laptimes:latest -o pc2-laptimes.tar
echo "✅ Image saved!"
echo ""

# Copy image to hosting server
echo "📤 Copying image to homelab server..."
scp -r pc2-laptimes.tar $DESTINATION:/opt/containers/pc2-laptimes.tar
echo "✅ Image copied!"
echo ""

# Stop service before loading new image
echo "🛑 Stopping existing service..."
ssh $DESTINATION 'systemctl --user stop pod-pc2-laptimes.service 2>/dev/null || echo "Service not running or does not exist yet (first deployment)"'
echo ""

# Load image
echo "📥 Loading image on homelab..."
ssh $DESTINATION 'podman load -i /opt/containers/pc2-laptimes.tar'
echo "✅ Image loaded!"
echo ""

# Deploy
echo "🚢 Deploying containers..."
scp -r deployment/create-pod.sh $DESTINATION:/home/hosting/workspace/create-pc2-pod.sh
ssh $DESTINATION 'bash /home/hosting/workspace/create-pc2-pod.sh'
echo ""

# Cleanup old images and volumes
echo "🧹 Cleaning up old images and unused volumes..."
ssh $DESTINATION 'podman image prune -f && podman volume prune -f'
echo "✅ Cleanup complete!"
echo ""

# End timer and display
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✨ DEPLOYMENT COMPLETE! ✨           ║"
echo "║   ⏱️  Total time: ${DURATION} seconds           ║"
echo "╚════════════════════════════════════════╝"
echo ""
