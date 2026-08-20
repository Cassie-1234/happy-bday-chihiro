import { sound } from '../audio.js';

export class NaviaPuzzleGame {
  constructor(gridId, statusElId, resetBtnId, completionOverlayId, onCompleteCallback) {
    this.grid = document.getElementById(gridId);
    this.statusEl = document.getElementById(statusElId);
    this.resetBtn = resetBtnId ? document.getElementById(resetBtnId) : null;
    this.completionOverlay = document.getElementById(completionOverlayId);
    this.onComplete = onCompleteCallback;

    this.imageSrc = './assets/navia_puzzle.jpg';
    this.totalTiles = 9; // 3x3
    
    this.currentOrder = [];
    this.selectedTile = null;
    this.isSolved = false;

    this.init();
  }

  init() {
    if (!this.grid) return;
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.startPuzzle());
    }
    this.startPuzzle();
  }

  startPuzzle() {
    sound.playClick();
    this.grid.innerHTML = '';
    this.selectedTile = null;
    this.isSolved = false;

    if (this.completionOverlay) {
      this.completionOverlay.classList.add('hidden');
    }

    const initialArray = Array.from({ length: this.totalTiles }, (_, i) => i);
    
    // Shuffle array (ensure it's not already solved on start)
    do {
      this.currentOrder = [...initialArray].sort(() => Math.random() - 0.5);
    } while (this.checkSolvedSilently());

    this.renderTiles();
    this.updateStatus();
  }

  renderTiles() {
    this.grid.innerHTML = '';
    
    this.currentOrder.forEach((originalIndex, slotIndex) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.dataset.slotIndex = slotIndex;
      tile.dataset.originalIndex = originalIndex;

      // 3x3 background position mapping
      const col = originalIndex % 3;
      const row = Math.floor(originalIndex / 3);
      const bgX = (col / 2) * 100;
      const bgY = (row / 2) * 100;

      tile.style.backgroundImage = `url(${this.imageSrc})`;
      tile.style.backgroundSize = '300% 300%';
      tile.style.backgroundPosition = `${bgX}% ${bgY}%`;

      // Tile number overlay badge for helpful guidance
      const badge = document.createElement('span');
      badge.className = 'tile-badge';
      badge.innerText = originalIndex + 1;
      tile.appendChild(badge);

      tile.addEventListener('click', () => this.handleTileClick(slotIndex, tile));
      this.grid.appendChild(tile);
    });
  }

  handleTileClick(slotIndex, tileEl) {
    if (this.isSolved) return;

    if (this.selectedTile === null) {
      sound.playClick();
      this.selectedTile = { slotIndex, tileEl };
      tileEl.classList.add('tile-selected');
    } else if (this.selectedTile.slotIndex === slotIndex) {
      sound.playClick();
      this.selectedTile.tileEl.classList.remove('tile-selected');
      this.selectedTile = null;
    } else {
      sound.playFlip();
      const firstSlot = this.selectedTile.slotIndex;
      const secondSlot = slotIndex;

      const temp = this.currentOrder[firstSlot];
      this.currentOrder[firstSlot] = this.currentOrder[secondSlot];
      this.currentOrder[secondSlot] = temp;

      this.selectedTile.tileEl.classList.remove('tile-selected');
      this.selectedTile = null;

      this.renderTiles();
      this.checkStatus();
    }
  }

  checkSolvedSilently() {
    return this.currentOrder.every((val, idx) => val === idx);
  }

  checkStatus() {
    let correctCount = 0;
    this.currentOrder.forEach((val, idx) => {
      if (val === idx) correctCount++;
    });

    this.updateStatus(correctCount);

    if (correctCount === this.totalTiles) {
      this.isSolved = true;
      sound.playFanfare();

      if (this.statusEl) {
        this.statusEl.innerHTML = `🏆 <strong>PUZZLE SOLVED!</strong> Happy Birthday, Eishal! ✨`;
      }

      // Pop up in-place overlay directly over the puzzle grid!
      if (this.completionOverlay) {
        this.completionOverlay.classList.remove('hidden');
      }

      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }
  }

  updateStatus(correctCount = null) {
    if (correctCount === null) {
      correctCount = 0;
      this.currentOrder.forEach((val, idx) => {
        if (val === idx) correctCount++;
      });
    }

    if (this.statusEl && !this.isSolved) {
      this.statusEl.innerHTML = `Click two tiles to swap! Solved: ${correctCount} / ${this.totalTiles} Pieces`;
    }
  }
}
