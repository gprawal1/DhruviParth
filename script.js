
(() => {
  "use strict";

  // ==========================================
  // ELEMENTS
  // ==========================================

  const envelopeIntro = document.getElementById("envelopeIntro");
  const openInvitationButton = document.getElementById("openInvitation");

  const languageToggle = document.getElementById("languageToggle");
  const introLanguageToggle = document.getElementById("introLanguageToggle");

  const musicToggle = document.getElementById("musicToggle");
  const musicLabel = document.getElementById("musicLabel");
  const weddingMusic = document.getElementById("weddingMusic");

  const shareButton = document.getElementById("shareButton");
  const toast = document.getElementById("toast");

  const lightbox = document.getElementById("lightbox");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeLightbox = document.getElementById("lightboxClose");

  let language = "en";
  let musicPlaying = false;
  let toastTimer;

  // ==========================================
  // TOAST MESSAGE
  // ==========================================

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // ==========================================
  // WEDDING MUSIC
  // ==========================================

  async function startMusic() {
    if (!weddingMusic) {
      showToast(
        language === "en"
          ? "Music player not found. Check the audio element in your HTML."
          : "म्यूज़िक प्लेयर नहीं मिला। HTML में ऑडियो एलिमेंट चेक करें।"
      );
      return;
    }

    try {
      weddingMusic.volume = 0.5;

      await weddingMusic.play();

      musicPlaying = true;

      if (musicToggle) {
        musicToggle.classList.add("playing");
        musicToggle.setAttribute("aria-pressed", "true");
      }

      if (musicLabel) {
        musicLabel.textContent =
          language === "en" ? "Music on" : "संगीत चालू";
      }

    } catch (error) {
      musicPlaying = false;

      if (musicToggle) {
        musicToggle.classList.remove("playing");
        musicToggle.setAttribute("aria-pressed", "false");
      }

      if (musicLabel) {
        musicLabel.textContent =
          language === "en" ? "Music off" : "संगीत बंद";
      }

      showToast(
        language === "en"
          ? "Music couldn't start. Please tap the music button."
          : "संगीत शुरू नहीं हो सका। कृपया म्यूज़िक बटन दबाएँ।"
      );

      console.error("Music playback error:", error);
    }
  }

  function stopMusic() {
    if (weddingMusic) {
      weddingMusic.pause();
    }

    musicPlaying = false;

    if (musicToggle) {
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
    }

    if (musicLabel) {
      musicLabel.textContent =
        language === "en" ? "Music off" : "संगीत बंद";
    }
  }

  // ==========================================
  // ENVELOPE OPENING
  // ==========================================

  document.body.classList.add("envelope-locked");

  if (envelopeIntro && openInvitationButton) {
    openInvitationButton.addEventListener("click", () => {
      if (openInvitationButton.disabled) return;

      // Start music directly from the user's click.
      startMusic();

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

  // ==========================================
  // MUSIC BUTTON
  // ==========================================

  if (musicToggle) {
    musicToggle.addEventListener("click", async () => {
      if (musicPlaying && weddingMusic && !weddingMusic.paused) {
        stopMusic();
      } else {
        await startMusic();
      }
    });
  }

  // Keep the button state correct if playback ends or is interrupted.
  if (weddingMusic) {
    weddingMusic.addEventListener("pause", () => {
      if (musicPlaying) {
        musicPlaying = false;

        if (musicToggle) {
          musicToggle.classList.remove("playing");
          musicToggle.setAttribute("aria-pressed", "false");
        }

        if (musicLabel) {
          musicLabel.textContent =
            language === "en" ? "Music off" : "संगीत बंद";
        }
      }
    });
  }

  // ==========================================
  // COUNTDOWN
  // ==========================================

  const weddingDate = new Date("2026-11-26T18:00:00+05:30");

  const countdownEls = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  function updateCountdown() {
    const now = Date.now();
    const remaining = Math.max(0, weddingDate.getTime() - now);

    const totalSeconds = Math.floor(remaining / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (countdownEls.days) {
      countdownEls.days.textContent = String(days).padStart(2, "0");
    }

    if (countdownEls.hours) {
      countdownEls.hours.textContent = String(hours).padStart(2, "0");
    }

    if (countdownEls.minutes) {
      countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
    }

    if (countdownEls.seconds) {
      countdownEls.seconds.textContent = String(seconds).padStart(2, "0");
    }

    if (remaining <= 0) {
      const countdownNote = document.querySelector(".countdown-note");

      if (countdownNote) {
        countdownNote.textContent =
          document.body.classList.contains("lang-hi")
            ? "आज का दिन प्यार और खुशियों से भर जाए!"
            : "Today is the day — let the celebrations begin!";
      }
    }
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // ==========================================
  // LANGUAGE SWITCHING
  // ==========================================

  function setLanguage(next) {
    language = next;

    document.documentElement.lang = next;
    document.body.classList.toggle("lang-hi", next === "hi");

    document.querySelectorAll("[data-en][data-hi]").forEach((element) => {
      element.textContent = element.dataset[next];
    });

    const nextLabel = next === "en" ? "हिंदी" : "English";

    if (languageToggle) {
      languageToggle.textContent = nextLabel;
      languageToggle.setAttribute(
        "aria-label",
        next === "en" ? "Switch to Hindi" : "Switch to English"
      );
    }

    if (introLanguageToggle) {
      introLanguageToggle.textContent = nextLabel;
      introLanguageToggle.setAttribute(
        "aria-label",
        next === "en" ? "Switch to Hindi" : "Switch to English"
      );
    }

    if (musicLabel) {
      musicLabel.textContent = musicPlaying
        ? (next === "en" ? "Music on" : "संगीत चालू")
        : (next === "en" ? "Music off" : "संगीत बंद");
    }
  }

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setLanguage(language === "en" ? "hi" : "en");
    });
  }

  if (introLanguageToggle) {
    introLanguageToggle.addEventListener("click", () => {
      setLanguage(language === "en" ? "hi" : "en");
    });
  }

  // ==========================================
  // GALLERY LIGHTBOX
  // ==========================================

  function hideLightbox() {
    if (!lightbox) return;

    lightbox.hidden = true;

    if (lightboxImage) {
      lightboxImage.src = "";
    }
  }

  document.querySelectorAll(".gallery-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const image = tile.querySelector("img");

      if (!image || !lightbox || !lightboxImage) return;

      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;

      if (lightboxCaption) {
        lightboxCaption.textContent =
          tile.dataset.caption || "A favourite memory";
      }

      lightbox.hidden = false;

      if (closeLightbox) {
        closeLightbox.focus();
      }
    });
  });

  if (closeLightbox) {
    closeLightbox.addEventListener("click", hideLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        hideLightbox();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideLightbox();
    }
  });

  // ==========================================
  // SHARE INVITATION
  // ==========================================

  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const shareData = {
        title: "Dhruvi & Parth — Wedding Invitation",
        text: "You're invited to celebrate Dhruvi & Parth on 26 November 2026 at Govinda Resort, Lonavala."
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if (error.name !== "AbortError") {
            showToast(
              "Sharing wasn't available. Copy the website link from your browser."
            );
          }
        }

      } else if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(window.location.href);

          showToast(
            language === "en"
              ? "Invitation link copied!"
              : "निमंत्रण का लिंक कॉपी हो गया!"
          );

        } catch (error) {
          showToast(
            language === "en"
              ? "Copy the website address from your browser to share it."
              : "साझा करने के लिए ब्राउज़र से वेबसाइट का पता कॉपी करें।"
          );
        }

      } else {
        showToast(
          language === "en"
            ? "Copy the website address from your browser to share it."
            : "साझा करने के लिए ब्राउज़र से वेबसाइट का पता कॉपी करें।"
        );
      }
    });
  }

  // ==========================================
  // DECORATIVE PETALS
  // ==========================================

  const petalLayer = document.querySelector(".petal-layer");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion && petalLayer) {
    for (let i = 0; i < 9; i++) {
      const petal = document.createElement("span");

      petal.className = "petal";
      petal.style.left = `${8 + Math.random() * 84}%`;
      petal.style.animationDuration = `${8 + Math.random() * 8}s`;
      petal.style.animationDelay = `${Math.random() * 3}s`;
      petal.style.setProperty(
        "--drift",
        `${Math.round(Math.random() * 110 - 55)}px`
      );
      petal.style.opacity = `${0.25 + Math.random() * 0.35}`;

      petalLayer.appendChild(petal);

      window.setTimeout(() => {
        petal.remove();
      }, 18000);
    }
  }

  // ==========================================
  // FALLING FLOWERS
  // ==========================================

  const flowerShower = document.getElementById("flowerShower");

  if (flowerShower) {
    const petals = ["✿", "❀", "✾", "🌸"];

    for (let i = 0; i < 22; i++) {
      const petal = document.createElement("span");

      petal.className = "falling-petal";
      petal.textContent =
        petals[Math.floor(Math.random() * petals.length)];

      petal.style.left = Math.random() * 100 + "%";
      petal.style.animationDuration = (7 + Math.random() * 9) + "s";
      petal.style.animationDelay = -(Math.random() * 15) + "s";
      petal.style.fontSize = (12 + Math.random() * 15) + "px";

      flowerShower.appendChild(petal);
    }
  }

})();
