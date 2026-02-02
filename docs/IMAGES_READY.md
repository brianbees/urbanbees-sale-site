# ⚠️ OBSOLETE - Product Images Setup

**Status:** This document is obsolete as of Feb 2, 2026.  
**Current System:** All product images are now managed through the admin panel at https://urbanbees-product-admin.vercel.app and stored in Supabase Storage.  
**Kept for historical reference only.**

---

# Product Images - Setup Complete ✅ (Legacy)

## What's Been Done

1. **Created 68 placeholder image files** in `public/images/`
2. **Updated all products** in `src/data/products.ts` to reference local images
3. **Created a placeholder.jpg** as fallback for missing images
4. **Created IMAGE_MAPPING.md** with complete product-to-image mapping

## Next Steps

### Replace Placeholder Images

Simply copy your actual product photos into `public/images/` with the **exact filenames** listed below. The site will automatically display them!

### Image Files to Replace:

All 68 placeholder `.jpg` files in `public/images/` are ready for your actual photos:

- `brood-1412-cedar.jpg`
- `endboard-1412-wood.jpg`
- `nuc-1412-cedar.jpg`
- `travel-1412-osb.jpg`
- `travel-1412-ply.jpg`
- `travel-1412-plastic.jpg`
- `queen-trap-1412.jpg`
- `obs-hive.jpg`
- `drone-frames.jpg`
- `wbc-brood.jpg`
- `wbc-super.jpg`
- `wbc-coverboard.jpg`
- `wbc-queen-excluder.jpg`
- `wbc-lifts.jpg`
- `stand-square.jpg`
- `stand-sloping.jpg`
- `stand-double.jpg`
- `lid-deep-metal.jpg`
- `lid-shallow-metal.jpg`
- `lid-gabled.jpg`
- `brood-national-metal.jpg`
- `brood-national-castellated.jpg`
- `brood-national-flatpack.jpg`
- `brood-national-poly.jpg`
- `super-national-plastic.jpg`
- `super-national-castellated.jpg`
- `super-national-metal.jpg`
- `super-national-frames.jpg`
- `super-national-flatpack.jpg`
- `coverboard-wood.jpg`
- `coverboard-glass.jpg`
- `queen-excluder-metal.jpg`
- `queen-excluder-plastic.jpg`
- `omf-wire.jpg`
- `omf-tray.jpg`
- `varroa-board.jpg`
- `entrance-block.jpg`
- `frame-trap-queen.jpg`
- `feeder-eke.jpg`
- `clearer-board.jpg`
- `feeder-cedar.jpg`
- `endboard-plastic.jpg`
- `nuc-green-ply.jpg`
- `nuc-thornes.jpg`
- `nuc-paynes-poly.jpg`
- `nuc-park-poly.jpg`
- `nuc-stehr.jpg`
- `travel-flatpack.jpg`
- `sidebars-dn.jpg`
- `sidebars-sn.jpg`
- `topbars.jpg`
- `sidebars-1412.jpg`
- `frame-spacers.jpg`
- `runners-metal.jpg`
- `foundation-unwired.jpg`
- `spinner-2frame.jpg`
- `extractor-logar.jpg`
- `honey-showcase.jpg`
- `jars-55ml.jpg`
- `apidea.jpg`
- `queen-rearing-kit.jpg`
- `skep.jpg`
- `teaching-frames.jpg`
- `suit-full.jpg` (used for all suit sizes)
- `smock-fencing.jpg`
- `smock-round-heavy.jpg`
- `smock-round-light.jpg`
- `hat-round.jpg`
- `buzz-workwear.jpg` (used for all Buzz sizes)
- `wellies.jpg` (used for all welly sizes)
- `thornes-legs.jpg`

## Image Specifications

**Recommended:**
- Format: JPG
- Size: 800-1200px width (will be automatically responsive)
- Aspect Ratio: 4:3 or 16:9 works well
- File size: Keep under 500KB for fast loading

**The site will work immediately with placeholders!** Just replace images as you get them.

## Testing

Run the dev server to see your products:
```bash
npm run dev
```

Visit: http://localhost:3000

All products now display with their designated image paths!
