// src/data/products.ts
// Cleaned from "regents park stock check.docx"
//
// Notes:
// - Prices are GBP and use your "Our price" as the sell price.
// - Where the doc had unknowns (x, ?, missing totals), I set price/stock as null or used best-effort.
// - "msrp" is the reference/anchor price (often "Thornes Price" or a noted external price).
// - You can safely delete products you don't want on the public sale page.

export type Currency = "GBP";

export type ProductCategory =
  | "Brood Boxes"
  | "Supers"
  | "Nucs & Travel"
  | "Floors & Stands"
  | "Lids & Roofs"
  | "Boards & Excluders"
  | "Frames & Foundation"
  | "Extraction & Honey"
  | "Queen Rearing"
  | "Apparel"
  | "Footwear"
  | "Accessories"
  | "Misc";

export type OptionType = "select";

export interface ProductOption {
  id: string; // e.g. "size"
  label: string; // e.g. "Size"
  type: OptionType;
  values: string[];
}

export interface ProductVariant {
  id: string; // unique within product
  sku?: string;
  optionValues: Record<string, string>; // optionId -> chosen value
  price: number | null; // sell price (Our price)
  msrp?: number | null; // reference price (e.g. Thornes)
  stockQty: number | null; // if unknown use null
  notes?: string;
}

