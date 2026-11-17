import { useState, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import useDialogFocus from '../../../hooks/useDialogFocus';
import { DEFAULT_WEBSITE_CONTENT, validateContentPatch } from '../../../../../../shared/siteContent.js';
import ContentFields from './ContentFields';
import { contentLabel } from './contentLabels';
import './content-fields.css';

const GROUPS = [
  ['Business & contact', ['brandName','legalName','cityLabel','email','mobile','whatsapp','address','workingHours','openingHours','socialLinks']],
  ['Hero', ['hero']], ['Studio', ['studio']], ['Footer & certifications', ['footer','certifications']],
  ['Client stories', ['testimonials']], ['FAQs', ['faqGroups']], ['Delivery process', ['process','processSteps']],
  ['Services', ['services']], ['Page copy & images', ['pageCopy']], ['Search metadata', ['seo']],
];
export default function SiteSettingsModal({ siteModalOpen, setSiteModalOpen, saveWebDetailsPatch, siteForm, setSiteForm, savingCms }) {
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const close = () => { if (!savingCms) setSiteModalOpen(false); };
  const dialogRef = useRef(null);
  useDialogFocus(siteModalOpen, dialogRef);
  if (!siteModalOpen) return null;
  return <div className="adm-overlay" onClick={close}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="site-settings-title" onClick={event => event.stopPropagation()} className="crex-card crex-modal-box cms-settings">
      <div className="cms-settings-header"><div><h3 id="site-settings-title">Website content</h3><p>Saved changes update the public website. Existing details stay until you edit them.</p></div>
        <button type="button" className="crex-icon-circle" onClick={close} disabled={savingCms} aria-label="Close website settings"><FiX /></button>
      </div>
      <label className="cms-fields-field">Find a section<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <form onSubmit={async event => {
        event.preventDefault(); setError('');
        const patch = Object.fromEntries(Object.keys(DEFAULT_WEBSITE_CONTENT).filter(key => !['crmTasks','calendarEvents'].includes(key)).map(key => [key, siteForm[key] ?? DEFAULT_WEBSITE_CONTENT[key]]));
        const problem = validateContentPatch(patch);
        if (problem) { setError(problem); return; }
        if (await saveWebDetailsPatch(patch, 'Website content published.')) close();
        else setError('Changes could not be saved. Your draft is still here.');
      }}>
        <p className="cms-settings-note">Hours label controls the displayed text. Opening hours use weekday names and 24-hour HH:MM times for the live status and search metadata.</p>
        {GROUPS.filter(([title]) => title.toLowerCase().includes(query.toLowerCase())).map(([title, keys]) => <details key={title} open={query ? true : undefined} className="cms-settings-section"><summary>{title}</summary>
          {keys.filter(key => DEFAULT_WEBSITE_CONTENT[key] !== undefined).map(key => <ContentFields key={key} label={contentLabel(key)} template={DEFAULT_WEBSITE_CONTENT[key]} value={siteForm[key]} onChange={value => setSiteForm(previous => ({...previous,[key]:value}))} />)}
        </details>)}
        {error && <p role="alert" className="cms-settings-error">{error}</p>}
        <div className="cms-settings-submit"><button type="submit" disabled={savingCms} className="crex-btn-dark">{savingCms ? 'Publishing...' : 'Publish website changes'}</button><button type="button" className="crex-btn-ghost" disabled={savingCms} onClick={close}>Close</button></div>
      </form>
    </div>
  </div>;
}
