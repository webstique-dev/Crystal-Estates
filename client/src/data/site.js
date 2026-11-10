// ─────────────────────────────────────────────────────────────
// Crystal Estates Website Developer Brief — Data Source
// ─────────────────────────────────────────────────────────────

export const business = {
  name: 'Crystal Estates',
  tagline: 'ASSETS CREATOR',
  flagship: 'Vedanthangal Sandalwood Farm Land – 15 Acres',
  address: {
    line1: 'No. 9, A.K.R. Nagar Main Road',
    line2: 'Crystal Tower, Ground Floor A, Valasaravakkam',
    city: 'Chennai – 600087',
    full: 'No. 9, A.K.R. Nagar Main Road, Crystal Tower, Ground Floor A, Valasaravakkam, Chennai – 600087',
  },
  phone: '+91 94440 00000',
  whatsapp: '919444000000',
  email: 'info@crystalestates.in',
  hours: 'Mon – Sat, 9:30 AM – 7:00 PM',
  justdial:
    'https://www.justdial.com/Chennai/Crystal-Estates-Behind-Singer-Mano-House-Sridevi-Gardens-Akr-Nagar-Valasaravakkam/044PXX44-XX44-120829104352-B8B1_BZDET',
  mapQuery: 'Crystal Tower AKR Nagar Main Road Valasaravakkam Chennai 600087',
  disclaimer:
    'Disclaimer: Images and renders are for representation purposes only. Details, dimensions, and specifications are subject to change. Buyers are advised to verify all legal documents and approvals before purchase.',
}

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News', href: '/news' },
  { label: 'Sell Your Land', href: '/sell-your-land' },
  { label: 'Contact', href: '/contact' },
]

export const services = [
  {
    id: 'residential-plots',
    title: 'Residential Plots',
    description: 'CMDA and DTCP approved plotted lands in rapidly appreciating residential corridors across Chennai with clear demarcation, blacktop roads, and ready for immediate registration.',
    href: '/services',
  },
  {
    id: 'farm-land',
    title: 'Agricultural & Farm Land',
    description: 'Managed agricultural land and high-yield agro-forestry sandalwood estates offering compounding capital appreciation, continuous maintenance, drip irrigation, and individual patta.',
    href: '/services',
  },
  {
    id: 'registered-land',
    title: 'Registered Land & Clear Titles',
    description: '100% legally vetted registered lands with verified parent title documents, encumbrance certificates, revenue records, and spot registration guidance.',
    href: '/services',
  },
  {
    id: 'individual-plots',
    title: 'Individual Plots',
    description: 'Independent individual plot holdings suited for customized investment sizes, long-term wealth preservation, and standalone asset ownership.',
    href: '/services',
  },
  {
    id: 'bulk-land',
    title: 'Bulk Land & Acreage',
    description: 'Large contiguous multi-acre parcels suitable for agro-forestry, institutional investment, private estates, and generational land banking.',
    href: '/services',
  },
  {
    id: 'purchase-resale',
    title: 'Land Purchase & Resale',
    description: 'End-to-end strategic land acquisition, precise valuation assessments, title due diligence, and reliable resale facilitation for landowners and investors.',
    href: '/services',
  },
  {
    id: 'brokerage-advisory',
    title: 'Land Brokerage & Title Advisory',
    description: 'Transparent land brokerage with zero hidden fees, government registration facilitation, patta transfer assistance, and comprehensive survey verification.',
    href: '/services',
  },
]

export const stats = [
  { value: 15, suffix: ' Acres', label: 'Flagship Sandalwood Land' },
  { value: 100, suffix: '%', label: 'Clear-Title Guarantee' },
  { value: 500, suffix: '+', label: 'Happy Landowners' },
  { value: 10, suffix: '+', label: 'Years of Trust (Since 2014)' },
]

// Project & Plot Inventory (All loaded dynamically from MongoDB and CRM)
export const projects = []

// Backward compatibility alias for any existing imports
export const plots = projects

export const searchOptions = {
  locations: [],
  types: ['All Types', 'Farm Land', 'Residential Plot', 'Agricultural', 'Bulk land'],
  budgets: [
    { label: 'Any budget', max: Infinity },
    { label: 'Under ₹50 Lakh', max: 5000000 },
    { label: 'Under ₹75 Lakh', max: 7500000 },
    { label: 'Under ₹1 Crore', max: 10000000 },
    { label: 'Above ₹1 Crore', max: Infinity, min: 10000000 },
  ],
  sizes: [
    { label: 'Any size', min: 0, max: Infinity },
    { label: 'Quarter Acre / 1000 sq.ft', min: 0, max: 11000 },
    { label: 'Half Acre / 20000 sq.ft', min: 11000, max: 22000 },
    { label: '1 Acre+ / Farm Plot', min: 22000, max: Infinity },
  ],
}

// Why Sandalwood & Farm Land (Section 3 & 4 of Brief)
export const whySandalwood = [
  {
    icon: 'TreePine',
    title: 'High-Value Sandalwood Asset',
    text: 'Santalum Album (East Indian Sandalwood) is one of the world’s most prized commercial timbers, offering exceptional multi-fold capital appreciation upon legal maturity.',
  },
  {
    icon: 'Sprout',
    title: 'Professional Farm Management',
    text: 'Complete peace of mind: our experienced agro-forestry team manages pruning, automated drip irrigation, organic nutrition, and security around the clock.',
  },
  {
    icon: 'ShieldCheck',
    title: '100% Clear Titles & Individual Patta',
    text: 'Strict legal vetting, clear marketable titles, individual patta registration, and full documentation transparency before booking.',
  },
  {
    icon: 'Fence',
    title: 'Gated Perimeter & 24/7 Security',
    text: 'Protected with solar security fencing, CCTV surveillance, perimeter trenching, and dedicated on-site security guards.',
  },
  {
    icon: 'Road',
    title: 'Prime Road Connectivity',
    text: 'Located close to the GST road corridor with direct 30-ft internal access roads, offering an effortless weekend escape from Chennai.',
  },
  {
    icon: 'Handshake',
    title: 'Guided Visits & After-Sales Care',
    text: 'Complimentary weekend site visits with family pick-up support, periodic tree growth reports, and transparent harvest agreement structures.',
  },
]

