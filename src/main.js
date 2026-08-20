import { BIRTHDAY_CONFIG } from './config.js';
import { sound } from './audio.js';
import { FireworksEngine } from './fireworks.js';
import { NaviaPuzzleGame } from './games/puzzleGame.js';
import { ScratchCardGame } from './games/scratchGame.js';
import { ForgivenessMeterGame } from './games/forgivenessMeter.js';
import { EscapingNoGame } from './games/escapingNoGame.js';

let fireworks = null;

document.addEventListener('DOMContentLoaded', () => {
  fireworks = new FireworksEngine('fireworksCanvas');

  initEnvelopeGate();
  initAudioControl();
  initStageProgression();
  initTreasuryPopups();
  initWishLauncher();
  initFeedbackSystem();
});

/* ==========================================================================
   1. Envelope Gate & Audio Toggle
   ========================================================================== */
function initEnvelopeGate() {
  const waxSealBtn = document.getElementById('waxSealBtn');
  const envelopeGate = document.getElementById('envelopeGate');
  const appContainer = document.getElementById('appContainer');

  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', () => {
      sound.playWaxSealOpen();
      sound.startBGM();

      envelopeGate.classList.add('fade-out');
      setTimeout(() => {
        envelopeGate.style.display = 'none';
        appContainer.classList.remove('hidden');
      }, 750);
    });
  }
}

function initAudioControl() {
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  const audioLabel = document.getElementById('audioLabel');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      audioIcon.innerText = isMuted ? '🔇' : '🔊';
      audioLabel.innerText = isMuted ? 'Sound OFF' : 'Sound ON';
    });
  }
}

/* ==========================================================================
   2. 5-Stage Quest Progression Flow with Back/Forward Step Navigation
   ========================================================================== */
function initStageProgression() {
  const stages = [
    document.getElementById('stage1'),
    document.getElementById('stage2'),
    document.getElementById('stage3'),
    document.getElementById('stage4'),
    document.getElementById('stage5')
  ];

  const stepIndicators = [
    document.getElementById('stepIndicator1'),
    document.getElementById('stepIndicator2'),
    document.getElementById('stepIndicator3'),
    document.getElementById('stepIndicator4'),
    document.getElementById('stepIndicator5')
  ];

  const stepLines = [
    document.getElementById('stepLine1'),
    document.getElementById('stepLine2'),
    document.getElementById('stepLine3'),
    document.getElementById('stepLine4')
  ];

  const rewards = [
    document.getElementById('stage1Reward'),
    document.getElementById('stage2Reward'),
    document.getElementById('stage3Reward'),
    document.getElementById('stage4Reward')
  ];

  const btnNext1 = document.getElementById('nextStageBtn1');
  const overlayNextBtn = document.getElementById('overlayNextBtn');
  const btnNext2 = document.getElementById('nextStageBtn2');
  const btnNext3 = document.getElementById('nextStageBtn3');
  const btnNext4 = document.getElementById('nextStageBtn4');

  // Track max stage unlocked
  let maxUnlockedStage = 1;

  // Mini-game instances
  let game2 = null;
  let game3 = null;
  let game4 = null;

  // Function to switch to target stage (1-5)
  const showStage = (targetStageNum) => {
    if (targetStageNum < 1 || targetStageNum > 5) return;

    sound.playClick();

    stages.forEach((stg, idx) => {
      if (stg) {
        if (idx + 1 === targetStageNum) {
          stg.classList.remove('hidden-stage');
          stg.classList.add('stage-active');
        } else {
          stg.classList.add('hidden-stage');
          stg.classList.remove('stage-active');
        }
      }
    });

    // Update steps bar indicators
    stepIndicators.forEach((ind, idx) => {
      if (!ind) return;
      const stageNum = idx + 1;
      if (stageNum === targetStageNum) {
        ind.classList.add('active');
        ind.classList.remove('locked');
      } else if (stageNum <= maxUnlockedStage) {
        ind.classList.remove('active', 'locked');
        ind.classList.add('completed');
      } else {
        ind.classList.remove('active', 'completed');
        ind.classList.add('locked');
      }
    });

    // Fill connecting lines
    stepLines.forEach((line, idx) => {
      if (!line) return;
      if (idx + 1 < maxUnlockedStage) {
        line.classList.add('filled');
      } else {
        line.classList.remove('filled');
      }
    });

    // Update theme background based on stage
    if (targetStageNum === 1) document.body.className = 'theme-navia';
    else if (targetStageNum === 2) document.body.className = 'theme-wriothesley';
    else document.body.className = 'theme-dual';

    // Lazy load mini-games
    if (targetStageNum === 2 && !game2) {
      game2 = new ScratchCardGame('scratchGrid', 'scratchStatus', () => {
        if (rewards[1]) rewards[1].classList.remove('hidden');
      });
    } else if (targetStageNum === 3 && !game3) {
      game3 = new ForgivenessMeterGame('stage3TaskBox', 'forgiveStatus', () => {
        if (rewards[2]) rewards[2].classList.remove('hidden');
      });
    } else if (targetStageNum === 4 && !game4) {
      game4 = new EscapingNoGame('stage4TaskBox', 'escapingStatus', () => {
        if (rewards[3]) rewards[3].classList.remove('hidden');
      });
    } else if (targetStageNum === 5) {
      populateLetter();
    }
  };

  // Enable direct clicking on unlocked step indicators to navigate back and forth!
  stepIndicators.forEach((ind, idx) => {
    if (!ind) return;
    ind.addEventListener('click', () => {
      const stageNum = idx + 1;
      if (stageNum <= maxUnlockedStage) {
        showStage(stageNum);
      }
    });
  });

  // Stage 1 -> 2
  const unlockStage2 = () => {
    maxUnlockedStage = Math.max(maxUnlockedStage, 2);
    showStage(2);
  };
  if (btnNext1) btnNext1.addEventListener('click', unlockStage2);
  if (overlayNextBtn) overlayNextBtn.addEventListener('click', unlockStage2);

  // Stage 2 -> 3
  if (btnNext2) {
    btnNext2.addEventListener('click', () => {
      maxUnlockedStage = Math.max(maxUnlockedStage, 3);
      showStage(3);
    });
  }

  // Stage 3 -> 4
  if (btnNext3) {
    btnNext3.addEventListener('click', () => {
      maxUnlockedStage = Math.max(maxUnlockedStage, 4);
      showStage(4);
    });
  }

  // Stage 4 -> 5 (Grand Treasury)
  if (btnNext4) {
    btnNext4.addEventListener('click', () => {
      maxUnlockedStage = Math.max(maxUnlockedStage, 5);
      sound.playFanfare();
      if (fireworks) fireworks.createMultiBurst();
      showStage(5);
    });
  }

  // Mini-Game 1: Navia Radiant Photo Puzzle
  new NaviaPuzzleGame('puzzleGrid', 'puzzleStatus', 'resetPuzzleBtn', 'puzzleCompletionOverlay', () => {
    if (rewards[0]) rewards[0].classList.remove('hidden');
  });
}