export interface ProductImage {
  src: string; // placeholder for now (Unsplash or later /public)
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description?: string;
  features?: string[];
  currency: Currency;
  options?: ProductOption[];
  variants: ProductVariant[];
  images: ProductImage[];
  additionalImages?: string[];
  tags?: string[];
  isFeatured?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Helper to create a single-variant product with no options.
 */
function singleVariant(
  id: string,
  name: string,
  category: ProductCategory,
  price: number | null,
  stockQty: number | null,
  msrp?: number | null,
  notes?: string,
  imageSrc?: string,
  description?: string,
  features?: string[]
): Product {
  const slug = name
    .toLowerCase()
    .replace(/\(|\)|,|\/|\?/g, '')
    .replace(/\s+/g, '-')
    .replace(/—/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return {
    id,
    name,
    slug,
    category,
    description,
    features,
    currency: "GBP",
    variants: [
      {
        id: "default",
        optionValues: {},
        price,
        msrp: msrp ?? null,
        stockQty,
        notes,
      },
    ],
    images: [
      {
        src: imageSrc || "/images/placeholder.jpg",
        alt: name,
      },
    ],
  };
}

export const products: Product[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 14x12 items
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "bb-1412-assembled-cedar",
    name: "14x12 Brood Box (Assembled, Cedar)",
    slug: "14x12-brood-box-assembled-cedar",
    category: "Brood Boxes",
    description: "Seasoned cedar with a weathered patina. Includes propolis/wax character.",
    features: [
      "Fits 14x12 frames",
      "Rot-resistant",
      "Hand-assembled"
    ],
    currency: "GBP",
    variants: [
      {
        id: "default",
        optionValues: {},
        price: 68,
        msrp: 136.60,
        stockQty: 14,
        notes: "Doc line: '14 x 12 Brood box assembled' (Thornes Price anchor).",
      },
    ],
    images: [
      {
        src: "/images/brood-1412-cedar.jpg",
        alt: "14x12 Brood Box (Assembled, Cedar) - Front View",
      },
    ],
  },

  singleVariant(
    "endboard-1412-wood",
    "14x12 End Board (Wood)",
    "Accessories",
    9.5,
    14,
    19,
    "Doc line: '14 x 12 End board Wood' (some text looked like £19 / £5.49; using £19 as anchor).",
    "/images/endboard-1412-wood.jpg",
    "Solid wood divider for colony management.",
    ["Insulating", "Used condition", "Precision fit"]
  ),

  // 14x12 nuc boxes (cedar; some without lids)
  {
    id: "nuc-1412-cedar",
    name: "14x12 Nuc Box (Cedar)",
    slug: "14x12-nuc-box-cedar",
    category: "Nucs & Travel",
    description: "Seasoned nucleus box for splits/swarms.",
    features: ["High insulation", "Weather-tested", "Propolis-scented"],
    currency: "GBP",
    options: [
      {
        id: "lid",
        label: "Lid",
        type: "select",
        values: ["With Lid", "No Lid"],
      },
    ],
    variants: [
      {
        id: "with-lid",
        optionValues: { lid: "With Lid" },
        price: 53,
        msrp: 106.60,
        stockQty: 2,
        notes: "Doc: '4 (2 no lid)' and '(£60 without lid)'. Assumption: 2 with lid, 2 without.",
      },
      {
        id: "no-lid",
        optionValues: { lid: "No Lid" },
        price: 30,
        msrp: 60,
        stockQty: 2,
        notes: "Doc explicitly notes £30 for no-lid option.",
      },
    ],
    images: [
      {
        src: "/images/nuc-1412-cedar.jpg",
        alt: "14x12 Nuc Box (Cedar)",
      },
    ],
    tags: ["14x12", "cedar"],
  },

  // 14x12 travel boxes
  singleVariant(
    "travel-1412-osb",
    "14x12 Travel Box (OSB)",
    "Nucs & Travel",
    null,
    7,
    null,
    "Doc has x for prices.",
    "/images/travel-1412-osb.jpg",
    "Secure ventilated transport for deep frames.",
    ["Safe transit", "Sturdy latches", "Field-used"]
  ),
  singleVariant(
    "travel-1412-ply",
    "14x12 Travel Box (Plywood)",
    "Nucs & Travel",
    26,
    3,
    52,
    "Doc line: 'Travel box Plywood' (Thornes £52, our £26).",
    "/images/travel-1412-ply.jpg",
    "Secure ventilated transport for deep frames.",
    ["Safe transit", "Sturdy latches", "Field-used"]
  ),
  singleVariant(
    "travel-1412-plastic",
    "14x12 Travel Box (Plastic)",
    "Nucs & Travel",
    6,
    2,
    11.95,
    "Doc line: 'Travel box Plastic' (Thornes £11.95, our £6).",
    "/images/travel-1412-plastic.jpg",
    "Secure ventilated transport for deep frames.",
    ["Safe transit", "Sturdy latches", "Field-used"]
  ),

  singleVariant(
    "queen-trap-1412",
    "14x12 Frame Trap for Queen (Plastic)",
    "Queen Rearing",
    null,
    2,
    null,
    "Doc has x for prices.",
    "/images/queen-trap-1412.jpg",
    "Plastic isolation tool for queen management.",
    ["Precision slots", "Durable", "Cleaned for use"]
  ),

  singleVariant(
    "obs-hive-1412",
    "Observation Hive (Wood/Glass)",
    "Misc",
    350,
    1,
    610,
    "Doc line: 'Observation hive' (Thornes £610, our £350).",
    "/images/obs-hive.jpg",
    "Educational glass-sided hive.",
    ["Real glass", "Solid wood", "Used for display"]
  ),

  // Drone frames (wax)
  singleVariant(
    "drone-frames-wax",
    "Drone Frames (Wax)",
    "Frames & Foundation",
    5,
    20,
    10.10,
    "Doc: '£10.10 for 10' → using £10.10 anchor as noted; your price £5.",
    "/images/drone-frames.jpg",
    "Seasoned frames for drone brood management.",
    ["Wax residue", "Standard fit", "Used condition"]
  ),

  // ─────────────────────────────────────────────────────────────────────────────
  // WBC items
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("wbc-brood-cedar", "WBC Brood Box (Cedar)", "Brood Boxes", 29, 1, 58.3, undefined, "/images/wbc-brood.jpg", "Traditional double-walled inner box.", ["Seasoned cedar", "Classic fit", "Insulating"]),
  singleVariant("wbc-super-cedar", "WBC Super Box (Cedar)", "Supers", 21, 3, 42.4, undefined, "/images/wbc-super.jpg", "Seasoned honey storage for WBC hives.", ["Aged patina", "Standard size", "Propolis present"]),
  singleVariant("wbc-coverboard-cedar", "WBC Cover Board (Cedar)", "Boards & Excluders", 3.75, 1, 7.5, undefined, "/images/wbc-coverboard.jpg", "Inner hive cover for WBC configuration.", ["Solid cedar", "Used condition", "Bee-space accurate"]),
  singleVariant("wbc-qe-metal", "WBC Queen Excluder (Metal)", "Boards & Excluders", 14, 1, 28.2, undefined, "/images/wbc-queen-excluder.jpg", "Zinc or steel excluder for WBC.", ["Prevents queen travel", "Used", "Scrubbed clean"]),
  singleVariant("wbc-lifts-cedar", "WBC Lifts (Cedar)", "Accessories", 38, 5, 76.7, undefined, "/images/wbc-lifts.jpg", "Exterior protective walls for WBC hives.", ["Beautiful weathered cedar", "Interlocking", "Authentic look"]),

  // ─────────────────────────────────────────────────────────────────────────────
  // Stands (Any)
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("stand-square-cedar", "Hive Stand (Square, Cedar)", "Floors & Stands", 15, 5, 30, undefined, "/images/stand-square.jpg", "Sturdy weathered base to keep hives off the ground.", ["Rot-resistant", "Stable", "Used"]),
  singleVariant("stand-sloping-cedar", "Hive Stand (Sloping, Cedar)", "Floors & Stands", 22, 5, 43.4, undefined, "/images/stand-sloping.jpg", "Sturdy weathered base to keep hives off the ground.", ["Rot-resistant", "Stable", "Used"]),
  singleVariant("stand-double-cedar", "Hive Stand Double (Cedar, NEW)", "Floors & Stands", 42.5, 1, 85, undefined, "/images/stand-double.jpg", "Pristine unused double stand.", ["Fits two hives", "Brand New", "Solid Cedar"]),

  // ─────────────────────────────────────────────────────────────────────────────
  // Lids / roofs (metal)
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("lid-deep-metal", "Lid (Deep, Metal)", "Lids & Roofs", 56.8, 7, 113.6, undefined, "/images/lid-deep-metal.jpg", "Metal-capped protective covers.", ["Water-tight", "Galvanized", "Used condition"]),
  singleVariant("lid-shallow-metal", "Lid (Shallow, Metal)", "Lids & Roofs", 50, 3, 99.7, undefined, "/images/lid-shallow-metal.jpg", "Metal-capped protective covers.", ["Water-tight", "Galvanized", "Used condition"]),
  singleVariant("lid-gabled-metal", "Gabled Lid (Metal)", "Lids & Roofs", 61.25, 5, 122.5, undefined, "/images/lid-gabled.jpg", "Metal-capped protective covers.", ["Water-tight", "Galvanized", "Used condition"]),

  // Entrance blocks (FREE)
  singleVariant("entrance-block-cedar", "Entrance Block (Cedar)", "Accessories", 0, 16, 1.5, "Marked FREE.", "/images/entrance-block.jpg", "Used wooden block for pest control.", ["Fits National", "Used", "Solid wood"]),

  // ─────────────────────────────────────────────────────────────────────────────
  // National (N) brood boxes / supers / boards / excluders
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant(
    "n-brood-metal-runners",
    "National Brood Box (Cedar, Metal Runners)",
    "Brood Boxes",
    50,
    6,
    103,
    undefined,
    "/images/brood-national-metal.jpg",
    "Working hive body with chosen runners.",
    ["Seasoned", "Sturdy", "Propolis character"]
  ),
  singleVariant(
    "n-brood-castellated",
    "National Brood Box (Cedar, Castellated)",
    "Brood Boxes",
    50,
    1,
    103,
    undefined,
    "/images/brood-national-castellated.jpg",
    "Working hive body with chosen runners.",
    ["Seasoned", "Sturdy", "Propolis character"]
  ),
  singleVariant(
    "n-brood-thornes-flatpack-new",
    "National Brood Box (Cedar, Flat-Pack, NEW)",
    "Brood Boxes",
    50,
    2,
    75,
    "Doc wording: 'Thorns Brood box flat pack? NEW' (pricing line appears inconsistent; using msrp £75, our £50).",
    "/images/brood-national-flatpack.jpg",
    "Unused, fresh-cut cedar.",
    ["Brand New", "High precision", "Needs assembly"]
  ),
  singleVariant(
    "n-brood-paynes-poly",
    "National Brood Box (Paynes, Polystyrene)",
    "Brood Boxes",
    20,
    2,
    39.49,
    "Doc says Ebay £39.49 anchor.",
    "/images/brood-national-poly.jpg",
    "High-density poly for warmth.",
    ["Used", "Lightweight", "Great insulation"]
  ),

  // Supers
  singleVariant(
    "n-super-plastic-runners",
    "National Super Box (Cedar, Plastic Runners)",
    "Supers",
    37,
    13,
    74,
    undefined,
    "/images/super-national-plastic.jpg",
    "Seasoned honey boxes.",
    ["Cedar construction", "Used", "Ready for bees"]
  ),
  singleVariant(
    "n-super-castellated",
    "National Super Box (Cedar, Castellated)",
    "Supers",
    37,
    6,
    74,
    undefined,
    "/images/super-national-castellated.jpg",
    "Seasoned honey boxes.",
    ["Cedar construction", "Used", "Ready for bees"]
  ),
  singleVariant(
    "n-super-metal-runners",
    "National Super Box (Cedar, Metal Runners)",
    "Supers",
    37,
    15,
    74,
    undefined,
    "/images/super-national-metal.jpg",
    "Seasoned honey boxes.",
    ["Cedar construction", "Used", "Ready for bees"]
  ),
  singleVariant(
    "n-super-with-frames",
    "National Super Box (Cedar, With Super Frames)",
    "Supers",
    70,
    2,
    144.5,
    "Doc shows a range £130.40–£144.50; using upper bound as msrp anchor.",
    "/images/super-national-frames.jpg",
    "Includes seasoned super frames.",
    ["Ready to use", "Used condition", "Bulk value"]
  ),
  singleVariant(
    "n-super-no-runners",
    "National Super Box (Cedar, No Runners)",
    "Supers",
    37,
    1,
    74,
    undefined,
    "/images/super-national-metal.jpg",
    "Seasoned honey boxes.",
    ["Cedar construction", "Used", "Ready for bees"]
  ),
  singleVariant(
    "n-super-flatpack-new",
    "National Super Box (Cedar, Flat-Pack, NEW)",
    "Supers",
    10,
    8,
    35,
    "Doc: '£20 (£35 assembled)' and 'Thornes Price £10' appears inconsistent; using msrp £35, our £10.",
    "/images/super-national-flatpack.jpg",
    "Fresh honey super parts.",
    ["Brand New", "Unused", "Precision cut"]
  ),

  // Cover boards
  singleVariant("n-coverboard-wood", "National Cover Board (Wood)", "Boards & Excluders", 3.75, 20, 7.5, undefined, "/images/coverboard-wood.jpg", "Inner covers for hive access.", ["Used", "Clear or solid", "Fits National"]),
  singleVariant("n-coverboard-glass", "National Cover Board (Glass)", "Boards & Excluders", 13, 5, 26.7, undefined, "/images/coverboard-glass.jpg", "Inner covers for hive access.", ["Used", "Clear or solid", "Fits National"]),

  // Queen excluders
  {
    id: "n-queen-excluder-metal",
    name: "National Queen Excluder (Metal)",
    slug: "national-queen-excluder-metal",
    category: "Boards & Excluders",
    currency: "GBP",
    options: [
      {
        id: "type",
        label: "Type",
        type: "select",
        values: ["Standard Metal", "Wire (Premium)"],
      },
    ],
    variants: [
      {
        id: "standard",
        optionValues: { type: "Standard Metal" },
        price: 3.5,
        msrp: 7.8,
        stockQty: 8,
        notes: "Doc line: '£7.80' and '£3.50'.",
      },
      {
        id: "wire",
        optionValues: { type: "Wire (Premium)" },
        price: 12,
        msrp: 24,
        stockQty: 8,
        notes: "Doc line: 'S £24 wire' and '£12'.",
      },
    ],
    images: [
      {
        src: "/images/queen-excluder-metal.jpg",
        alt: "National Queen Excluder (Metal)",
      },
    ],
    tags: ["national", "queen excluder"],
  },

  singleVariant(
    "n-queen-excluder-plastic",
    "National Queen Excluder (Plastic)",
    "Boards & Excluders",
    1.5,
    10,
    3.5,
    "Doc: Thornes £3.50, our £1.50.",
    "/images/queen-excluder-plastic.jpg",
    "Keeps honey clean of brood.",
    ["Precise spacing", "Used", "Functional"]
  ),

  // Floors / varroa / ekes / clearer boards / feeders
  singleVariant("n-omf-wire", "National Open Mesh Floor (Wire)", "Floors & Stands", 13, 14, 26, undefined, "/images/omf-wire.jpg", "Essential for Varroa control.", ["Used", "Ventilated", "Durable wire"]),
  singleVariant(
    "n-omf-tray-metal",
    "National OMF with Tray (Metal)",
    "Floors & Stands",
    15,
    8,
    null,
    "Doc has no msrp shown; uses '£15'.",
    "/images/omf-tray.jpg",
    "Floor with slide-out monitoring tray.",
    ["Varroa tracking", "Used", "Sturdy"]
  ),
  singleVariant("n-varroa-board-plastic", "Varroa Board (Plastic)", "Floors & Stands", 2, 2, 4.25, undefined, "/images/varroa-board.jpg", "Slide-in monitoring board.", ["Used", "Flexible", "Easy clean"]),

  singleVariant("n-frame-trap-queen-plastic", "Frame Trap for Queen (Plastic)", "Queen Rearing", null, 3, null, undefined, "/images/frame-trap-queen.jpg"),

  singleVariant("n-feeder-eke-cedar", "Feeder Eke (Cedar)", "Accessories", 4.75, 14, 9.5, undefined, "/images/feeder-eke.jpg", "Space-creator for feeding.", ["Seasoned wood", "Fits National", "Used"]),
  singleVariant("n-clearer-board-5cone", "Clearer Board (5 Cone, Cedar)", "Accessories", 9.45, 3, 18.9, undefined, "/images/clearer-board.jpg", "Rapid honey clearing tool.", ["Used", "Multiple cones", "Efficient"]),
  singleVariant("n-feeder-cedar", "Feeder (Cedar)", "Accessories", 23, 4, 46, undefined, "/images/feeder-cedar.jpg", "Traditional wooden top feeder.", ["Used", "Large capacity", "Waxed interior"]),
  singleVariant("n-end-board-plastic", "End Board (Plastic)", "Accessories", 4.25, 2, 8.5, undefined, "/images/endboard-plastic.jpg", "Lightweight divider.", ["Durable", "Used", "Easy to sanitize"]),

  // Nuc boxes (National section)
  singleVariant("n-nuc-green-ply", "Nuc Box (Green, Ply)", "Nucs & Travel", 17.5, 3, 35.21, undefined, "/images/nuc-green-ply.jpg", "Painted plywood nucleus box.", ["Weather-protected", "Used", "Standard fit"]),
  singleVariant("n-nuc-thornes-new", "Thornes Nuc Box (Cedar, NEW)", "Nucs & Travel", 75, 1, 106.6, undefined, "/images/nuc-thornes.jpg", "High-end brand new nuc box.", ["Pristine", "Famous quality", "Unused"]),
  singleVariant(
    "n-nuc-paynes-poly",
    "Paynes Nuc Box (Polystyrene)",
    "Nucs & Travel",
    25,
    3,
    49.99,
    "Doc mentions '+14x12 ext' and '(+3)'; treating as base nuc only.",
    "/images/nuc-paynes-poly.jpg",
    "High-insulation used poly nucs.",
    ["Very warm", "Lightweight", "Used"]
  ),
  singleVariant(
    "n-nuc-paynes-poly-extension",
    "Paynes 14x12 Extension (for Nuc Box)",
    "Nucs & Travel",
    null,
    3,
    null,
    "Doc indicates an extension exists but pricing unclear (+?).",
    "/images/nuc-paynes-poly.jpg",
    "Used poly extension for deeper colonies.",
    ["Used", "Fits Paynes Nucs", "Insulating"]
  ),
  singleVariant("n-nuc-park-poly", "Park Nuc Box (Polystyrene)", "Nucs & Travel", 25, 4, null, "Doc: '4?'", "/images/nuc-park-poly.jpg", "High-insulation used poly nucs.", ["Very warm", "Lightweight", "Used"]),
  singleVariant("n-nuc-stehr-poly", "STEHR Nuc Box (Polystyrene)", "Nucs & Travel", 25, 1, 50, undefined, "/images/nuc-stehr.jpg", "High-insulation used poly nucs.", ["Very warm", "Lightweight", "Used"]),

  singleVariant(
    "n-travel-flatpack-plastic",
    "Travel Box (Plastic, Flat-Pack)",
    "Nucs & Travel",
    5,
    4,
    12.8,
    "Doc: '4 (2 made up)' flat-pack; price £5.",
    "/images/travel-flatpack.jpg",
    "Unassembled modern travel box.",
    ["Lightweight", "Secure", "New/Old Stock"]
  ),

  // Frame parts
  singleVariant(
    "dn1-dn2-sidebars-pack",
    "DN1/DN2 Sidebars (Pack of 50, NEW)",
    "Frames & Foundation",
    10,
    1,
    20,
    "Doc: 50 per pack x 1.25? and £20 per 50; using msrp £20, our £10.",
    "/images/sidebars-dn.jpg",
    "Packs of 50 fresh sidebars.",
    ["Brand New", "Bulk pack", "Pristine"]
  ),
  singleVariant(
    "sn1-sidebars-pack",
    "SN1 Sidebars (Pack of 50, NEW)",
    "Frames & Foundation",
    10,
    7,
    20,
    "Doc: 7 packs.",
    "/images/sidebars-sn.jpg",
    "Packs of 50 fresh sidebars.",
    ["Brand New", "Bulk pack", "Pristine"]
  ),

  singleVariant(
    "frame-top-bars-pack",
    "Frame Top Bars (Pack of 50)",
    "Frames & Foundation",
    null,
    1,
    null,
    "Doc has x for prices.",
    "/images/topbars.jpg",
    "Solid top bars in bulk.",
    ["Brand New", "Pack of 50", "Precision-cut"]
  ),
  singleVariant(
    "1412-sidebars-hoffman-pack",
    "14x12 Sidebars (Hoffman, Packs)",
    "Frames & Foundation",
    null,
    null,
    null,
    "Doc shows '50 per pack x 4.5' but missing pricing.",
    "/images/sidebars-1412.jpg",
    "Premium Hoffman spacers for deep frames.",
    ["Brand New", "Bulk pack", "Self-spacing"]
  ),

  singleVariant(
    "frame-spacers-plastic",
    "Frame Spacers (Plastic)",
    "Frames & Foundation",
    0,
    30,
    0.075,
    "Marked FREE (doc shows 0.075 reference).",
    "/images/frame-spacers.jpg",
    "Plastic separators for consistent comb.",
    ["Brand New", "Easy to use", "Durable"]
  ),

  // Runners (ambiguous two price lines)
  {
    id: "runners-metal",
    name: "Runners (Metal / Stainless?)",
    slug: "runners-metal-stainless",
    category: "Accessories",
    currency: "GBP",
    description: "Crisp stainless runners for smooth frames.",
    features: ["Brand New", "Quality metal", "Smooth glide"],
    options: [
      { id: "finish", label: "Finish", type: "select", values: ["Standard", "Stainless (SS?)"] },
    ],
    variants: [
      {
        id: "standard",
        optionValues: { finish: "Standard" },
        price: 0.45,
        msrp: 0.95,
        stockQty: 18,
        notes: "Doc: 'Tm £0.95' and '£0.45'.",
      },
      {
        id: "stainless",
        optionValues: { finish: "Stainless (SS?)" },
        price: 1,
        msrp: 2.05,
        stockQty: 18,
        notes: "Doc: 'OR ss £2.05' and '£1' (may be separate stock line).",
      },
    ],
    images: [
      {
        src: "/images/runners-metal.jpg",
        alt: "Hive runners",
      },
    ],
  },

  // Foundation
  {
    id: "foundation-unwired-wax",
    name: "Unwired Foundation (Wax Sheets)",
    slug: "unwired-foundation-wax-sheets",
    category: "Frames & Foundation",
    currency: "GBP",
    description: "Blank wax sheets for natural comb.",
    features: ["Brand New", "Unwired", "Pure beeswax"],
    options: [
      { id: "sheet", label: "Sheet Price", type: "select", values: ["0.45 each", "0.70 each"] },
    ],
    variants: [
      {
        id: "045",
        optionValues: { sheet: "0.45 each" },
        price: 0.45,
        msrp: 0.90,
        stockQty: 160,
        notes: "Doc: 'T s 0.90 / d £1.40' and your '£0.45/0.70'.",
      },
      {
        id: "070",
        optionValues: { sheet: "0.70 each" },
        price: 0.7,
        msrp: 1.4,
        stockQty: 160,
        notes: "Use if you want two price tiers; otherwise delete one variant.",
      },
    ],
    images: [
      {
        src: "/images/foundation-unwired.jpg",
        alt: "Wax foundation sheets",
      },
    ],
    tags: ["wax", "foundation"],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Extraction & honey equipment
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("spinner-2frame-plastic", "2-Frame Honey Spinner (Plastic)", "Extraction & Honey", 180, 1, 361, undefined, "/images/spinner-2frame.jpg", "Simple plastic hand-crank spinner.", ["Manual spin", "Easy to use", "Used"]),
  singleVariant(
    "extractor-logar-12frame-electric",
    "Logar 12-Frame Electric Extractor (Steel)",
    "Extraction & Honey",
    730,
    1,
    1460,
    undefined,
    "/images/extractor-logar.jpg",
    "Large-capacity electric extractor. Requires deep clean.",
    ["Electric", "12-frame", "Used"]
  ),
  singleVariant(
    "honey-frame-showcase",
    "Honey Frame Showing Case (Wood/Glass)",
    "Extraction & Honey",
    9,
    3,
    18,
    "Doc: 3 (2 NEW).",
    "/images/honey-showcase.jpg",
    "Display frame with glass front.",
    ["Great for demos", "Decorative", "Good condition"]
  ),
  singleVariant(
    "jars-55ml-box",
    "55ml Honey Jars (Boxes of 50, NEW)",
    "Extraction & Honey",
    95,
    2,
    47.5,
    "Doc: '50 per box x 2', anchor appears as £47.50 but totals suggest £95 for both boxes.",
    "/images/jars-55ml.jpg",
    "Cute mini honey jars.",
    ["Brand New", "Box of 50", "Mini size"]
  ),

  // ─────────────────────────────────────────────────────────────────────────────
  // Queen rearing / misc
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("apidea-queen-rearing", "Apidea Queen Rearing Box (Polystyrene)", "Queen Rearing", 20, 4, 30, undefined, "/images/apidea.jpg", "Compact queen-mating setup.", ["Poly", "Used", "4 available"]),
  singleVariant(
    "queen-rearing-kit-box",
    "Box of Queen Rearing Equipment",
    "Queen Rearing",
    50,
    1,
    null,
    "Doc shows £50?; treating as a single bundle item.",
    "/images/queen-rearing-kit.jpg",
    "Full kit for queen rearing.",
    ["Used", "Complete set", "Great value"]
  ),
  singleVariant("skep-straw", "Skep (Straw)", "Misc", 40, 1, 92.5, "Anchor shown as NBS £92.50.", "/images/skep.jpg", "Traditional straw beehive.", ["Decorative", "Used", "Vintage look"]),

  singleVariant(
    "teaching-frames",
    "Teaching Frames (Pics of Bees)",
    "Misc",
    null,
    12,
    null,
    "Doc has £?; set pricing later.",
    "/images/teaching-frame.jpg",
    "Photo frames for education.",
    ["No live bees needed", "12 available", "Visual aids"]
  ),

  // ─────────────────────────────────────────────────────────────────────────────
  // Apparel
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("suit-full-xl", "Full Suit (Heavy Cotton) — XL", "Apparel", 20, 1, 40, "Doc: veil? budget.", "/images/suit-full.jpg", "Full-body protection.", ["Heavy cotton", "Veil included", "Used"]),
  singleVariant("suit-full-l", "Full Suit (Heavy Cotton) — Large", "Apparel", 20, 4, 40, undefined, "/images/suit-full.jpg", "Full-body protection.", ["Heavy cotton", "Veil included", "Used"]),
  singleVariant("suit-full-m", "Full Suit (Heavy Cotton) — Medium", "Apparel", 20, 4, 40, undefined, "/images/suit-full.jpg", "Full-body protection.", ["Heavy cotton", "Veil included", "Used"]),
  singleVariant("suit-full-s", "Full Suit (Heavy Cotton) — Small", "Apparel", 20, 2, 40, undefined, "/images/suit-full.jpg", "Full-body protection.", ["Heavy cotton", "Veil included", "Used"]),

  singleVariant("smock-fencing-veil", "Smock (Fencing Veil, Heavy Cotton)", "Apparel", 12.5, 10, 25, undefined, "/images/smock-fencing.jpg", "Traditional smock with fencing veil.", ["Heavy cotton", "Classic style", "Used"]),
  singleVariant("smock-round-veil-heavy", "Smock (Round Veil, Heavy Cotton)", "Apparel", 12.5, 2, 25, undefined, "/images/smock-round-heavy.jpg", "Traditional smock with round veil.", ["Heavy cotton", "Better visibility", "Used"]),
  singleVariant("smock-round-veil-light", "Smock (Round Veil, Light Cotton)", "Apparel", 10, 6, 20, undefined, "/images/smock-round-light.jpg", "Lighter smock with round veil.", ["Light cotton", "Cooler option", "Used"]),
  singleVariant("hat-round-veil-light", "Round Hat with Veil (Light Cotton)", "Apparel", 7.5, 2, 15, undefined, "/images/hat-round.jpg", "Just head protection.", ["Lightweight", "Veil only", "Used"]),

  // Buzz work wear (NEW)
  singleVariant("buzz-workwear-2xl", "Buzz Work Wear (Poly-cotton) — 2XL (NEW)", "Apparel", 25, 1, 27.99, undefined, "/images/buzz-workwear.jpg", "Durable poly-cotton.", ["Brand New", "Buzz brand", "Poly-cotton blend"]),
  singleVariant("buzz-workwear-xl", "Buzz Work Wear (Poly-cotton) — XL (NEW)", "Apparel", 25, 1, 27.99, undefined, "/images/buzz-workwear.jpg", "Durable poly-cotton.", ["Brand New", "Buzz brand", "Poly-cotton blend"]),
  singleVariant("buzz-workwear-8xl", "Buzz Work Wear (Poly-cotton) — 8XL (NEW)", "Apparel", 25, 1, 27.99, undefined, "/images/buzz-workwear.jpg", "Durable poly-cotton.", ["Brand New", "Buzz brand", "Poly-cotton blend"]),
  singleVariant("buzz-workwear-l", "Buzz Work Wear (Poly-cotton) — Large (NEW)", "Apparel", 25, 1, 27.99, undefined, "/images/buzz-workwear.jpg", "Durable poly-cotton.", ["Brand New", "Buzz brand", "Poly-cotton blend"]),

  // ─────────────────────────────────────────────────────────────────────────────
  // Footwear
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant("wellies-6", "Wellington Boots (Green Rubber) — Size 6", "Footwear", 10, 2, 14.95, undefined, "/images/wellies.jpg", "Waterproof rubber boots.", ["Used", "Green", "Deep grip"]),
  singleVariant("wellies-5", "Wellington Boots (Green Rubber) — Size 5", "Footwear", 10, 2, 14.95, undefined, "/images/wellies.jpg", "Waterproof rubber boots.", ["Used", "Green", "Deep grip"]),
  singleVariant("wellies-4", "Wellington Boots (Green Rubber) — Size 4", "Footwear", 10, 2, 14.95, undefined, "/images/wellies.jpg", "Waterproof rubber boots.", ["Used", "Green", "Deep grip"]),

  // ─────────────────────────────────────────────────────────────────────────────
  // Items referenced but not priced (keep as placeholders so you can fill later)
  // ─────────────────────────────────────────────────────────────────────────────
  singleVariant(
    "thornes-legs-sloping-hive-set",
    "Thornes Legs (Sloping Hive) — Set (NEW)",
    "Floors & Stands",
    null,
    1,
    null,
    "Doc has x for prices.",
    "/images/thornes-legs.jpg"
  ),
];

/**
 * Optional: convenience export for featured items
 */
export const featuredProducts = products.filter((p) => p.isFeatured);

export default products;