// Features alias for backward compatibility
export const features = whySandalwood

export const galleryItems = [
  {
    id: 1,
    title: 'Vedanthangal 15-Acre Aerial Drone Shot',
    category: 'Aerial',
    image: '/images/vedanthangal.jpg',
    caption: 'Lush green landscape of our flagship 15-acre sandalwood estate near Vedanthangal.',
  },
  {
    id: 2,
    title: 'Sandalwood Plantation Rows',
    category: 'Plantation',
    image: '/images/hero-estate.jpg',
    caption: 'Scientifically spaced sandalwood saplings with automated drip irrigation channels.',
  },
  {
    id: 3,
    title: 'Kolapakkam Residential Layout',
    category: 'Layouts',
    image: '/images/kolapakkam.jpg',
    caption: 'CMDA-approved plotted layout with blacktop avenue roads and boundary stones.',
  },
  {
    id: 4,
    title: 'Somamangalam Gated Community',
    category: 'Layouts',
    image: '/images/somamangalam.jpg',
    caption: 'DTCP-approved residential parcel ready for immediate plot demarcation and registration.',
  },
  {
    id: 5,
    title: 'Estate Perimeter & Green Landscaping',
    category: 'Site',
    image: '/images/brammadesam.jpg',
    caption: 'Solar-fenced boundary and mature avenue trees lining the primary access corridor.',
  },
  {
    id: 6,
    title: 'Weekend Site Visit & Family Gathering',
    category: 'Events',
    image: '/images/ozhalai-panchayath.jpg',
    caption: 'Happy buyers experiencing guided on-ground walk-throughs with our property advisors.',
  },
]

export const steps = [
  {
    num: '01',
    title: 'Enquire',
    text: 'Share your investment goals, preferred land size, or plot location with our team.',
  },
  {
    num: '02',
    title: 'Site Visit',
    text: 'Join our guided weekend site visit with complimentary door-step pick-up on request.',
  },
  {
    num: '03',
    title: 'Documentation',
    text: 'Review legal parent documents, patta, government approvals, and survey records.',
  },
  {
    num: '04',
    title: 'Registration',
    text: 'Sign the legal agreement and complete official registration with crystal-clear guidance.',
  },
  {
    num: '05',
    title: 'Handover',
    text: 'Receive demarcated land possession, boundary marking, patta, and ongoing management agreement.',
  },
]

export const testimonials = [
  {
    name: 'Dr. Ramesh Kumar',
    place: 'Chennai',
    project: 'Vedanthangal Sandalwood Farm Land',
    text: 'Investing in the 15-acre Vedanthangal Sandalwood farmland was the best decision for our family legacy. The legal vetting was thorough, and having professional farm caretakers gives us complete peace of mind.',
  },
  {
    name: 'Priya Sundaram',
    place: 'Porur, Chennai',
    project: 'Kolapakkam Plots',
    text: 'Crystal Estates delivers exactly what they promise. Transparent pricing, no hidden registration fees, and their interactive layout map made picking our plot effortless.',
  },
  {
    name: 'Anand Muralidharan (NRI)',
    place: 'Singapore / Chennai',
    project: 'Somamangalam Layout',
    text: 'As an NRI, clear titles and reliable communication were my highest priorities. Crystal Estates managed document verification and registration with total honesty and zero pressure.',
  },
]

export const faqs = [
  {
    q: 'What is the flagship Vedanthangal Sandalwood Farm Land project?',
    a: 'It is a 15-acre managed agro-forestry farmland near the famous Vedanthangal Bird Sanctuary. Buyers acquire demarcated farmland plots planted with valuable sandalwood trees, fully maintained by our expert farming team with drip irrigation, security, and legal harvesting rights.',
  },
  {
    q: 'Is it legal to own and cultivate sandalwood in Tamil Nadu?',
    a: 'Yes, completely legal. Under Tamil Nadu government forest department amendments, private individuals can own sandalwood trees on patta land. Crystal Estates ensures all plantation records and forest department compliances are strictly maintained.',
  },
  {
    q: 'Are your residential plots DTCP, CMDA, and RERA approved?',
    a: 'Yes. Every residential layout explicitly displays its approval credentials (e.g. Kolapakkam is CMDA-approved, Somamangalam & Brammadesam are DTCP-approved, and Ozhalai Panchayath is RERA-registered).',
  },
  {
    q: 'Can I get a bank loan for purchasing land?',
    a: 'Yes. Our approved residential plots are partnered with leading nationalized and private banks. Our legal and finance desk assists you with all loan paperwork from start to finish.',
  },
  {
    q: 'How do I book a guided site visit?',
    a: 'Simply click "Book Site Visit", select your preferred weekend date, and our relationship manager will arrange a personalized tour, including complimentary pickup upon request.',
  },
]

export const teamMembers = [
  {
    name: 'Ramesh Kumar',
    role: 'Lead Property & Farmland Advisor',
    image: '/images/team-1.jpg',
  },
  {
    name: 'Karthik Sundaram',
    role: 'Head of Legal & Title Verification',
    image: '/images/team-2.jpg',
  },
  {
    name: 'Arun Prakash',
    role: 'Farm & Site Development Manager',
    image: '/images/team-3.jpg',
  },
]

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X', href: 'https://x.com' },
]
