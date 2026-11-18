import useReducedMotionPreference, { setMotionPreference } from '../../hooks/useReducedMotionPreference';

export default function MotionToggle() {
  const reduced = useReducedMotionPreference();
  return (
    <button type="button" className="motion-toggle" aria-pressed={!reduced}
      onClick={() => setMotionPreference(reduced ? 'full' : 'reduced')}
      title="Switch between full and reduced animation">
      Animations: {reduced ? 'Reduced' : 'Full'}
    </button>
  );
}
