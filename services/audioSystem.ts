
// عبقرية الصوت: محرك صوتي مدمج بدون ملفات خارجية
// GENIUS AUDIO ENGINE: Pure Web Audio API Synthesizer

let audioContext: AudioContext | null = null;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

export const playSound = (type: 'click' | 'success' | 'error' | 'login' | 'hover' | 'notification') => {
  const ctx = initAudio();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'click':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
      break;

    case 'hover':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(400, now);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.02);
      oscillator.start(now);
      oscillator.stop(now + 0.02);
      break;

    case 'success':
      playNote(ctx, 523.25, now, 0.1, 'sine'); // C5
      playNote(ctx, 659.25, now + 0.1, 0.1, 'sine'); // E5
      playNote(ctx, 783.99, now + 0.2, 0.2, 'sine'); // G5
      break;

    case 'notification':
      // Sophisticated double-ping
      playNote(ctx, 880, now, 0.1, 'sine'); // A5
      playNote(ctx, 1108.73, now + 0.15, 0.2, 'sine'); // C#6
      break;

    case 'error':
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;

    case 'login':
      playNote(ctx, 440, now, 0.1, 'sine');
      playNote(ctx, 554.37, now + 0.1, 0.1, 'sine');
      playNote(ctx, 659.25, now + 0.2, 0.4, 'sine');
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(100, now);
      osc2.frequency.exponentialRampToValueAtTime(800, now + 0.5);
      gain2.gain.setValueAtTime(0.05, now);
      gain2.gain.linearRampToValueAtTime(0, now + 0.5);
      osc2.start(now);
      osc2.stop(now + 0.5);
      break;
  }
};

const playNote = (ctx: AudioContext, freq: number, time: number, duration: number, type: OscillatorType) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    osc.start(time);
    osc.stop(time + duration);
}
