import { sound } from '../audio.js';

export class EscapingNoGame {
  constructor(containerId, statusElId, onCompleteCallback) {
    this.container = document.getElementById(containerId);
    this.statusEl = document.getElementById(statusElId);
    this.onComplete = onCompleteCallback;

    this.isCompleted = false;

    this.noPhrases = [
      "NO 😠",
      "Can't touch me! 😜",
      "No is not an option! 💖",
      "Try again! 🙈",
      "Nope, only YES! 🥺",
      "Too slow! 🏃‍♂️",
      "Forgive me please! 🌸"
    ];
    this.phraseIndex = 0;

    this.init();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="escaping-game-wrapper">
        <div class="escaping-header-box">
          <span class="escaping-big-emoji">🥺 👉👈</span>
          <h2 class="escaping-title">Chihiro... Did you really forgive me?</h2>
          <p class="escaping-sub">"Please tell me from your heart..."</p>
        </div>

        <!-- Clean Open Area without Yellow Box Container -->
        <div class="escaping-buttons-area clean-buttons-area" id="escapingBounds">
          <button id="yesForgiveBtn" class="gold-next-btn yes-choice-btn">
            YES, I FORGIVE YOU! 💖
          </button>
          
          <!-- Positioned far away initially -->
          <button id="noForgiveBtn" class="no-choice-btn initial-no-pos">
            NO 😠
          </button>
        </div>

        <div id="escapingStatusMsg" class="escaping-hint-msg">
          Click YES to unlock Eishal's Final Birthday Treasury! 🎁
        </div>
      </div>
    `;

    this.yesBtn = document.getElementById('yesForgiveBtn');
    this.noBtn = document.getElementById('noForgiveBtn');
    this.bounds = document.getElementById('escapingBounds');
    this.hintMsg = document.getElementById('escapingStatusMsg');

    this.setupInteractions();
  }

  setupInteractions() {
    if (!this.noBtn || !this.bounds) return;

    const escapeNoBtn = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      sound.playTone(500 + Math.random() * 200, 'sine', 0.05, 0.08);

      const boundsRect = this.bounds.getBoundingClientRect();
      const yesRect = this.yesBtn ? this.yesBtn.getBoundingClientRect() : null;

      const btnWidth = this.noBtn.offsetWidth || 100;
      const btnHeight = this.noBtn.offsetHeight || 40;

      const maxX = boundsRect.width - btnWidth - 20;
      const maxY = boundsRect.height - btnHeight - 20;

      let randomX, randomY, attempts = 0;

      // Keep generating until position is far from YES button
      do {
        randomX = Math.max(10, Math.floor(Math.random() * maxX));
        randomY = Math.max(10, Math.floor(Math.random() * maxY));
        attempts++;
      } while (attempts < 15 && yesRect && this.isNearYes(randomX, randomY, boundsRect, yesRect, btnWidth, btnHeight));

      this.noBtn.classList.remove('initial-no-pos');
      this.noBtn.style.position = 'absolute';
      this.noBtn.style.left = `${randomX}px`;
      this.noBtn.style.top = `${randomY}px`;

      // Cycle phrases
      this.phraseIndex = (this.phraseIndex + 1) % this.noPhrases.length;
      this.noBtn.innerText = this.noPhrases[this.phraseIndex];

      if (this.hintMsg) {
        this.hintMsg.innerHTML = `😜 <strong>Oops! The 'NO' button ran away! You can only click YES!</strong> 💖`;
      }
    };

    // Escape on hover, mouseover, or touchstart
    this.noBtn.addEventListener('mouseover', escapeNoBtn);
    this.noBtn.addEventListener('mouseenter', escapeNoBtn);
    this.noBtn.addEventListener('touchstart', escapeNoBtn, { passive: false });
    this.noBtn.addEventListener('click', escapeNoBtn);

    // YES Button clicked!
    if (this.yesBtn) {
      this.yesBtn.addEventListener('click', () => {
        if (this.isCompleted) return;
        this.isCompleted = true;
        this.triggerYesCelebration();
      });
    }
  }

  isNearYes(rx, ry, boundsRect, yesRect, w, h) {
    const absX = boundsRect.left + rx;
    const absY = boundsRect.top + ry;
    const padding = 30;

    return !(
      absX + w + padding < yesRect.left ||
      absX > yesRect.right + padding ||
      absY + h + padding < yesRect.top ||
      absY > yesRect.bottom + padding
    );
  }

  triggerYesCelebration() {
    sound.playFanfare();

    if (this.hintMsg) {
      this.hintMsg.innerHTML = `🎉 <strong>YAY! YOU FORGAVE ME! THANK YOU CHIHIRO!</strong> 💖✨`;
    }

    if (typeof this.onComplete === 'function') {
      this.onComplete();
    }
  }
}
