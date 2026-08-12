#!/bin/bash

# Image Copy Helper Script
# Usage: ./copy-images.sh <track-slug>
# Example: ./copy-images.sh quantum-fundamentals

TRACK=$1

if [ -z "$TRACK" ]; then
    echo "❌ Error: Please provide a track slug"
    echo "Usage: ./copy-images.sh <track-slug>"
    echo ""
    echo "Available tracks:"
    echo "  - quantum-fundamentals"
    echo "  - quantum-gates"
    echo "  - qiskit-sdk"
    echo "  - quantum-entanglement"
    echo "  - quantum-algorithms"
    echo "  - quantum-cryptography"
    echo "  - error-correction"
    echo "  - vqe-qaoa"
    echo "  - quantum-ml"
    exit 1
fi

# Images are vendored under content/qworld/ — see content/qworld/SOURCES.md.
# QWORLD_CONTENT_ROOT overrides this when the content lives elsewhere.
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QWORLD_PATH="${QWORLD_CONTENT_ROOT:-$APP_ROOT/content/qworld}"
PUBLIC_PATH="$APP_ROOT/public/images/lesson-images/$TRACK"

echo "🎨 Copying images for track: $TRACK"
echo ""

# Create directory
mkdir -p "$PUBLIC_PATH"

# Map track to QWorld repo
case $TRACK in
    "quantum-fundamentals"|"quantum-gates"|"quantum-entanglement")
        SOURCE="$QWORLD_PATH/qbook101/images"
        ;;
    "qiskit-sdk")
        SOURCE="$QWORLD_PATH/qbook101/appendices/C_qiskit/images"
        ;;
    "quantum-algorithms"|"vqe-qaoa"|"quantum-ml")
        SOURCE="$QWORLD_PATH/silver-qcourse511/images"
        ;;
    "quantum-cryptography")
        SOURCE="$QWORLD_PATH/qkd/images"
        ;;
    "error-correction")
        SOURCE="$QWORLD_PATH/qec/images"
        ;;
    *)
        echo "❌ Unknown track: $TRACK"
        exit 1
        ;;
esac

if [ ! -d "$SOURCE" ]; then
    echo "❌ Source directory not found: $SOURCE"
    echo "   Please check if QWorld repos are cloned at: $QWORLD_PATH"
    exit 1
fi

# Copy images
echo "📁 Source: $SOURCE"
echo "📁 Destination: $PUBLIC_PATH"
echo ""

COPIED=0
for ext in png jpg jpeg gif svg; do
    if ls "$SOURCE"/*.$ext 1> /dev/null 2>&1; then
        cp "$SOURCE"/*.$ext "$PUBLIC_PATH/" 2>/dev/null
        COUNT=$(ls "$SOURCE"/*.$ext 2>/dev/null | wc -l | tr -d ' ')
        COPIED=$((COPIED + COUNT))
    fi
done

echo "✅ Copied $COPIED images to $PUBLIC_PATH"
echo ""
echo "🎯 Next steps:"
echo "   1. Check the images: ls $PUBLIC_PATH"
echo "   2. Update lesson JSON to reference these images"
echo "   3. Test in browser: http://localhost:3000/tracks/$TRACK"
