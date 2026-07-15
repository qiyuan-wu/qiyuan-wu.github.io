# Player images

Each player card on the pitch is one of these image files. Point to them from
`src/dreamXI.js` using the `image` field.

## How to use

1. Save the card image here, e.g. `public/players/ronaldo.webp`.
2. In `src/dreamXI.js`, set that player's `image` to the path **from the site
   root** (starts with `/players/`, no `public`):

   ```js
   { id: 'rw', pos: 'RW', name: 'Cristiano Ronaldo', image: '/players/ronaldo.webp', x: 78, y: 19 }
   ```

3. Leave `image: ''` to render a dashed "add a player" placeholder instead.

## Tips

- **Transparent background** (WebP or PNG) looks best — the card floats on the
  pitch. The whole image is shown as the card, so use a clean card cut-out.
- These render small (~90px wide). Keep files light: **~500px wide WebP** is
  plenty sharp and only ~60 KB. To shrink a big PNG:

  ```sh
  cwebp -q 82 -resize 500 0 big.png -o small.webp
  ```

- Filenames are case-sensitive on GitHub Pages, and spaces/accents can 404 —
  stick to lowercase ASCII (`vandijk.webp`, not `van Dijk.png`).
