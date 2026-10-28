#!/bin/bash -i

set -e  # Exit on any error

shopt -s expand_aliases
DESTINATION="${DESTINATION:-hosting@hosting}"
REMOTE_DIR="${REMOTE_DIR:-work/pc2-laptimes}"
BUILT_LOCALLY=0

# Start timer
START_TIME=$(date +%s)

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🚀 PC2 LAPTIMES DEPLOYMENT 🏁        ║"
echo "║   Starting deployment to homelab...    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Build locally when Podman is available (workstation). Otherwise build on the
# hosting VM itself — that is how the OpenCode container deploys, since it only
# has SSH access to the host and no Podman socket.
echo "🔍 Checking Podman availability..."
if command -v podman &> /dev/null && podman ps &> /dev/null; then
    BUILT_LOCALLY=1
    echo "✅ Podman is working locally!"
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
else
    echo "⚠️  No working local Podman — building on $DESTINATION instead."
    ssh "$DESTINATION" "set -e; cd \"\$HOME/$REMOTE_DIR\"; podman build --pull --rm -f Dockerfile -t localhost/pc2-laptimes:latest ."
    echo "✅ Build complete on homelab!"
    echo ""
fi

# Deploy. The pod and its containers are Quadlet units shipped from
# deployment/quadlet/. Install them first (so a definition change is picked up),
# then restart only the app unit — Postgres and the API stay running.
echo "📦 Installing Quadlet units..."
DESTINATION="$DESTINATION" bash deployment/install-quadlet.sh
echo ""

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
if [ "$BUILT_LOCALLY" = "1" ]; then
    echo "🧽 Cleaning local Podman VM artifacts..."
    rm -f pc2-laptimes.tar
    podman rmi -f localhost/pc2-laptimes:latest > /dev/null 2>&1 || true
    podman image prune -a -f > /dev/null 2>&1 || true
    podman builder prune -a -f > /dev/null 2>&1 || true
    echo "✅ Local Podman cleanup complete!"
    echo ""
fi

# End timer and display
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✨ DEPLOYMENT COMPLETE! ✨           ║"
echo "║   ⏱️  Total time: ${DURATION} seconds           ║"
echo "╚════════════════════════════════════════╝"
echo ""
