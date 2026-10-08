// Created only from a deliberate click. No recordings or network requests.
let context: AudioContext | null = null;
export async function playChime(note: number) {
  context ??= new AudioContext();
  if (context.state === "suspended") await context.resume();
  const start = context.currentTime;
  const frequencies = [392, 440, 523.25];
  for (const [ratio, volume] of [[1, .12], [2.76, .025], [5.4, .008]]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequencies[Math.max(0, Math.min(2, note))] * ratio;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, start + 2.5);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start); oscillator.stop(start + 2.6);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}

let stopAmbience: (() => void) | null = null;
export async function setAmbientSound(enabled: boolean) {
  stopAmbience?.(); stopAmbience = null;
  if (!enabled) return;
  context ??= new AudioContext();
  await context.resume();
  const audio = context;
  const duration = 8;
  const buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < samples.length; i++) {
    previous = (previous + (Math.random() * 2 - 1) * .02) / 1.02;
    samples[i] = previous * 3;
  }
  const wind = audio.createBufferSource(); wind.buffer = buffer; wind.loop = true;
  const filter = audio.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 620;
  const gain = audio.createGain(); gain.gain.value = .055;
  wind.connect(filter).connect(gain).connect(audio.destination); wind.start();
  const visibility = () => gain.gain.setTargetAtTime(document.hidden ? 0 : .055, audio.currentTime, .2);
  document.addEventListener("visibilitychange", visibility);
  const birds = window.setInterval(() => {
    if (document.hidden) return;
    const start = audio.currentTime;
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1850, start);
    oscillator.frequency.exponentialRampToValueAtTime(2650, start + .09);
    oscillator.frequency.exponentialRampToValueAtTime(2100, start + .18);
    envelope.gain.setValueAtTime(0, start); envelope.gain.linearRampToValueAtTime(.012, start + .03);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + .24);
    oscillator.connect(envelope).connect(gain); oscillator.start(start); oscillator.stop(start + .3);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }, 11000);
  stopAmbience = () => {
    window.clearInterval(birds); document.removeEventListener("visibilitychange", visibility);
    wind.stop(); wind.disconnect(); filter.disconnect(); gain.disconnect();
  };
}
