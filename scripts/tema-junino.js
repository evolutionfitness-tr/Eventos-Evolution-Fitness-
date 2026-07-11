/**
 * tema-junino.js
 * Toca um trecho curto (~18s) de uma faixa real de festa junina, com fade
 * suave no final. O arquivo de áudio fica em assets/audio/tema-junino.mp3
 * — deve ser uma música com licença livre para uso (ex.: Pixabay Music,
 * licença "Content Pixabay", sem necessidade de atribuição).
 */

const DURACAO_MS = 18000;
const FADE_MS = 1500;
const VOLUME_BASE = 0.6;

export const TemaJunino = (() => {
  let audioEl = null;
  let mudo = false;
  let temporizador = null;
  let intervaloFade = null;

  function garantir() {
    if (audioEl) return audioEl;
    audioEl = new Audio('assets/audio/tema-junino.mp3');
    audioEl.preload = 'auto';
    audioEl.volume = VOLUME_BASE;
    return audioEl;
  }

  function tocar() {
    if (mudo) return;
    const audio = garantir();
    clearTimeout(temporizador);
    clearInterval(intervaloFade);

    audio.currentTime = 0;
    audio.volume = VOLUME_BASE;
    audio.play().catch(() => {
      /* Silenciosamente ignora se o navegador bloquear (sem gesto do usuário). */
    });

    temporizador = setTimeout(() => {
      const passos = 15;
      let i = 0;
      intervaloFade = setInterval(() => {
        i += 1;
        audio.volume = Math.max(0, VOLUME_BASE * (1 - i / passos));
        if (i >= passos) {
          clearInterval(intervaloFade);
          audio.pause();
        }
      }, FADE_MS / passos);
    }, DURACAO_MS - FADE_MS);
  }

  return {
    tocar,
    alternarMudo() {
      mudo = !mudo;
      if (mudo && audioEl) audioEl.pause();
      return mudo;
    },
    estaMudo: () => mudo,
  };
})();
