// Editable site copy — the homepage text, banners and the header strip.
// Each field has a default so the site reads correctly before anything is
// saved. Admin → Site content renders its form from this list, and only these
// keys can be saved. Multi-line fields keep their line breaks.

const SITE_CONTENT_SECTIONS = [
  {
    id: 'seo',
    title: 'Homepage SEO',
    description: 'Shown in the browser tab and in search results.',
    fields: [
      { key: 'home_meta_title', label: 'Page title', max: 120, default: 'The Kit Loop — Buy & Sell Sports Kit' },
      { key: 'home_meta_description', label: 'Meta description', type: 'textarea', max: 300, default: 'The UK marketplace for second-hand sports equipment. Find great deals or clear out your kit bag.' },
    ],
  },
  {
    id: 'announcement',
    title: 'Header strip',
    description: 'The green bar above the main navigation (desktop).',
    fields: [
      { key: 'announcement_1', label: 'Message 1', max: 140, default: 'Every purchase covered by The Kit Loop Buyer Protection' },
      { key: 'announcement_2', label: 'Message 2', max: 140, default: 'Raise a dispute within 48 hours if an item isn’t as described' },
      { key: 'announcement_3', label: 'Message 3', max: 140, default: 'Free to list · Sell to sports fans across the UK' },
    ],
  },
  {
    id: 'hero',
    title: 'Hero banner',
    description: 'The large banner at the top of the homepage.',
    fields: [
      { key: 'hero_eyebrow', label: 'Badge text', max: 80, default: 'The UK marketplace for pre-loved sports kit' },
      { key: 'hero_title', label: 'Headline', type: 'textarea', max: 120, help: 'Press Enter for a line break.', default: 'Quality kit.\nSecond time round.' },
      { key: 'hero_subtitle', label: 'Intro text', type: 'textarea', max: 300, default: 'Buy and sell used football, rugby, cricket and tennis equipment from rated sellers, with buyer protection on every order.' },
      { key: 'hero_cta_primary', label: 'Main button', max: 40, default: 'Shop the kit' },
      { key: 'hero_cta_secondary', label: 'Second button', max: 40, default: 'Start selling' },
      { key: 'hero_trending_label', label: 'Trending label', max: 30, default: 'Trending:' },
      { key: 'hero_protection_title', label: 'Protection card title', max: 60, default: 'Buyer Protection' },
      { key: 'hero_protection_subtitle', label: 'Protection card text', max: 80, default: 'On every purchase · 48-hour disputes' },
    ],
  },
  {
    id: 'hero_side',
    title: 'Hero side cards',
    description: 'The cards to the right of the hero banner (desktop).',
    fields: [
      { key: 'just_listed_label', label: '“Just listed” label', max: 30, default: 'Just listed' },
      { key: 'just_listed_empty_title', label: 'No-listing title', max: 60, default: 'Fresh kit lands every day' },
      { key: 'just_listed_empty_body', label: 'No-listing text', max: 140, default: 'Browse the newest listings from sellers across the UK.' },
      { key: 'side_sell_title', label: 'Sell card title', max: 60, default: 'Got kit gathering dust?' },
      { key: 'side_sell_body', label: 'Sell card text', type: 'textarea', max: 160, default: 'List free in minutes and sell to sports fans across the UK.' },
      { key: 'side_sell_cta', label: 'Sell card button', max: 40, default: 'List an item' },
    ],
  },
  {
    id: 'sports',
    title: 'Shop by sport',
    fields: [
      { key: 'sports_title', label: 'Heading', max: 60, default: 'Shop by sport' },
      { key: 'sports_subtitle', label: 'Subheading', type: 'textarea', max: 200, default: 'Browse everything in a sport, or jump straight to boots, kits and protection.' },
    ],
  },
  {
    id: 'featured',
    title: 'Featured listings',
    fields: [
      { key: 'featured_title', label: 'Heading', max: 60, help: 'Leave as is to show “Featured Listings” / “Latest Listings” automatically.', default: '' },
      { key: 'featured_subtitle', label: 'Subheading', max: 160, default: 'Hand-picked kit from sellers across the UK.' },
      { key: 'featured_cta', label: 'Button', max: 40, default: 'View all listings' },
    ],
  },
  {
    id: 'trust',
    title: 'Trust signals',
    description: 'The three reassurance cards below the listings.',
    fields: [
      { key: 'trust_1_title', label: 'Card 1 title', max: 60, default: 'Buyer Protection' },
      { key: 'trust_1_body', label: 'Card 1 text', type: 'textarea', max: 200, default: 'Every purchase is covered by our buyer protection guarantee.' },
      { key: 'trust_2_title', label: 'Card 2 title', max: 60, default: 'Easy returns' },
      { key: 'trust_2_body', label: 'Card 2 text', type: 'textarea', max: 200, default: 'Raise a dispute within 48 hours if an item isn’t as described.' },
      { key: 'trust_3_title', label: 'Card 3 title', max: 60, default: 'Verified sellers' },
      { key: 'trust_3_body', label: 'Card 3 text', type: 'textarea', max: 200, default: 'Community ratings and reviews for every seller.' },
    ],
  },
  {
    id: 'sell',
    title: '“Ready to declutter?” banner',
    description: 'The seller banner at the bottom of the homepage.',
    fields: [
      { key: 'sell_eyebrow', label: 'Small heading', max: 40, default: 'For sellers' },
      { key: 'sell_title', label: 'Headline', max: 80, default: 'Ready to declutter?' },
      { key: 'sell_body', label: 'Text', type: 'textarea', max: 300, default: 'Turn your pre-loved sports gear into cash. List in minutes, sell to thousands of sports fans across the UK.' },
      { key: 'sell_cta_primary', label: 'Main button', max: 40, default: 'Sell now' },
      { key: 'sell_cta_secondary', label: 'Second button', max: 40, default: 'Learn how it works' },
      { key: 'sell_step_1_title', label: 'Step 1 title', max: 60, default: 'Snap and list' },
      { key: 'sell_step_1_body', label: 'Step 1 text', max: 160, default: 'Add photos, condition and price in a few minutes.' },
      { key: 'sell_step_2_title', label: 'Step 2 title', max: 60, default: 'Sell and ship' },
      { key: 'sell_step_2_body', label: 'Step 2 text', max: 160, default: 'Chat with buyers, then post with a prepaid label.' },
      { key: 'sell_step_3_title', label: 'Step 3 title', max: 60, default: 'Get paid' },
      { key: 'sell_step_3_body', label: 'Step 3 text', max: 160, default: 'Funds are released once the buyer confirms delivery.' },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    fields: [
      { key: 'footer_tagline', label: 'Tagline', type: 'textarea', max: 200, default: 'The trusted marketplace for buying and selling quality used sports equipment.' },
      { key: 'footer_email', label: 'Support email', max: 120, default: 'support@thekitloop.com' },
    ],
  },
];

const SITE_CONTENT_FIELDS = SITE_CONTENT_SECTIONS.flatMap((s) => s.fields);
const SITE_CONTENT_DEFAULTS = Object.fromEntries(SITE_CONTENT_FIELDS.map((f) => [f.key, f.default]));

module.exports = { SITE_CONTENT_SECTIONS, SITE_CONTENT_FIELDS, SITE_CONTENT_DEFAULTS };
