(() => {
  "use strict";

  
  // Envelope opening: tap the D ♥ P wax seal to reveal the invitation.
  document.body.classList.add("envelope-locked");

  const envelopeIntro = document.getElementById("envelopeIntro");
  const openInvitationButton = document.getElementById("openInvitation");

  if (envelopeIntro && openInvitationButton) {
    openInvitationButton.addEventListener("click", () => {
      if (openInvitationButton.disabled) return;
      envelopeIntro.classList.add("opening");
      openInvitationButton.disabled = true;

      window.setTimeout(() => {
        envelopeIntro.classList.add("dismissed");
        document.body.classList.remove("envelope-locked");

        window.setTimeout(() => {
          envelopeIntro.remove();
        }, 850);
      }, 1750);
    });
  }

  const weddingDate = new Date("2026-11-26T18:00:00+05:30");
  const countdownEls = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  function updateCountdown() {
    const now = Date.now();
    let remaining = Math.max(0, weddingDate.getTime() - now);
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    countdownEls.days.textContent = String(days).padStart(2, "0");
    countdownEls.hours.textContent = String(hours).padStart(2, "0");
    countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
    countdownEls.seconds.textContent = String(seconds).padStart(2, "0");
    if (remaining <= 0) {
      document.querySelector(".countdown-note").textContent =
        document.body.classList.contains("lang-hi")
          ? "आज का दिन प्यार और खुशियों से भर जाए!"
          : "Today is the day — let the celebrations begin!";
    }
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const languageToggle = document.getElementById("languageToggle");
  const introLanguageToggle = document.getElementById("introLanguageToggle");
  const musicToggle = document.getElementById("musicToggle");
  const musicLabel = document.getElementById("musicLabel");
  let language = "en";

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    document.body.classList.toggle("lang-hi", next === "hi");

    document.querySelectorAll("[data-en][data-hi]").forEach((el) => {
      el.textContent = el.dataset[next];
    });

    const nextLabel = next === "en" ? "हिंदी" : "English";
    if (languageToggle) {
      languageToggle.textContent = nextLabel;
      languageToggle.setAttribute("aria-label", next === "en" ? "Switch to Hindi" : "Switch to English");
    }
    if (introLanguageToggle) {
      introLanguageToggle.textContent = nextLabel;
      introLanguageToggle.setAttribute("aria-label", next === "en" ? "Switch to Hindi" : "Switch to English");
    }
    if (musicLabel) {
      const playing = musicToggle && musicToggle.classList.contains("playing");
      musicLabel.textContent = playing
        ? (next === "en" ? "Music on" : "संगीत चालू")
        : (next === "en" ? "Music off" : "संगीत बंद");
    }
  }

  if (languageToggle) {
    languageToggle.addEventListener("click", () => setLanguage(language === "en" ? "hi" : "en"));
  }
  if (introLanguageToggle) {
    introLanguageToggle.addEventListener("click", () => setLanguage(language === "en" ? "hi" : "en"));
  }

  // Optional gentle ambient music made with the browser's Web Audio API.
  // It uses no external recording or copyrighted audio file.
  let audioContext = null;
  let masterGain = null;
  let musicNodes = [];
  let musicPlaying = false;
  let musicTimer = null;
  let noteIndex = 0;
  const notes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];

  function playNote(frequency, startAt, duration) {
    if (!audioContext || !masterGain) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.045, startAt + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
    musicNodes.push(osc);
    osc.onended = () => { musicNodes = musicNodes.filter(node => node !== osc); };
  }

  async function startMusic() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      showToast(language === "en" ? "This browser does not support music playback." : "इस ब्राउज़र में संगीत चलाना उपलब्ध नहीं है।");
      return;
    }
    if (!audioContext) {
      audioContext = new AudioCtx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(audioContext.destination);
    }
    await audioContext.resume();
    musicPlaying = true;
    musicToggle.classList.add("playing");
    musicToggle.setAttribute("aria-pressed", "true");
    if (musicLabel) musicLabel.textContent = language === "en" ? "Music on" : "संगीत चालू";
    const playLoop = () => {
      if (!musicPlaying || !audioContext) return;
      const now = audioContext.currentTime;
      const frequency = notes[noteIndex % notes.length];
      playNote(frequency, now, 1.7);
      if (noteIndex % 4 === 0) playNote(frequency / 2, now, 2.2);
      noteIndex++;
    };
    playLoop();
    musicTimer = window.setInterval(playLoop, 1500);
  }

  function stopMusic() {
    musicPlaying = false;
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
    musicNodes.forEach(node => { try { node.stop(); } catch (_) {} });
    musicNodes = [];
    if (audioContext && audioContext.state === "running") audioContext.suspend();
    musicToggle.classList.remove("playing");
    musicToggle.setAttribute("aria-pressed", "false");
    if (musicLabel) musicLabel.textContent = language === "en" ? "Music off" : "संगीत बंद";
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", async () => {
      if (musicPlaying) stopMusic();
      else await startMusic();
    });
  }

