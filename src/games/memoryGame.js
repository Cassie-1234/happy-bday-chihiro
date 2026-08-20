import { sound } from '../audio.js';
import { BIRTHDAY_CONFIG } from '../config.js';

export class MemoryGame {
  constructor(gridId, statusElId, resetBtnId, onCompleteCallback) {
    this.grid = document.getElementById(gridId);
    this.statusEl = document.getElementById(statusElId);
    this.resetBtn = document.getElementById(resetBtnId);
    this.onComplete = onCompleteCallback;

    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.isLocking = false;

    this.init();
  }

  init() {
    if (!this.grid) return;
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    this.resetGame();
  }

  resetGame() {
    sound.playClick();
    this.grid.innerHTML = '';
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.isLocking = false;

    if (this.statusEl) {
      this.statusEl.innerHTML = `Match all 6 tea cipher pairs to earn Duke Wriothesley's seal!`;
    }

    const pairDeck = [...BIRTHDAY_CONFIG.memoryCards, ...BIRTHDAY_CONFIG.memoryCards];
    this.cards = pairDeck.sort(() => Math.random() - 0.5);

    this.cards.forEach((cardData, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.id = cardData.id;
      cardEl.dataset.index = idx;

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-front">🐺</div>
          <div class="card-back">${cardData.icon}<span>${cardData.label}</span></div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.flipCard(cardEl, cardData));
      this.grid.appendChild(cardEl);
    });
  }

  flipCard(cardEl, cardData) {
    if (this.isLocking) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    sound.playFlip();
    cardEl.classList.add('flipped');
    this.flippedCards.push({ cardEl, cardData });

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    this.isLocking = true;
    const [c1, c2] = this.flippedCards;

    if (c1.cardData.id === c2.cardData.id) {
      setTimeout(() => {
        sound.playCatch();
        c1.cardEl.classList.add('matched');
        c2.cardEl.classList.add('matched');

        this.matchedPairs++;
        this.flippedCards = [];
        this.isLocking = false;

        const compliment = BIRTHDAY_CONFIG.compliments[this.matchedPairs % BIRTHDAY_CONFIG.compliments.length];
        if (this.statusEl) {
          this.statusEl.innerHTML = `✨ <strong>Match!</strong> ${compliment}`;
        }

        if (this.matchedPairs === BIRTHDAY_CONFIG.memoryCards.length) {
          sound.playFanfare();
          if (this.statusEl) {
            this.statusEl.innerHTML = `🏆 <strong>STAGE 2 TASK COMPLETE!</strong> Duke Wriothesley approves!`;
          }
          if (typeof this.onComplete === 'function') {
            this.onComplete();
          }
        }
      }, 400);
    } else {
      setTimeout(() => {
        c1.cardEl.classList.remove('flipped');
        c2.cardEl.classList.remove('flipped');
        this.flippedCards = [];
        this.isLocking = false;
      }, 900);
    }
  }
}
