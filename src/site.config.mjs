// Site-wide settings and the list of pages.
// To add a page: create src/pages/<name>.html and add an entry below.

export const site = {
  name: "The Heart of Noticing",
  origin: "https://www.theheartofnoticing.com",
  area: "Lancaster County, PA",
  phone: { display: "(717) 341-4153", tel: "+17173414153", schema: "+1-717-341-4153" },
  formAction: "https://usebasin.com/f/2f6670191032",
  year: 2026,
  // The thin strip across the top of every page. Set to null to hide it.
  // Anything still in [brackets] shows as a placeholder.
  // href: where the label and date link to. ctaHref: where the button goes (straight to the form).
  announce: { label: "Next nature group", labelShort: "Next group", detail: "[Date]", href: "/nature-groups", cta: "Reserve your spot", ctaShort: "Reserve", ctaHref: "/connect?interest=nature-groups" },
  // All artwork ships with the site, in public/images/
  images: {
    tree: "/images/tree.webp",
    birdOpen: "/images/bird-open.webp",
    birdClosed: "/images/bird-closed.webp",
    emily: "/images/emily.mp4",
    emilyWebm: "/images/emily.webm",
    emilyStill: "/images/emily-still.webp",
    emilyPhoto: "/images/emily-photo.webp",
    emilySession: "/images/emily-session.webp",
  },
}

// nav: shows the page in the menu and footer. offer: lists it as a service for search engines.
// flow: the colour the page's background drifts through as you scroll (dawn, earth, body, room, circle, dusk).
export const pages = [
  {
    file: "index.html",
    flow: "dawn",
    path: "/",
    title: "The Heart of Noticing | Somatic Breathwork in Lancaster, PA",
    description: "Somatic breathwork with Emily in Lancaster County, PA: 1-on-1 sessions, guided nature groups, and breathwork for schools and facilities.",
    structuredData: true,
  },
  {
    file: "meet-emily.html",
    preloadImage: "/images/emily-still.webp",
    flow: "dawn",
    path: "/meet-emily",
    title: "Meet Emily | The Heart of Noticing",
    description: "Meet Emily, the somatic breathwork guide behind The Heart of Noticing in Lancaster County, PA.",
    nav: { title: "Meet Emily", sub: "The guide" },
  },
  {
    file: "one-on-one.html",
    flow: "body",
    path: "/one-on-one",
    title: "1-on-1 Breathwork Sessions | The Heart of Noticing",
    description: "Private somatic breathwork sessions in Lancaster County, PA. Move at your own pace, release tension, and feel at home in your body again.",
    nav: { title: "1-on-1 Sessions", sub: "Notice the body" },
    offer: "Notice the Body: 1-on-1 Sessions",
  },
  {
    file: "nature-groups.html",
    preloadImage: "/images/stream.webp",
    flow: "earth",
    path: "/nature-groups",
    title: "Nature Groups | The Heart of Noticing",
    description: "Small, guided breathwork and nature-connection groups outdoors in Lancaster County, PA. No experience needed, just curiosity.",
    nav: { title: "Nature Groups", sub: "Notice the earth" },
    stream: true,
    offer: "Notice the Earth: Nature Groups",
  },
  {
    file: "schools.html",
    preloadImage: "/images/emily-session.webp",
    flow: "room",
    path: "/schools",
    title: "Breathwork for Schools & Facilities | The Heart of Noticing",
    description: "Breathwork for schools, recovery centers, and organizations in Lancaster County, PA. Simple, powerful breathing tools that are accessible and safe.",
    nav: { title: "Schools & Facilities", sub: "Notice the room" },
    offer: "Notice the Room: Schools & Facilities",
  },
  {
    file: "the-circle.html",
    flow: "circle",
    path: "/the-circle",
    title: "The Circle | The Heart of Noticing",
    description: "Join The Circle: personal, never-automated emails from Emily with upcoming sessions, writings, artwork, and gentle reminders to breathe.",
    nav: { title: "The Circle", sub: "Stay close" },
    offer: "Stay Close: The Circle",
  },
  {
    file: "connect.html",
    flow: "dusk",
    path: "/connect",
    title: "Connect with Emily | The Heart of Noticing",
    description: "Book a discovery call or send Emily a message about 1-on-1 breathwork, nature groups, or sessions for your school or facility.",
    nav: { title: "Connect", sub: "Call or send a message" },
  },
  {
    file: "404.html",
    flow: "dawn",
    path: "/404",
    title: "Page not found | The Heart of Noticing",
    description: "This page could not be found.",
    noindex: true,
  },
]