/* ==========================================================================
   3. Stage 5 Treasury Pop-up Modals (Letter, Cake, and Feedback!)
   ========================================================================== */
function initTreasuryPopups() {
  const openLetterBtn = document.getElementById('openLetterTabBtn');
  const openCakeBtn = document.getElementById('openCakeTabBtn');
  const openFeedbackBtn = document.getElementById('openFeedbackTabBtn');

  const letterModal = document.getElementById('letterModalOverlay');
  const cakeModal = document.getElementById('cakeModalOverlay');
  const feedbackModal = document.getElementById('feedbackModalOverlay');

  const closeLetterBtn = document.getElementById('closeLetterModalBtn');
  const closeUnfoldedLetterBtn = document.getElementById('closeUnfoldedLetterBtn');
  const closeCakeBtn = document.getElementById('closeCakeModalBtn');
  const closeFeedbackBtn = document.getElementById('closeFeedbackModalBtn');

  const letterEnvelopeWrapper = document.getElementById('letterEnvelope3D');
  const redWaxDot = document.getElementById('redWaxDot');
  const unreadDotBadge = document.getElementById('unreadDotBadge');
  const letterPaperContent = document.getElementById('letterPaperContent');

  // Open Letter Modal
  if (openLetterBtn && letterModal) {
    openLetterBtn.addEventListener('click', () => {
      sound.playClick();
      letterModal.classList.remove('hidden');
    });
  }

  // Crack Wax Seal & Open Big Letter
  if (letterEnvelopeWrapper) {
    letterEnvelopeWrapper.addEventListener('click', () => {
      sound.playWaxSealOpen();
      letterEnvelopeWrapper.classList.add('envelope-opened');
      if (redWaxDot) redWaxDot.style.display = 'none';
      if (unreadDotBadge) unreadDotBadge.style.display = 'none';

      setTimeout(() => {
        if (letterPaperContent) letterPaperContent.classList.add('paper-unfolded');
      }, 400);
    });
  }

  // Close Letter Modal from envelope level
  const hideLetterModal = () => {
    sound.playClick();
    if (letterModal) letterModal.classList.add('hidden');
    if (letterPaperContent) letterPaperContent.classList.remove('paper-unfolded');
    if (letterEnvelopeWrapper) letterEnvelopeWrapper.classList.remove('envelope-opened');
  };

  if (closeLetterBtn) closeLetterBtn.addEventListener('click', hideLetterModal);
  if (closeUnfoldedLetterBtn) closeUnfoldedLetterBtn.addEventListener('click', hideLetterModal);

  // Open Cake Modal
  if (openCakeBtn && cakeModal) {
    openCakeBtn.addEventListener('click', () => {
      sound.playClick();
      cakeModal.classList.remove('hidden');
    });
  }

  // Close Cake Modal
  if (closeCakeBtn && cakeModal) {
    closeCakeBtn.addEventListener('click', () => {
      sound.playClick();
      cakeModal.classList.add('hidden');
    });
  }

  // Open Feedback Modal
  if (openFeedbackBtn && feedbackModal) {
    openFeedbackBtn.addEventListener('click', () => {
      sound.playClick();
      feedbackModal.classList.remove('hidden');
    });
  }

  // Close Feedback Modal
  if (closeFeedbackBtn && feedbackModal) {
    closeFeedbackBtn.addEventListener('click', () => {
      sound.playClick();
      feedbackModal.classList.add('hidden');
    });
  }

  // Cake Candles Interactive blowing
  const candles = document.querySelectorAll('.candle-3d');
  const cakeMsg = document.getElementById('cakeMessage');
  let extinguishedCount = 0;

  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      if (!candle.classList.contains('extinguished')) {
        candle.classList.remove('lit');
        candle.classList.add('extinguished');
        sound.playCatch();
        extinguishedCount++;

        if (extinguishedCount === candles.length) {
          sound.playFanfare();
          if (cakeMsg) {
            cakeMsg.innerHTML = "🎉 ALL CANDLES BLOWN OUT! Your magical birthday wish has come true, Chihiro! ✨💖";
          }
          if (fireworks) fireworks.createMultiBurst();
        }
      }
    });
  });
}

