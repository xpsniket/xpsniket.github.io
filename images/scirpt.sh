for img in *.{jpg,jpeg,png}; do
    [ -e "$img" ] || continue
    base="${img%.*}"
    magick "$img" -resize 1920x -quality 85 "${base}.webp"
done
