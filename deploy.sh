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
podman build --pull --rm -f 'Dockerfile' -t 'localhost/pc2-laptimes:latest' '.'
echo "✅ Build complete!"
echo ""

echo "💾 Saving image to tar..."
podman save localhost/pc2-laptimes:latest -o pc2-laptimes.tar
echo "✅ Image saved!"
echo ""

# Copy image to hosting server
echo "📤 Copying image to homelab server..."
scp -r pc2-laptimes.tar $DESTINATION:/opt/containers/pc2-laptimes.tar
echo "✅ Image copied!"
echo ""

# Load image. Running containers keep the old image until they are restarted,
# so the site stays up during the transfer.
echo "📥 Loading image on homelab..."
ssh $DESTINATION 'podman load -i /opt/containers/pc2-laptimes.tar'
echo "✅ Image loaded!"
echo ""

# Deploy. The pod and its containers are Quadlet units — see
# homelab-ai/config/quadlet/pc2-laptimes.pod. Restarting only the app unit
# recreates the UI container from the new image; Postgres/API stay up.
echo "🚢 Restarting pc2-laptimes-app.service..."
ssh $DESTINATION 'systemctl --user restart pc2-laptimes-app.service && systemctl --user is-active pc2-laptimes-app.service'
echo "✅ Deployed!"
echo ""

# Cleanup old images only (keep volumes for database persistence)
echo "🧹 Cleaning up old images..."
ssh $DESTINATION 'podman image prune -f'
echo "✅ Cleanup complete!"
echo ""

# Cleanup local build artifacts on the podman VM (WSL podman-machine-default backend)
echo "🧽 Cleaning local Podman VM artifacts..."
rm -f pc2-laptimes.tar
podman rmi -f localhost/pc2-laptimes:latest > /dev/null 2>&1 || true
podman image prune -a -f > /dev/null 2>&1 || true
podman builder prune -a -f > /dev/null 2>&1 || true
echo "✅ Local Podman cleanup complete!"
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
