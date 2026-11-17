const LABELS = {
  brandName: 'Header brand name', legalName: 'Full business name', cityLabel: 'Header city label',
  mobile: 'Phone number', whatsapp: 'WhatsApp number', email: 'Email address',
  workingHours: 'Displayed hours', openingHours: 'Opening schedule', socialLinks: 'Social links',
  pageCopy: 'Page content', seo: 'Search metadata', q: 'Question', a: 'Answer',
  href: 'Project link', url: 'URL', img: 'Image URL', num: 'Step number', desc: 'Description',
};
export function contentLabel(key) {
  return LABELS[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
}
