import { sound } from '../audio.js';

export class ForgivenessMeterGame {
  constructor(containerId, statusElId, onCompleteCallback) {
    this.container = document.getElementById(containerId);
    this.statusEl = document.getElementById(statusElId);
    this.onComplete = onCompleteCallback;

    this.currentPercent = 0;
    this.isDragging = false;
    this.isCompleted = false;

    this.init();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="apology-card-wrapper">
        <!-- Apology Note Card -->
        <div class="apology-message-box">
          <div class="apology-heart-icon">💖</div>
          <h3 class="apology-header">Chihiro... A Heartfelt Apology 💌</h3>
          <p class="apology-text">
            "Chihiro, I know I hurt you many times, and I am so, so sorry. Last time we had that big fight, months passed without us talking even for a bit, and I still feel so sad about it. It was entirely my mistake for breaking the promise I made to you. I'm truly sorry from the bottom of my heart, and I hope with all my heart that you can forgive me... Will you forgive me, right?"
          </p>
        </div>

        <div class="scale-question-title">
          On a scale of <span class="mad-text">"I don't forgive you at all 🤬"</span> to <span class="happy-text">"I forgive you sooo much! 💖"</span>...
        </div>

        <!-- Big Vertical Scale Meter -->
        <div class="big-meter-container">
          <div class="meter-top-label">
            <span>I FORGIVE YOU SOOO MUCH! 💖</span>
            <span id="percentDisplay" class="percent-display">0%</span>
          </div>

          <div class="meter-layout-row">
            <div class="big-slider-wrapper" id="meterTrack">
              <div class="big-track">
                <div class="big-fill" id="meterFill" style="height: 0%;"></div>
                <div class="big-handle" id="meterHandle" style="bottom: 0%;">
                  <span id="handleEmoji" class="handle-emoji">🥺</span>
                </div>
              </div>
            </div>

            <!-- Ticks Scale 0% to 100% (10% gaps) -->
            <div class="meter-ticks-scale">
              <div class="meter-tick-item" style="bottom: 100%;"><div class="tick-line"></div><span class="tick-number">100%</span></div>
              <div class="meter-tick-item" style="bottom: 90%;"><div class="tick-line"></div><span class="tick-number">90%</span></div>
              <div class="meter-tick-item" style="bottom: 80%;"><div class="tick-line"></div><span class="tick-number">80%</span></div>
              <div class="meter-tick-item" style="bottom: 70%;"><div class="tick-line"></div><span class="tick-number">70%</span></div>
              <div class="meter-tick-item" style="bottom: 60%;"><div class="tick-line"></div><span class="tick-number">60%</span></div>
              <div class="meter-tick-item" style="bottom: 50%;"><div class="tick-line"></div><span class="tick-number">50%</span></div>
              <div class="meter-tick-item" style="bottom: 40%;"><div class="tick-line"></div><span class="tick-number">40%</span></div>
              <div class="meter-tick-item" style="bottom: 30%;"><div class="tick-line"></div><span class="tick-number">30%</span></div>
              <div class="meter-tick-item" style="bottom: 20%;"><div class="tick-line"></div><span class="tick-number">20%</span></div>
              <div class="meter-tick-item" style="bottom: 10%;"><div class="tick-line"></div><span class="tick-number">10%</span></div>
              <div class="meter-tick-item" style="bottom: 0%;"><div class="tick-line"></div><span class="tick-number">0%</span></div>
            </div>
          </div>

          <div class="meter-bottom-label">
            <span>I DON'T FORGIVE YOU AT ALL 🤬</span>
          </div>
        </div>
      </div>
    `;

    this.percentDisplay = document.getElementById('percentDisplay');
    this.meterFill = document.getElementById('meterFill');
    this.meterHandle = document.getElementById('meterHandle');
    this.meterTrack = document.getElementById('meterTrack');
    this.handleEmoji = document.getElementById('handleEmoji');

    this.setupEvents();
  }

  setupEvents() {
    if (!this.meterTrack) return;

    const startDrag = (e) => {
      this.isDragging = true;
      this.updateValueFromEvent(e);
    };

    const doDrag = (e) => {
      if (this.isDragging) {
        this.updateValueFromEvent(e);
      }
    };

    const stopDrag = () => {
      if (this.isDragging) {
        this.isDragging = false;

        // Auto boost to 100% when dragged!
        if (this.currentPercent > 5 && this.currentPercent < 100) {
          this.animateTo100();
        }
      }
    };

    this.meterTrack.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    this.meterTrack.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
  }

  updateValueFromEvent(e) {
    if (e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }

    const rect = this.meterTrack.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let offsetY = rect.bottom - clientY;
    let pct = Math.round((offsetY / rect.height) * 100);
    pct = Math.max(0, Math.min(100, pct));

    this.setPercentage(pct);
  }

  setPercentage(pct) {
    this.currentPercent = pct;

    if (this.meterFill) this.meterFill.style.height = `${pct}%`;
    if (this.meterHandle) this.meterHandle.style.bottom = `${pct}%`;
    if (this.percentDisplay) this.percentDisplay.innerText = `${pct}%`;

    // Emoji reaction
    if (this.handleEmoji) {
      if (pct === 100) this.handleEmoji.innerText = "💖";
      else if (pct > 75) this.handleEmoji.innerText = "🥰";
      else if (pct > 40) this.handleEmoji.innerText = "🥺";
      else if (pct > 15) this.handleEmoji.innerText = "👉👈";
      else this.handleEmoji.innerText = "🥺";
    }

    // Spawn floating pleading/happy emojis spread across the screen
    if (Math.random() < 0.35) {
      this.spawnFloatingEmoji();
    }

    // Audio cue
    sound.playTone(300 + pct * 4, 'sine', 0.03, 0.05);

    if (pct >= 100 && !this.isCompleted) {
      this.isCompleted = true;
      this.triggerCompletion();
    }
  }

  spawnFloatingEmoji() {
    const emojis = ["🥺", "💖", "🥰", "✨", "🌸", "💗", "👉👈", "🥺"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const el = document.createElement('div');
    el.className = 'floating-pleading-emoji';
    el.innerText = emoji;
    
    const stageCard = document.getElementById('stage3');
    const bounds = stageCard ? stageCard.getBoundingClientRect() : document.body.getBoundingClientRect();
    
    // Spread randomly across the left/right areas of the card (avoiding tight stack over slider)
    const padding = 40;
    const randomX = bounds.left + padding + Math.random() * (bounds.width - padding * 2);
    const randomY = bounds.top + 60 + Math.random() * (bounds.height * 0.65);
    
    const randomSize = 20 + Math.floor(Math.random() * 18); // 20px - 38px
    const randomRotate = -25 + Math.floor(Math.random() * 50); // -25deg to +25deg

    el.style.left = `${randomX}px`;
    el.style.top = `${randomY}px`;
    el.style.fontSize = `${randomSize}px`;
    el.style.transform = `rotate(${randomRotate}deg)`;
    
    document.body.appendChild(el);
    
    setTimeout(() => { el.remove(); }, 1400);
  }

  animateTo100() {
    let target = 100;
    let step = () => {
      if (this.currentPercent < target) {
        this.setPercentage(Math.min(target, this.currentPercent + 4));
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  triggerCompletion() {
    sound.playFanfare();

    if (this.statusEl) {
      this.statusEl.innerHTML = `🎉 <strong>FORGIVENESS METER AT 100%! Thank you for your warm forgiveness, Chihiro!</strong> 💖✨`;
    }

    if (typeof this.onComplete === 'function') {
      this.onComplete();
    }
  }
}
