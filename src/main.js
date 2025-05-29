import './style.css';

(function () {
  const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

  let today = new Date(),
      dd = String(today.getDate()).padStart(2, "0"),
      mm = String(today.getMonth() + 1).padStart(2, "0"),
      yyyy = today.getFullYear(),
      nextYear = yyyy + 1,
      dayMonth = "06/01/",
      birthday = dayMonth + yyyy;
  
  today = mm + "/" + dd + "/" + yyyy;
  if (today > birthday) {
    birthday = dayMonth + nextYear;
  }
  
  const countDown = new Date(birthday).getTime();

  const updateText = (id, value) => {
    const el = document.getElementById(id);
    if (el && el.innerText !== String(value)) {
      el.innerText = value;
    }
  };

  const confettiColors = ['#ff0000', '#cc0000', '#000000', '#330000'];

  function createConfetti() {
    const confettiCount = 150;
    const confetti = [];

    let canvas = document.createElement('canvas');
    canvas.id = "confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 9999;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    function Confetto() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 7 + 4;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      this.speed = Math.random() * 3 + 2;
      this.angle = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    Confetto.prototype.update = function () {
      this.y += this.speed;
      this.angle += this.rotationSpeed;

      if (this.y > canvas.height) {
        this.y = -this.size;
        this.x = Math.random() * canvas.width;
      }
    };

    Confetto.prototype.draw = function () {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
      ctx.restore();
    };

    for (let i = 0; i < confettiCount; i++) {
      confetti.push(new Confetto());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach(c => {
        c.update();
        c.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    setTimeout(() => {
      document.body.removeChild(canvas);
    }, 30000);  // confetti lasts 20 seconds
  }

  const celebrateBtn = document.getElementById("celebrate-btn");

  // Attach click listener once
  celebrateBtn.addEventListener("click", () => {
    createConfetti();
    setTimeout(() => {
      window.location.href = "cake.html";  // Redirect to cake.html after confetti
    }, 1500);
  });

  const x = setInterval(() => {
    const now = new Date().getTime(),
          distance = countDown - now;

    if (distance < 0) {
      document.getElementById("countdown").style.display = "none";

      // Show button when timer hits 0
      celebrateBtn.style.display = "inline-block";

      clearInterval(x);
      return;
    }

    updateText("days", Math.floor(distance / day));
    updateText("hours", Math.floor((distance % day) / hour));
    updateText("minutes", Math.floor((distance % hour) / minute));
    updateText("seconds", Math.floor((distance % minute) / second));

    // Send tick event to cake.html if it's open
    if (window.location.pathname.includes('cake.html')) {
      window.postMessage('timerTick', '*');
    }
  }, 1000);
}());
