const categories = {
  'ac mentainance': 'AC Maintenance',
  'electrical mentainance': 'Electrical',
  'decor gypsum specialist': 'Gypsum & Decor',
  'joinery and carpenter': 'Joinery & Carpentry',
  'mep infrastructure/external electrical works': 'MEP Infrastructure',
  'plumber p.p.r-pvc- drainach specialist': 'Plumbing & Drainage',
};
export function categoryLabel(value = '') {
  const label = String(value).trim();
  return categories[label.toLowerCase()] || label;
}