const lightbox = document.getElementById("lightbox");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    const image = tile.querySelector("img");

    if (!image) return;

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = tile.dataset.caption || "A favourite memory";

    lightbox.hidden = false;
    closeLightbox.focus();
  });
});

closeLightbox.addEventListener("click", () => {
  lightbox.hidden = true;
  lightboxImage.src = "";
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.hidden = true;
    lightboxImage.src = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    lightbox.hidden = true;
    lightboxImage.src = "";
  }
});

  function hideLightbox() { lightbox.hidden = true; }
  closeLightbox.addEventListener("click", hideLightbox);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) hideLightbox(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") hideLightbox(); });

  const shareButton = document.getElementById("shareButton");
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
  }
  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: "Dhruvi & Parth — Wedding Invitation",
      text: "You're invited to celebrate Dhruvi & Parth on 26 November 2026 at Govinda Resort, Lonavala."
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (error) { if (error.name !== "AbortError") showToast("Sharing wasn't available. Copy the website link from your browser."); }
    } else if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast(language === "en" ? "Invitation link copied!" : "निमंत्रण का लिंक कॉपी हो गया!");
      } catch (_) {
        showToast(language === "en" ? "Copy the website address from your browser to share it." : "साझा करने के लिए ब्राउज़र से वेबसाइट का पता कॉपी करें।");
      }
    } else {
      showToast(language === "en" ? "Copy the website address from your browser to share it." : "साझा करने के लिए ब्राउज़र से वेबसाइट का पता कॉपी करें।");
    }
  });

  // A few decorative petals appear on load; no continuous heavy animation.
  const petalLayer = document.querySelector(".petal-layer");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && petalLayer) {
    for (let i = 0; i < 9; i++) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${8 + Math.random() * 84}%`;
      petal.style.animationDuration = `${8 + Math.random() * 8}s`;
      petal.style.animationDelay = `${Math.random() * 3}s`;
      petal.style.setProperty("--drift", `${Math.round(Math.random() * 110 - 55)}px`);
      petal.style.opacity = `${0.25 + Math.random() * 0.35}`;
      petalLayer.appendChild(petal);
      window.setTimeout(() => petal.remove(), 18000);
    }
  }
})();

const flowerShower = document.getElementById("flowerShower");

if (flowerShower) {
  const petals = ["✿", "❀", "✾", "🌸"];

  for (let i = 0; i < 22; i++) {
    const petal = document.createElement("span");

    petal.className = "falling-petal";
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];

    petal.style.left = Math.random() * 100 + "%";
    petal.style.animationDuration = (7 + Math.random() * 9) + "s";
    petal.style.animationDelay = -(Math.random() * 15) + "s";
    petal.style.fontSize = (12 + Math.random() * 15) + "px";

    flowerShower.appendChild(petal);
  }
}