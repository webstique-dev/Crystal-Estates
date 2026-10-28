// ─────────────────────────────────────────────────────────────
// Single source of truth for all site content.
// Edit this file to update the website — no component changes needed.
// Items marked TODO are placeholders waiting for real details.
// ─────────────────────────────────────────────────────────────

export const business = {
  name: 'Crystal Estates',
  tagline: 'Plots you can trust. Land you can build a future on.',
  // Source: Justdial / CommonFloor listings
  address: {
    line1: 'No. 10, Akr Nagar, 4th Street, Sridevi Gardens',
    line2: 'Behind Singer Mano House, Valasaravakkam',
    city: 'Chennai, Tamil Nadu',
    full: 'No. 10, Akr Nagar, 4th Street, Sridevi Gardens, Behind Singer Mano House, Valasaravakkam, Chennai, Tamil Nadu',
  },
  phone: '+91 00000 00000', // TODO: real phone number
  whatsapp: '910000000000', // TODO: digits only, with country code
  email: 'info@crystalestates.in', // TODO: real email
  hours: 'Mon – Sat, 9:30 AM – 7:00 PM', // TODO: confirm hours
  justdial:
    'https://www.justdial.com/Chennai/Crystal-Estates-Behind-Singer-Mano-House-Sridevi-Gardens-Akr-Nagar-Valasaravakkam/044PXX44-XX44-120829104352-B8B1_BZDET',
  mapQuery: 'Crystal Estates Sridevi Gardens Valasaravakkam Chennai',
}

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Plots', href: '#plots' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
]

export const stats = [
  { value: 2, suffix: '', label: 'Projects completed' }, // from CommonFloor listing
  { value: 100, suffix: '%', label: 'Clear-title plots' }, // TODO: confirm
  { value: 500, suffix: '+', label: 'Happy families' }, // TODO: replace with real number
  { value: 10, suffix: '+', label: 'Years of experience' }, // TODO: replace with real number
]

// SAMPLE plots — replace with real inventory.
export const plots = [
  {
    id: 'ce-001',
    name: 'Sridevi Gardens Phase 1',
    location: 'Valasaravakkam',
    area: 1200,
    facing: 'East',
    price: 7800000,
    approval: 'DTCP Approved',
    status: 'Available',
    featured: true,
    image: '/images/plot-1.jpg',
  },
  {
    id: 'ce-002',
    name: 'Akr Nagar Premium Plots',
    location: 'Valasaravakkam',
    area: 1500,
    facing: 'North',
    price: 9900000,
    approval: 'CMDA Approved',
    status: 'Available',
    featured: true,
    image: '/images/plot-2.jpg',
  },
  {
    id: 'ce-003',
    name: 'Crystal Greens',
    location: 'Porur',
    area: 900,
    facing: 'West',
    price: 4950000,
    approval: 'DTCP Approved',
    status: 'Few Left',
    featured: true,
    image: '/images/plot-3.jpg',
  },
  {
    id: 'ce-004',
    name: 'Crystal Meadows',
    location: 'Mangadu',
    area: 1800,
    facing: 'South',
    price: 6300000,
    approval: 'RERA Registered',
    status: 'Available',
    featured: true,
    image: '/images/plot-4.jpg',
  },
  {
    id: 'ce-005',
    name: 'Leaf Avenue',
    location: 'Maduravoyal',
    area: 1000,
    facing: 'East',
    price: 6200000,
    approval: 'CMDA Approved',
    status: 'Few Left',
    featured: false,
    image: '/images/plot-1.jpg',
  },
  {
    id: 'ce-006',
    name: 'Crystal Heights Layout',
    location: 'Valasaravakkam',
    area: 2400,
    facing: 'North',
    price: 15600000,
    approval: 'CMDA Approved',
    status: 'Sold Out',
    featured: false,
    image: '/images/plot-2.jpg',
  },
]

export const teamMembers = [
  {
    name: 'Ramesh Kumar',
    role: 'Lead Property Advisor',
    image: '/images/team-1.jpg',
  },
  {
    name: 'Karthik Sundaram',
    role: 'Legal & Title Verification',
    image: '/images/team-2.jpg',
  },
  {
    name: 'Arun Prakash',
    role: 'Site Development Manager',
    image: '/images/team-3.jpg',
  },
]

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X', href: 'https://x.com' },
]

export const searchOptions = {
  locations: ['Valasaravakkam', 'Porur', 'Mangadu', 'Maduravoyal'],
  budgets: [
    { label: 'Any budget', max: Infinity },
    { label: 'Under ₹50 Lakh', max: 5000000 },
    { label: 'Under ₹75 Lakh', max: 7500000 },
    { label: 'Under ₹1 Crore', max: 10000000 },
    { label: 'Above ₹1 Crore', max: Infinity, min: 10000000 },
  ],
  sizes: [
    { label: 'Any size', min: 0, max: Infinity },
    { label: 'Up to 1,000 sq.ft', min: 0, max: 1000 },
    { label: '1,000 – 1,500 sq.ft', min: 1000, max: 1500 },
    { label: '1,500+ sq.ft', min: 1500, max: Infinity },
  ],
}

export const features = [
  { icon: 'ShieldCheck', title: 'Clear & verified titles', text: 'Every plot is legally vetted with encumbrance and patta checks before it is listed.' },
  { icon: 'BadgeCheck', title: 'Approved layouts', text: 'DTCP, CMDA and RERA-registered layouts so your registration and loan go smoothly.' },
  { icon: 'MapPin', title: 'Prime West Chennai', text: 'Plots in fast-growing Valasaravakkam, Porur and nearby, close to schools, hospitals and the metro.' },
  { icon: 'Wallet', title: 'Transparent pricing', text: 'No hidden charges. You get a clear price sheet covering registration and documentation.' },
  { icon: 'Landmark', title: 'Bank-loan friendly', text: 'Layouts approved by leading banks, with help preparing your loan paperwork.' },
  { icon: 'Handshake', title: 'End-to-end support', text: 'From the first site visit to registration and handover, one team stays with you.' },
]

export const steps = [
  { title: 'Enquire', text: 'Tell us your budget, preferred area and plot size.' },
  { title: 'Site visit', text: 'We arrange a guided visit — free pick-up on request.' },
  { title: 'Verify documents', text: 'Review title deeds, approvals and layout plan with our team.' },
  { title: 'Book & register', text: 'Pay a token, sign the agreement and complete registration.' },
  { title: 'Handover', text: 'Get possession with boundary marking and all original documents.' },
]

// SAMPLE reviews — replace with real customer reviews (e.g. from Justdial).
export const testimonials = [
  { name: 'Ramesh K.', place: 'Valasaravakkam', text: 'The team explained every document patiently. We registered our plot within three weeks with no surprises.' },
  { name: 'Priya S.', place: 'Porur', text: 'Honest pricing and very responsive. They arranged site visits around our weekend schedule.' },
  { name: 'Anand M.', place: 'Mangadu', text: 'Clear titles and a smooth bank loan process. I would happily recommend Crystal Estates.' },
]

export const faqs = [
  { q: 'Are all plots approved?', a: 'Yes. Each layout lists its approval type (DTCP, CMDA or RERA) on the plot card.' },
  { q: 'Can I get a bank loan for a plot?', a: 'Most of our layouts are bank-approved. Our team helps you with the paperwork.' },
  { q: 'Do you arrange site visits?', a: 'Absolutely. Send an enquiry and we will schedule a guided visit, including pick-up on request.' },
]
