import { sound } from '../audio.js';
import { BIRTHDAY_CONFIG } from '../config.js';

export class ScratchCardGame {
  constructor(containerId, statusElId, onCompleteCallback) {
    this.container = document.getElementById(containerId);
    this.statusEl = document.getElementById(statusElId);
    this.onComplete = onCompleteCallback;

    this.scratchedCount = 0;
    this.totalCards = 8;

    // 8 Photo Scratch Cards config (Updated with all 8 new images)
    this.photoCards = [
      {
        id: 1,
        title: 'Memory Photo #1',
        image: './assets/photo_1_2026-08-20_16-49-58.jpg',
        caption: 'Special Memory Photo #1 💖'
      },
      {
        id: 2,
        title: 'Memory Photo #2',
        image: './assets/photo_2_2026-08-20_16-49-58.jpg',
        caption: 'Special Memory Photo #2 💖'
      },
      {
        id: 3,
        title: 'Memory Photo #3',
        image: './assets/photo_3_2026-08-20_16-49-58.jpg',
        caption: 'Special Memory Photo #3 💖'
      },
      {
        id: 4,
        title: 'Memory Photo #4',
        image: './assets/photo_4_2026-08-20_16-49-58.jpg',
        caption: 'Special Memory Photo #4 💖'
      },
      {
        id: 5,
        title: 'Memory Photo #5',
        image: './assets/photo_5_2026-08-20_16-49-58.jpg',
        caption: 'Special Memory Photo #5 💖'
      },
      {
        id: 6,
        title: 'Memory Photo #6',
        image: './assets/20260118033737.png',
        caption: 'Special Memory Photo #6 💖'
      },
      {
        id: 7,
        title: 'Memory Photo #7',
        image: './assets/Screenshot 2025-08-18 020452.png',
        caption: 'Special Memory Photo #7 💖'
      },
      {
        id: 8,
        title: 'Memory Photo #8',
        image: './assets/Screenshot 2026-01-28 022431.png',
        caption: 'Special Memory Photo #8 💖'
      }
    ];

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.scratchedCount = 0;

    if (this.statusEl) {
      this.statusEl.innerHTML = `Scratch off all 8 cards to reveal Eishal's memory photos! (0 / 8 Solved)`;
    }

    this.photoCards.forEach((cardData, idx) => {
      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'scratch-card-item photo-scratch-item';

      // Revealed Photo Container
      const contentEl = document.createElement('div');
      contentEl.className = 'scratch-photo-content';
      contentEl.innerHTML = `
        <img src="${cardData.image}" alt="${cardData.title}" class="scratch-revealed-img">
        <div class="scratch-photo-badge">Photo #${cardData.id}</div>
      `;

      // Scratch Cover Canvas
      const canvas = document.createElement('canvas');
      canvas.className = 'scratch-canvas';
      canvas.width = 220;
      canvas.height = 145;

      cardWrapper.appendChild(contentEl);
      cardWrapper.appendChild(canvas);
      this.container.appendChild(cardWrapper);

      this.setupScratchCanvas(canvas, idx, cardData);
    });

    this.createPhotoModal();
  }

