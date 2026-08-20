import { sound } from '../audio.js';

export class DuoShowdownGame {
  constructor(canvasId, meterId, startBtnId, onCompleteCallback) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.meterEl = document.getElementById(meterId);
    this.startBtn = document.getElementById(startBtnId);
    this.onComplete = onCompleteCallback;

    this.targets = [];
    this.particles = [];
    this.progress = 0;
    this.isRunning = false;
    this.animId = null;

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.handleClick(touch);
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
  }

  startGame() {
    sound.playClick();
    this.targets = [];
    this.particles = [];
    this.progress = 0;
    this.isRunning = true;
    this.updateMeterDisplay();

    if (this.startBtn) this.startBtn.innerText = "Restart Showdown";
    if (this.animId) cancelAnimationFrame(this.animId);
    this.gameLoop();
  }

  updateMeterDisplay() {
    if (this.meterEl) {
      this.meterEl.style.width = `${Math.min(this.progress, 100)}%`;
    }
  }

  spawnTarget() {
    const types = [
      { type: 'navia_cannon', icon: '💣', color: '#FFD700', val: 12 },
      { type: 'wrio_frost', icon: '❄️', color: '#00F5FF', val: 12 },
      { type: 'spina_gift', icon: '🎁', color: '#FF4081', val: 16 }
    ];

    const sel = types[Math.floor(Math.random() * types.length)];
    this.targets.push({
      x: 30 + Math.random() * (this.canvas.width - 60),
      y: this.canvas.height + 20,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(2.2 + Math.random() * 2.5),
      radius: 24,
      ...sel
    });
  }

  handleClick(e) {
    if (!this.isRunning) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      const dist = Math.hypot(clickX - target.x, clickY - target.y);

      if (dist <= target.radius + 10) {
        sound.playBlast();
        this.progress += target.val;
        this.updateMeterDisplay();

        this.createExplosion(target.x, target.y, target.color);
        this.targets.splice(i, 1);

        if (this.progress >= 100) {
          this.progress = 100;
          this.isRunning = false;
          sound.playFanfare();
          this.createGrandFinaleExplosions();
          if (typeof this.onComplete === 'function') {
            this.onComplete();
          }
        }
        break;
      }
    }
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: 3 + Math.random() * 4
      });
    }
  }

  createGrandFinaleExplosions() {
    for (let k = 0; k < 5; k++) {
      setTimeout(() => {
        const rx = Math.random() * this.canvas.width;
        const ry = Math.random() * this.canvas.height;
        const color = k % 2 === 0 ? '#FFD700' : '#00F5FF';
        sound.playBlast();
        this.createExplosion(rx, ry, color);
      }, k * 250);
    }
  }

  update() {
    if (Math.random() < 0.04 && this.targets.length < 5) {
      this.spawnTarget();
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.x += t.vx;
      t.y += t.vy;

      if (t.y < -40 || t.x < -40 || t.x > this.canvas.width + 40) {
        this.targets.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#100C1B');
    grad.addColorStop(1, '#271C38');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.targets.forEach(t => {
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = t.color;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;

      this.ctx.strokeStyle = t.color;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = '20px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(t.icon, t.x, t.y);
    });

    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    if (this.progress >= 100) {
      this.ctx.fillStyle = 'rgba(15, 10, 25, 0.85)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 20px "Cinzel", serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("🎉 DUO METER 100% COMPLETE! 🎉", this.canvas.width / 2, 100);
      this.ctx.fillStyle = '#E0E6ED';
      this.ctx.font = '15px "Outfit", sans-serif';
      this.ctx.fillText("All Fontaine Birthday Challenges Passed!", this.canvas.width / 2, 135);
      this.ctx.fillText("Click 'Enter Eishal's Birthday Treasury' below!", this.canvas.width / 2, 165);
    }
  }

  gameLoop() {
    if (!this.isRunning && this.progress < 100) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.gameLoop());
  }
}
