import { useId } from 'react';
import { contentLabel } from './contentLabels';

const blank = value => Array.isArray(value) ? [] : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, blank(entry)]))
  : typeof value === 'boolean' ? true : typeof value === 'number' ? 0 : '';

export default function ContentFields({ value, template, onChange, label }) {
  const id = useId();
  if (Array.isArray(template)) {
    const entries = Array.isArray(value) ? value : template;
    return <fieldset className="cms-fields-list"><legend>{label}</legend>
      {entries.map((entry, index) => <div key={index} className="cms-fields-item">
        <ContentFields label={`${label} ${index + 1}`} value={entry} template={template[0]} onChange={next => onChange(entries.map((item, i) => i === index ? next : item))} />
        <div className="cms-fields-actions">
          <button type="button" className="crex-btn-ghost" aria-label={`Move ${label} ${index + 1} up`} disabled={index === 0} onClick={() => { const next = [...entries]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>Move up</button>
          <button type="button" className="crex-btn-ghost" aria-label={`Remove ${label} ${index + 1}`} onClick={() => onChange(entries.filter((_, i) => i !== index))}>Remove</button>
        </div>
      </div>)}
      <button type="button" className="crex-btn-ghost" onClick={() => onChange([...entries, blank(template[0])])}>Add {label}</button>
    </fieldset>;
  }
  if (template && typeof template === 'object') return <div className="cms-fields-object">{Object.entries(template).map(([key, entry]) => <ContentFields key={key} label={contentLabel(key)} value={value?.[key] ?? entry} template={entry} onChange={next => onChange({ ...value, [key]: next })} />)}</div>;
  return <div className="cms-fields-field"><label htmlFor={id}>{label}</label>
    {typeof template === 'boolean'
      ? <input id={id} type="checkbox" checked={value ?? template} onChange={event => onChange(event.target.checked)} />
      : <textarea id={id} rows={String(value ?? template).length > 110 ? 3 : 1} value={value ?? template} onChange={event => onChange(typeof template === 'number' ? Number(event.target.value) : event.target.value)} />}
  </div>;
}
