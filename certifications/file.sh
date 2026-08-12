#!/bin/bash

if [ "$#" -eq 0 ]; then
    echo "Usage: $0 file1.pdf file2.pdf ..."
    exit 1
fi

mkdir -p png webp

for PDF in "$@"; do
    if [ ! -f "$PDF" ]; then
        echo "❌ File not found: $PDF"
        continue
    fi

    NAME=$(basename "$PDF" .pdf)

    echo "Processing: $PDF"

    # PDF → PNG
    pdftoppm -png -r 300 "$PDF" "png/${NAME}"

    # PNG → WebP
    for PNG in "png/${NAME}"-*.png; do
        [ -e "$PNG" ] || continue

        BASE=$(basename "$PNG" .png)

        cwebp -q 85 "$PNG" -o "webp/${BASE}.webp" >/dev/null 2>&1

        if [ $? -eq 0 ]; then
            echo "  ✓ $BASE"
        else
            echo "  ❌ Failed WebP: $BASE"
        fi
    done

    echo "✓ Finished: $PDF"
    echo
done

echo "================================"
echo "Done!"
echo "PNG  → ./png/"
echo "WebP → ./webp/"
echo "================================"
