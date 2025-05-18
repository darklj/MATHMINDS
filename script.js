window.onload = function () {

  function playMusic() {
  const bgMusic = document.getElementById("bgMusic");
  bgMusic.play();
}
  // Background slideshow
const bgImages = [
  'background 1.jpeg',
  'background 2.jpeg',
  'background 3.jpeg' ,
  'background 4.jpeg',
  'background 5.jpeg',
  'background 6.jpeg',
  'background 7.jpeg',
  'background 8.jpeg',
  'background 9.jpeg',
  'background 10.jpeg',
];

const problemBoxBackgrounds = [
  'usopp q.jpg',
  'problem-bg2.jpg',
  'problem-bg3.jpg',
  // add all your problem box backgrounds here
];

const answerBoxBackgrounds = [
  'usopp a.jpg',
  'answer-bg2.jpg',
  'answer-bg3.jpg',
  // add all your answer box backgrounds here
];

let currentImageIndex = 0;
const slideshowEl = document.getElementById('background-slideshow');

function updateBackground() {
  slideshowEl.style.backgroundImage = `url('${bgImages[currentImageIndex]}')`;
  currentImageIndex = (currentImageIndex + 1) % bgImages.length;
}

updateBackground(); // Show first image immediately
setInterval(updateBackground, 5000); // Change every 5 seconds

  const puzzleBoard = document.getElementById('puzzleBoard');
  const piecesContainer = document.getElementById('pieces');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const timerEl = document.getElementById('timer');
  const hintEl = document.getElementById('hint'); // Hint element
  const hintText = document.getElementById('hintText'); // For dynamic hint text

const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = 0.5; // Set a fixed default volume

// Toggle music play/pause on double click anywhere on the page
document.addEventListener('dblclick', () => {
  if (bgMusic.paused) {
    bgMusic.play().catch(e => console.log("Playback prevented:", e));
  } else {
    bgMusic.pause();
  }
});


  // --- ADDITION START ---
  let selectedPiece = null; // To store the clicked puzzle piece
  // --- ADDITION END ---

  let score = 0;
  let level = 1;
  let timeLeft = 120;
  let timer;

  const generateProblem = () => {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const expr = `${a} ${op} ${b}`;
    const answer = eval(expr);
    return { expr, answer };
  };

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  function startGame() {
    puzzleBoard.innerHTML = '';
    piecesContainer.innerHTML = '';

    // --- ADDITION START ---
    selectedPiece = null; // Reset selected piece when starting new game
    hintEl.style.display = 'none';
    hintText.textContent = '';
    // --- ADDITION END ---

    const problems = [];
    for (let i = 0; i < 16; i++) {
      const prob = generateProblem();
      problems.push(prob);
      const cell = document.createElement('div');
      cell.className = 'piece';
      cell.dataset.answer = prob.answer;
      cell.textContent = prob.expr;

      cell.addEventListener('dragover', dragOver);
      cell.addEventListener('drop', drop);

      // --- ADDITION START ---
      // Add click event for selecting this puzzle piece
      cell.addEventListener('click', () => {
        if (selectedPiece) {
          selectedPiece.style.borderColor = '';
          selectedPiece.style.boxShadow = '';
        }
        selectedPiece = cell;
        selectedPiece.style.borderColor = '#007BFF';
        selectedPiece.style.boxShadow = '0 0 10px #007BFF';
      });
      // --- ADDITION END ---

      puzzleBoard.appendChild(cell);
    }

    const answers = shuffleArray(problems.map(p => p.answer));
    answers.forEach(ans => {
      const piece = document.createElement('div');
      piece.className = 'answer-piece';
      piece.draggable = true;
      piece.textContent = ans;
      piece.dataset.answer = ans;
      piece.addEventListener('dragstart', dragStart);
      piecesContainer.appendChild(piece);
    });

    timeLeft = 120;
    timerEl.textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      alert('Time’s up! Final score: ' + score);
      score = 0;
      level = 1;
      updateDisplay();
      startGame();
    }
  }

  function updateDisplay() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
  }

  function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.answer);
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function drop(e) {
    e.preventDefault();
    const droppedAnswer = e.dataTransfer.getData('text/plain');
    const correctAnswer = e.target.dataset.answer;

    const cell = e.target;
    const draggingPiece = document.querySelector(`.answer-piece[data-answer="${droppedAnswer}"]`);

    if (parseInt(droppedAnswer) === parseInt(correctAnswer)) {
      cell.textContent = '';
      cell.classList.add('correct');
      cell.classList.remove('wrong');
      if (draggingPiece) draggingPiece.remove();
      score += 10;
      updateDisplay();

      // --- ADDITION START ---
      // Remove selection highlight if the solved piece was selected
      if (selectedPiece === cell) {
        selectedPiece.style.borderColor = '';
        selectedPiece.style.boxShadow = '';
        selectedPiece = null;
      }
      // --- ADDITION END ---

      setTimeout(() => {
        const solvedPieces = [...puzzleBoard.children].filter(piece => piece.classList.contains('correct'));
        solvedPieces.forEach(piece => {
          piece.classList.add('solved');
        });
      }, 500);

      const unsolved = [...puzzleBoard.children].some(c => c.textContent !== '');
      if (!unsolved) {
        setTimeout(() => {
          if (level < 50) {
            level++;
            startGame();
          } else {
            alert("Congratulations! You've completed all 50 levels!");
            score = 0;
            level = 1;
            triggerConfetti();
            startGame();
          }
        }, 1000);
      }
    } else {
      cell.classList.add('wrong');
      setTimeout(() => {
        cell.classList.remove('wrong');
      }, 1000);
      score -= 5;
      updateDisplay();
    }
  }

  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 }
    });
  }

  startGame();

  // --- SHAKE DETECTION CODE START ---

  let lastX, lastY, lastZ;
  const shakeThreshold = 15; // Adjust sensitivity if needed
  let lastShakeTime = 0;

  window.addEventListener('devicemotion', (event) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;

    if (lastX !== undefined && lastY !== undefined && lastZ !== undefined) {
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
        const now = Date.now();
        if (now - lastShakeTime > 2000) { // 2 seconds cooldown between shakes
          revealHint();
          lastShakeTime = now;
        }
      }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  });

  // --- ADDITION START ---
  function revealHint() {
    if (hintEl.style.display === 'none') {
      if (!selectedPiece) return; // No piece selected, do nothing
      if (selectedPiece.classList.contains('correct')) return; // Already solved

      const answer = selectedPiece.dataset.answer;
      hintText.textContent = answer;
      hintEl.style.display = 'block';

      setTimeout(() => {
        hintEl.style.display = 'none';
      }, 8000);
    }
  }
  // --- ADDITION END ---

  // --- SHAKE DETECTION CODE END ---
};
