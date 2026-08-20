import { sound } from '../audio.js';
import { BIRTHDAY_CONFIG } from '../config.js';

export class MacaronCatchGame {
  constructor(canvasId, scoreElId, startBtnId, onCompleteCallback) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.scoreEl = document.getElementById(scoreElId);
    this.startBtn = document.getElementById(startBtnId);
    this.onComplete = onCompleteCallback;
    
    this.score = 0;
    this.targetScore = 100;
    this.isRunning = false;
    this.animId = null;
    
    this.player = {
      x: 0,
      y: 0,
      width: 90,
      height: 32,
      speed: 9
    };

    this.items = [];
    this.spawnTimer = 0;
    this.keys = {};

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.player.x = e.clientX - rect.left - this.player.width / 2;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = e.touches[0].clientX - rect.left - this.player.width / 2;
      }
    }, { passive: true });

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startGame());
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = Math.min(parent.clientWidth - 20, 580);
    this.canvas.height = 230;
    this.player.y = this.canvas.height - 40;
    this.player.x = (this.canvas.width - this.player.width) / 2;
  }

  startGame() {
    sound.playClick();
    this.score = 0;
    this.items = [];
    this.isRunning = true;
    this.updateScoreDisplay();
    if (this.startBtn) this.startBtn.innerText = "Restart Dash";
    
    if (this.animId) cancelAnimationFrame(this.animId);
    this.gameLoop();
  }

  updateScoreDisplay() {
    if (this.scoreEl) {
      this.scoreEl.innerText = `Score: ${this.score} / ${this.targetScore}`;
    }
  }

  spawnItem() {
    const types = [
      { type: 'lemon', icon: '🟡', score: 10, color: '#FFE066' },
      { type: 'strawberry', icon: '💗', score: 15, color: '#FF7096' },
      { type: 'golden_rose', icon: '🌹', score: 20, color: '#FFD700' },
      { type: 'gear', icon: '⚙️', score: -10, color: '#8D99AE' }
    ];

    const rand = Math.random();
    let selectedType;
    if (rand < 0.40) selectedType = types[0];
    else if (rand < 0.70) selectedType = types[1];
    else if (rand < 0.85) selectedType = types[2];
    else selectedType = types[3];

    this.items.push({
      x: Math.random() * (this.canvas.width - 30),
      y: -30,
      size: 26,
      speed: 2.2 + Math.random() * 2.8,
      ...selectedType
    });
  }

  update() {
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.x += this.player.speed;
    }

    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.canvas.width - this.player.width) {
      this.player.x = this.canvas.width - this.player.width;
    }

    this.spawnTimer++;
    if (this.spawnTimer > 25) {
      this.spawnItem();
      this.spawnTimer = 0;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;

      if (
        item.y + item.size >= this.player.y &&
        item.y <= this.player.y + this.player.height &&
        item.x + item.size >= this.player.x &&
        item.x <= this.player.x + this.player.width
      ) {
        this.score += item.score;
        if (this.score < 0) this.score = 0;
        this.updateScoreDisplay();

        if (item.score > 0) {
          sound.playCatch();
        } else {
          sound.playTone(150, 'sawtooth', 0.15, 0.15);
        }

        this.items.splice(i, 1);
        continue;
      }

      if (item.y > this.canvas.height) {
        this.items.splice(i, 1);
      }
    }

    if (this.score >= this.targetScore) {
      this.score = this.targetScore;
      this.updateScoreDisplay();
      this.isRunning = false;
      sound.playFanfare();
      this.drawWinState();
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }
  }

  drawWinState() {
    this.ctx.fillStyle = 'rgba(26, 20, 15, 0.88)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 20px "Cinzel", serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("🌟 STAGE 1 TASK COMPLETED! 🌟", this.canvas.width / 2, 100);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '15px "Outfit", sans-serif';
    this.ctx.fillText(`Navia declares ${BIRTHDAY_CONFIG.nickname} the Master Baker!`, this.canvas.width / 2, 135);
    this.ctx.fillText("Click 'Proceed to Stage 2' below to continue!", this.canvas.width / 2, 165);
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad.addColorStop(0, '#1E182A');
    bgGrad.addColorStop(1, '#382B47');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Navia Umbrella Basket
    this.ctx.fillStyle = '#E5A93C';
    this.ctx.beginPath();
    this.ctx.roundRect(this.player.x, this.player.y, this.player.width, this.player.height, [8, 8, 15, 15]);
    this.ctx.fill();

    this.ctx.strokeStyle = '#FFF3B0';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '15px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("☂️ Navia", this.player.x + this.player.width / 2, this.player.y + 22);

    this.items.forEach(item => {
      this.ctx.font = '22px sans-serif';
      this.ctx.fillText(item.icon, item.x, item.y);
    });
  }

  gameLoop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.gameLoop());
  }
}
