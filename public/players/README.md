# Player images

Drop your player cut-out images in this folder, then point to them from
`src/dreamXI.js` using the `image` field.

## How to use

1. Save an image here, e.g. `public/players/ronaldo.png`.
2. In `src/dreamXI.js`, set that player's `image` to the path **from the site
   root** (starts with `/players/`, no `public`):

   ```js
   { id: 'st', pos: 'ST', name: 'Cristiano Ronaldo', rating: 91,
     image: '/players/ronaldo.png', ... }
   ```

3. Leave `image` as `''` (empty) to keep the generic silhouette placeholder.

## Tips

- **Transparent PNGs** (background removed) look best — the player floats on
  the card like a real FUT card. A plain JPG works too but shows its own
  rectangular background.
- Roughly **square or portrait** crops framed on the head/torso sit best in the
  card's portrait area; the image is centered and scaled to fill.
- Keep files reasonably small (a few hundred KB) so the page stays fast — these
  ship as-is to GitHub Pages.
- Any filename is fine; just match it exactly in `image` (paths are
  case-sensitive on GitHub Pages).
