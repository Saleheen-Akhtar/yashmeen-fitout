export function closeBubbleAudio(audioCtxRef) {
  const context = audioCtxRef.current;
  audioCtxRef.current = null;
  try { context?.close()?.catch(() => {}); } catch { /* Audio context already closed. */ }
}

export function playBubblePop(audioCtxRef, radius) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const pitch = 580 * Math.sqrt(28 / Math.max(12, radius));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.25, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // AudioContext unavailable
    }
  }
