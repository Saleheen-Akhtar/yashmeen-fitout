import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_WEBSITE_CONTENT, mergeWebsiteContent, validateContentPatch, flattenContentPatch, publicWebsiteContent } from '../../../shared/siteContent.js';
import { getBusinessJsonLd, getRouteSeo } from '../src/lib/seoConfig.js';
import { getDubaiAtelierStatus } from '../src/lib/helpers.js';

test('content patches preserve siblings, removals and old service records', () => {
  const content = mergeWebsiteContent({ address: { city: 'Abu Dhabi' }, services: [{ slug: 'architecture', title: 'Saved architecture' }], testimonials: [], socialLinks: [] });
  assert.equal(content.address.street, DEFAULT_WEBSITE_CONTENT.address.street);
  assert.equal(content.services[0].title, 'Saved architecture');
  assert.equal(content.services[0].stats[0].value, DEFAULT_WEBSITE_CONTENT.services[0].stats[0].value);
  assert.deepEqual(content.testimonials, []);
  assert.deepEqual(content.socialLinks, []);
  assert.deepEqual(flattenContentPatch({ hero: { title: 'Saved' }, openingHours: [] }), { 'hero.title': 'Saved', openingHours: [] });
  const publicContent = publicWebsiteContent({...content, crmTasks:[{title:'Private task'}], calendarEvents:[{title:'Private appointment'}], legacySecret:'Private field'});
  assert.equal(publicContent.crmTasks, undefined); assert.equal(publicContent.calendarEvents, undefined); assert.equal(publicContent.legacySecret, undefined);
});
test('content validation rejects operators, bad types, unsafe URLs and malformed hours', () => {
  for (const patch of [{ $set: {} }, { socialLinks: [null] }, { mobile: 42 }, { hero: { title: { $ne: '' } } }, { testimonials: [{ href: 'javascript:alert(1)' }] }, { openingHours: [{ days: ['Funday'], opens: '99:30', closes: '18:00' }] }]) assert.ok(validateContentPatch(patch));
  assert.equal(validateContentPatch(DEFAULT_WEBSITE_CONTENT), null);
  assert.equal(validateContentPatch({ testimonials: [], openingHours: [{days:['Saturday'],opens:'09:00',closes:'13:00'}] }), null);
});
test('saved identity and hours agree between displayed status and search metadata', () => {
  const content = mergeWebsiteContent({ legalName: 'Fixture Studio', mobile: '+971 50 000 0000', address: { city: 'Abu Dhabi' }, socialLinks: [], openingHours: [{ days: ['Saturday'], opens: '09:00', closes: '13:00' }], seo: {home: {title:'Fixture home'}} });
  const schema = getBusinessJsonLd(content);
  assert.equal(schema.name, 'Fixture Studio'); assert.equal(schema.telephone, content.mobile);
  assert.equal(schema.address.addressLocality, 'Abu Dhabi'); assert.deepEqual(schema.sameAs, []);
  assert.deepEqual(schema.openingHoursSpecification[0].dayOfWeek, ['Saturday']);
  assert.equal(getDubaiAtelierStatus(new Date('2026-11-14T06:00:00Z'), content.openingHours).isOpen, true);
  assert.equal(getDubaiAtelierStatus(new Date('2026-11-16T06:00:00Z'), content.openingHours).isOpen, false);
  assert.equal(getRouteSeo('/', content).title, 'Fixture home');
  assert.equal(getRouteSeo('/login', content).robots, 'noindex, nofollow');
  assert.equal(getRouteSeo('/services/architecture', {...content, services:[]}).robots, 'noindex, follow');
});
test('public SSR renders saved copy, service proof, FAQs and testimonials', async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
    const { SpatialGallery3D } = await vite.ssrLoadModule('/src/components/ui/spatial-gallery-3d.tsx');
    const items = [1,2].map(index => ({id:`photo-${index}`,title:`Photo ${index}`,category:'Fixture',src:'/static/studio.jpg',fallbackSrc:'/static/studio.jpg',index:index-1}));
    const gallery = renderToStaticMarkup(createElement(SpatialGallery3D, {items,filters:[],activeFilter:'all',onFilterChange:()=>{},onSelectItem:()=>{}}));
    assert.ok(gallery.includes('Open Photo 1'));
    assert.ok(gallery.includes('Open Photo 2'));
    const content = mergeWebsiteContent({ footer: {atelierCopy:'Saved atelier copy'}, certifications:['Saved certification'], pageCopy:{About:{interiors_built_around_how_you:'Saved about headline'}}, testimonials:[{quote:'Saved client quote',attribution:'Fixture client',location:'Fixture residence',href:'/projects',linkLabel:'Fixture commission'}], faqGroups:[{category:'Fixture',items:[{q:'Saved question?',a:'Saved answer.'}]}] });
    content.services[0].stats=[{value:'42',label:'Saved service metric'}];
    content.services[0].projects=[{title:'Fixture project',tag:'Fixture',img:'/static/studio.jpg',href:'/project/details/fixture'}];
    content.whatsapp = '+971 50 123 4567'; content.hero.proofMetric = ''; content.studio.paragraph2 = '';
    for (const [route, expected] of [['/about','Saved about headline'],['/','Saved client quote'],['/faq','Saved question?'],['/services/architecture','Saved service metric']]) {
      const html = await render(route, {webDetails:content,projects:[],posts:[]});
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
      assert.ok(main?.includes(expected), `${route} must contain completed copy inside main`);
      assert.ok(!main.includes('Loading content')); assert.ok(!html.includes('id="S:'));
      assert.ok(html.includes('Saved certification')); assert.ok(html.includes('Saved atelier copy'));
      if(route==='/services/architecture') assert.ok(html.includes('/project/details/fixture'));
      assert.ok(html.includes('https://wa.me/971501234567'));
      if(route==='/') { assert.ok(!html.includes('<strong>35,000 sq. ft.</strong>')); assert.ok(!html.includes(DEFAULT_WEBSITE_CONTENT.studio.paragraph2)); }
    }
  } finally { await vite.close(); }
});
test('deployment manifests agree on clean file URLs and exclude assets from SPA fallback', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const service = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')).services.frontend;
  const standalone = JSON.parse(fs.readFileSync(path.join(root,'apps/web/vercel.json'),'utf8'));
  assert.equal(service.cleanUrls, true); assert.equal(service.trailingSlash, false);
  assert.deepEqual(service.rewrites, standalone.rewrites);
  const fallback = new RegExp(`^${service.rewrites[0].source}$`);
  for (const url of ['/fonts/missing.woff2','/robots.txt','/sitemap.xml','/assets/missing.js','/images/missing.jpg','/api/test','/uploads/missing.jpg']) assert.equal(fallback.test(url), false, url);
  for (const url of ['/dashboard','/project/details/fixture','/services/custom']) assert.equal(fallback.test(url), true, url);
});