  createPhotoModal() {
    let modal = document.getElementById('scratchPhotoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scratchPhotoModal';
      modal.className = 'scratch-modal-overlay hidden';
      modal.innerHTML = `
        <div class="scratch-modal-box">
          <button class="modal-close-btn" id="closeScratchModalBtn">✕</button>
          <div class="modal-badge-title" id="scratchModalTitle">📸 Photo Revealed!</div>
          <div class="modal-img-frame">
            <img src="" id="scratchModalImg" alt="Revealed Photo Preview">
          </div>
          <p class="modal-img-caption" id="scratchModalCaption"></p>
          <p class="modal-tap-hint">Tap anywhere to return to grid</p>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      const closeBtn = document.getElementById('closeScratchModalBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          modal.classList.add('hidden');
        });
      }
    }
  }

  showBigPhotoModal(cardData) {
    const modal = document.getElementById('scratchPhotoModal');
    const modalImg = document.getElementById('scratchModalImg');
    const modalTitle = document.getElementById('scratchModalTitle');
    const modalCaption = document.getElementById('scratchModalCaption');

    if (modal && modalImg) {
      modalImg.src = cardData.image;
      if (modalTitle) modalTitle.innerText = `📸 ${cardData.title} Revealed! ✨`;
      if (modalCaption) modalCaption.innerText = cardData.caption;

      sound.playFanfare();
      modal.classList.remove('hidden');
    }
  }

  setupScratchCanvas(canvas, index, cardData) {
    const ctx = canvas.getContext('2d');
    let isScratching = false;

    // Metallic Gold & Crimson Foil Cover
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#E5A93C');
    grad.addColorStop(0.3, '#FFD166');
    grad.addColorStop(0.7, '#9E1B32');
    grad.addColorStop(1, '#3D0C17');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ornate Foil Border
    ctx.strokeStyle = '#FFF5C0';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Foil Cover Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("👑 ✨ 👑", canvas.width / 2, canvas.height / 2 - 16);

    ctx.fillStyle = '#FFF5C0';
    ctx.font = 'bold 13px "Cinzel", serif';
    ctx.fillText("✨ SCRATCH ME ✨", canvas.width / 2, canvas.height / 2 + 6);

    ctx.fillStyle = '#FFDF6D';
    ctx.font = '11px "Outfit", sans-serif';
    ctx.fillText(`Photo Card #${cardData.id}`, canvas.width / 2, canvas.height / 2 + 25);

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      sound.playTone(450 + Math.random() * 250, 'sine', 0.04, 0.05);
      this.checkScratchPercent(canvas, ctx, cardData);
    };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    canvas.addEventListener('mousedown', (e) => { isScratching = true; const p = getPos(e); scratch(p.x, p.y); });
    canvas.addEventListener('mousemove', (e) => { if (isScratching) { const p = getPos(e); scratch(p.x, p.y); } });
    window.addEventListener('mouseup', () => { isScratching = false; });

    canvas.addEventListener('touchstart', (e) => { isScratching = true; const p = getPos(e); scratch(p.x, p.y); }, { passive: true });
    canvas.addEventListener('touchmove', (e) => { if (isScratching) { const p = getPos(e); scratch(p.x, p.y); } }, { passive: true });
    window.addEventListener('touchend', () => { isScratching = false; });

    // Single click/tap on foil canvas instantly scratches & reveals photo
    canvas.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.checkScratchPercent(canvas, ctx, cardData);
    });
  }

  checkScratchPercent(canvas, ctx, cardData) {
    if (canvas.dataset.scratched === 'true') return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const totalSampled = pixels.length / 16;
    const percentScratched = (transparentCount / totalSampled) * 100;

    if (percentScratched > 25) {
      canvas.dataset.scratched = 'true';
      canvas.style.transition = 'opacity 0.4s ease';
      canvas.style.opacity = '0';
      setTimeout(() => { canvas.style.display = 'none'; }, 400);

      sound.playCatch();
      this.scratchedCount++;

      // Pop up photo preview modal BIG!
      this.showBigPhotoModal(cardData);

      if (this.statusEl) {
        this.statusEl.innerHTML = `✨ Scratched ${this.scratchedCount} of ${this.totalCards} photo cards!`;
      }

      if (this.scratchedCount === this.totalCards) {
        sound.playFanfare();
        if (this.statusEl) {
          this.statusEl.innerHTML = `🏆 <strong>ALL 8 PHOTOS REVEALED!</strong> Memory album unlocked for Eishal! ✨`;
        }
        if (typeof this.onComplete === 'function') {
          this.onComplete();
        }
        setTimeout(() => {
          const rewardEl = document.getElementById('stage2Reward');
          if (rewardEl) {
            rewardEl.classList.remove('hidden');
            rewardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300);
      }
    }
  }
}