function populateLetter() {
  const letter = BIRTHDAY_CONFIG.letter;
  const sal = document.getElementById('letterSalutation');
  const body = document.getElementById('letterBody');
  const clos = document.getElementById('letterClosing');
  const sig = document.getElementById('letterSignature');

  if (sal) sal.innerText = letter.salutation;
  if (body && letter.paragraphs) {
    body.innerHTML = letter.paragraphs.map(p => `<p>${p}</p>`).join('');
  }
  if (clos) clos.innerText = letter.closing;
  if (sig) sig.innerText = letter.signature;
}

/* ==========================================================================
   4. Rocket Flying Animation with Real Flame Particles Trail ("shooooo")
   ========================================================================== */
function initWishLauncher() {
  const wishInput = document.getElementById('wishInput');
  const launchBtn = document.getElementById('launchWishBtn');
  const wishFeed = document.getElementById('wishFeed');

  if (launchBtn && wishInput && wishFeed) {
    launchBtn.addEventListener('click', () => {
      const val = wishInput.value.trim();
      if (!val) return;

      const btnRect = launchBtn.getBoundingClientRect();
      const startX = btnRect.left + btnRect.width / 2;
      const startY = btnRect.top;

      // Rocket Container
      const rocket = document.createElement('div');
      rocket.className = 'flying-wish-rocket center-rocket';
      rocket.innerHTML = `<span class="rocket-emoji">🚀</span><div class="rocket-flame-trail"></div>`;
      rocket.style.left = `${startX}px`;
      rocket.style.top = `${startY}px`;
      document.body.appendChild(rocket);

      sound.playTone(380, 'sawtooth', 0.3, 0.45);

      // Rocket Launch Flame Particle Emitter ("shooooo")
      let flameInterval = setInterval(() => {
        const rRect = rocket.getBoundingClientRect();
        createRocketFlameParticle(rRect.left + 15, rRect.top + 30);
      }, 30);

      setTimeout(() => {
        rocket.classList.add('rocket-shooting-center');
      }, 10);

      // Rocket reaches top -> Canvas Fireworks Multi-Burst!
      setTimeout(() => {
        clearInterval(flameInterval);
        rocket.remove();
        sound.playFanfare();

        if (fireworks) fireworks.createMultiBurst();

        // Add to Wish Feed
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.innerHTML = `🚀 "${val}" — Sent for Eishal by Cassie ✨`;

        wishFeed.prepend(card);
        wishInput.value = '';
      }, 750);
    });
  }
}

function createRocketFlameParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'rocket-flame-spark';
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  document.body.appendChild(p);

  setTimeout(() => { p.remove(); }, 400);
}

/* ==========================================================================
   5. Feedback & Birthday Reply Storage System
   ========================================================================== */
function initFeedbackSystem() {
  const input = document.getElementById('feedbackInput');
  const btn = document.getElementById('sendFeedbackBtn');
  const feed = document.getElementById('feedbackFeed');

  if (!btn || !input || !feed) return;

  const STORAGE_KEY = 'chihiro_bday_feedback';

  const loadFeedback = () => {
    feed.innerHTML = '';
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (stored.length === 0) {
      feed.innerHTML = `<div class="empty-feed-msg">No reply messages yet. Write your message above! 💌</div>`;
    } else {
      stored.forEach(item => {
        const card = document.createElement('div');
        card.className = 'feedback-reply-card';
        card.innerHTML = `
          <div class="feedback-meta">💌 <strong>Chihiro (Eishal)</strong></div>
          <div class="feedback-text">"${item.text}"</div>
        `;
        feed.prepend(card);
      });
    }
  };

  loadFeedback();

  btn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    sound.playCatch();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    stored.push({ text: text, time: now });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    input.value = '';
    loadFeedback();
    if (fireworks) fireworks.createBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
  });
}
