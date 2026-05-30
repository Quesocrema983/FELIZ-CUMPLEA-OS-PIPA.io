/* ============================================
   FELICIDADES PIPA - Birthday Card Script
   ============================================ */

(function () {
  'use strict';

  // === DOM Elements ===
  var card = document.getElementById('card');
  var cardCover = document.getElementById('cardCover');
  var cardInside = document.getElementById('cardInside');
  var starsEl = document.getElementById('stars');
  var confettiLayer = document.getElementById('confettiLayer');
  var scene = document.getElementById('scene');
  var notesContainer = document.getElementById('notesContainer');
  var characterWrap = document.getElementById('characterWrap');
  var bgMusic = document.getElementById('bgMusic');

  // === State ===
  var isOpen = false;
  var noteInterval = null;
  var animFrameId = null;
  var characterOffsetX = 0;
  var targetOffsetX = 0;
  var activeNotes = [];

  // === Note Colors ===
  var NOTE_COLORS = [
    { color: '#FFD700', hue: 50 },
    { color: '#FF6B9D', hue: 340 },
    { color: '#FF8E53', hue: 25 },
    { color: '#FF4ECB', hue: 315 },
    { color: '#FFC107', hue: 45 },
    { color: '#FF5252', hue: 0 },
    { color: '#E040FB', hue: 290 },
    { color: '#FFAB40', hue: 30 },
    { color: '#F50057', hue: 340 },
    { color: '#76FF03', hue: 100 }
  ];

  // === Create Background Stars ===
  function createStars() {
    var count = 50;
    for (var i = 0; i < count; i++) {
      var star = document.createElement('div');
      var isLarge = Math.random() > 0.85;
      star.className = 'star' + (isLarge ? ' large' : '');
      var size = isLarge ? (Math.random() * 8 + 6) : (Math.random() * 3 + 1);
      star.style.setProperty('--size', size + 'px');
      star.style.setProperty('--dur', (Math.random() * 3.5 + 2) + 's');
      star.style.setProperty('--delay', (Math.random() * 5) + 's');
      star.style.setProperty('--peak', (Math.random() * 0.5 + 0.3).toFixed(2));
      star.style.left = (Math.random() * 100).toFixed(1) + '%';
      star.style.top = (Math.random() * 100).toFixed(1) + '%';
      starsEl.appendChild(star);
    }
  }

  // === Open the Card ===
  function openCard() {
    if (isOpen) return;
    isOpen = true;

    card.classList.add('opened');

    // Play music (ignore errors if file not present)
    try {
      bgMusic.volume = 0.4;
      var playPromise = bgMusic.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () { /* Music not available, OK */ });
      }
    } catch (e) { /* Ignore */ }

    // Confetti burst
    setTimeout(burstConfetti, 700);

    // Add wave animation to letters after they appear
    setTimeout(function () {
      var letters = document.querySelectorAll('.letter');
      for (var i = 0; i < letters.length; i++) {
        letters[i].classList.add('wave');
      }
    }, 2200);

    // Start notes and dodging
    setTimeout(function () {
      noteInterval = setInterval(spawnNote, 650);
      animFrameId = requestAnimationFrame(dodgeLoop);
    }, 1600);
  }

  // === Confetti Burst ===
  function burstConfetti() {
    var count = 70;
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';

      var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      var dist = Math.random() * 280 + 120;
      var tx = Math.cos(angle) * dist;
      var ty = Math.sin(angle) * dist - 60;
      var tr = Math.random() * 720 - 360;
      var w = Math.random() * 10 + 5;
      var h = Math.random() * 10 + 5;
      var dur = Math.random() * 0.8 + 1.2;
      var delay = Math.random() * 0.35;
      var hue = Math.random() * 360;
      var isCircle = Math.random() > 0.6;

      piece.style.setProperty('--tx', tx.toFixed(0) + 'px');
      piece.style.setProperty('--ty', ty.toFixed(0) + 'px');
      piece.style.setProperty('--tr', tr.toFixed(0) + 'deg');
      piece.style.setProperty('--w', w.toFixed(1) + 'px');
      piece.style.setProperty('--h', h.toFixed(1) + 'px');
      piece.style.setProperty('--bg', 'hsl(' + hue.toFixed(0) + ', 100%, 65%)');
      piece.style.setProperty('--dur', dur.toFixed(2) + 's');
      piece.style.setProperty('--delay', delay.toFixed(2) + 's');
      piece.style.setProperty('--radius', isCircle ? '50%' : '2px');

      confettiLayer.appendChild(piece);

      // Clean up
      (function (el, d) {
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, (d + delay + 0.1) * 1000);
      })(piece, dur);
    }
  }

  // === Spawn a Musical Note ===
  function spawnNote() {
    var colorData = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    var type = Math.random();
    var sceneWidth = scene.offsetWidth;
    var sceneHeight = scene.offsetHeight;

    var note = document.createElement('div');
    note.className = 'note';

    var x = Math.random() * (sceneWidth - 50) + 10;
    var fallDist = sceneHeight + 80;
    var fallDur = Math.random() * 2 + 3;
    var rotation = (Math.random() - 0.5) * 50;
    var delay = Math.random() * 0.15;

    note.style.left = x + 'px';
    note.style.setProperty('--fall-dist', fallDist + 'px');
    note.style.setProperty('--fall-dur', fallDur + 's');
    note.style.setProperty('--rotation', rotation + 'deg');
    note.style.setProperty('--delay', delay + 's');
    note.style.setProperty('--note-color', colorData.color);
    note.style.setProperty('--note-hue', colorData.hue.toString());

    if (type < 0.35) {
      // Quarter note
      note.innerHTML =
        '<div class="note-inner">' +
          '<div class="note-head"></div>' +
          '<div class="note-stem"></div>' +
        '</div>';
    } else if (type < 0.7) {
      // Eighth note with flag
      note.innerHTML =
        '<div class="note-inner">' +
          '<div class="note-head"></div>' +
          '<div class="note-stem"></div>' +
          '<div class="note-flag"></div>' +
        '</div>';
    } else {
      // Double beamed note
      note.innerHTML =
        '<div class="note-inner note-double">' +
          '<div class="note-head"></div>' +
          '<div class="note-head-2"></div>' +
          '<div class="note-stem"></div>' +
          '<div class="note-beam"></div>' +
        '</div>';
    }

    // Store position for dodge calc
    note._noteX = x + 20;
    note._startTime = Date.now();
    note._fallDur = fallDur * 1000;
    note._delay = delay * 1000;

    notesContainer.appendChild(note);
    activeNotes.push(note);

    // Remove when animation ends
    (function (el, dur) {
      setTimeout(function () {
        var idx = activeNotes.indexOf(el);
        if (idx > -1) activeNotes.splice(idx, 1);
        if (el.parentNode) el.parentNode.removeChild(el);
      }, (dur + delay) * 1000 + 200);
    })(note, fallDur);
  }

  // === Character Dodge Loop ===
  function dodgeLoop() {
    if (!isOpen) return;

    var sceneRect = scene.getBoundingClientRect();
    var sceneW = sceneRect.width;
    var sceneH = sceneRect.height;

    // Get actual character size from rendered element
    var charEl = document.getElementById('character');
    var charW = charEl ? charEl.offsetWidth : 180;
    var charH = charEl ? charEl.offsetHeight : 180;

    // Character center position
    var charCX = sceneW / 2 + characterOffsetX;
    var charCY = sceneH - charH / 2;

    var needsDodge = false;
    var dodgeDir = 0;
    var closestDist = 9999;

    var dodgeRadiusX = charW / 2 + 25;
    var dodgeRadiusY = charH / 2 + 30;

    for (var i = 0; i < activeNotes.length; i++) {
      var note = activeNotes[i];
      var noteRect = note.getBoundingClientRect();
      var noteCX = noteRect.left - sceneRect.left + noteRect.width / 2;
      var noteCY = noteRect.top - sceneRect.top + noteRect.height / 2;

      // Is the note approaching the character vertically?
      if (noteCY > charCY - dodgeRadiusY && noteCY < charCY + dodgeRadiusY * 0.4) {
        var dx = Math.abs(noteCX - charCX);
        if (dx < dodgeRadiusX && dx < closestDist) {
          closestDist = dx;
          dodgeDir = noteCX > charCX ? -1 : 1;
          needsDodge = true;
        }
      }
    }

    if (needsDodge) {
      // Dodge away from the closest danger
      var dodgeStrength = 6 + (1 - closestDist / dodgeRadiusX) * 12;
      targetOffsetX += dodgeDir * dodgeStrength;
    } else {
      // Return to center smoothly
      targetOffsetX *= 0.94;
    }

    // Clamp to scene bounds (account for actual character width)
    var maxOffset = Math.max(10, (sceneW / 2) - (charW / 2 + 10));
    if (targetOffsetX > maxOffset) targetOffsetX = maxOffset;
    if (targetOffsetX < -maxOffset) targetOffsetX = -maxOffset;

    // Smooth interpolation
    characterOffsetX += (targetOffsetX - characterOffsetX) * 0.13;

    characterWrap.style.transform = 'translateX(' + characterOffsetX.toFixed(1) + 'px)';

    animFrameId = requestAnimationFrame(dodgeLoop);
  }

  // === Event Listeners ===
  cardCover.addEventListener('click', function (e) {
    e.preventDefault();
    openCard();
  });

  cardCover.addEventListener('touchend', function (e) {
    e.preventDefault();
    openCard();
  });

  // Keyboard accessibility
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        openCard();
      }
    }
  });

  // === Initialize ===
  createStars();

})();
