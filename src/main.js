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

  const showAgeButtons = () => {
    document.getElementById("countdown").style.display = "none";
    const ageButtons = document.getElementById("age-buttons");
    if (ageButtons) {
      ageButtons.style.display = "flex";

      document.getElementById("age-22-btn").addEventListener("click", () => {
        window.location.href = "./cake.html";
      });

      document.getElementById("age-23-btn").addEventListener("click", () => {
        window.location.href = "./23yrold.html";
      });
    }
  };

  const hideAgeButtons = () => {
    document.getElementById("countdown").style.display = "flex";
    const ageButtons = document.getElementById("age-buttons");
    if (ageButtons) {
      ageButtons.style.display = "none";
    }
  };

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const isJuneFirst = currentMonth === 6 && currentDay === 1;

  if (isJuneFirst) {
    showAgeButtons();
  } else {
    hideAgeButtons();
  }

  const x = setInterval(() => {
    const now = new Date().getTime(),
          distance = countDown - now;

    if (distance < 0) {
      clearInterval(x);
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1;
      if (todayMonth === 6 && todayDay === 1) {
        showAgeButtons();
      } else {
        hideAgeButtons();
      }
      return;
    }

    updateText("days", Math.floor(distance / day));
    updateText("hours", Math.floor((distance % day) / hour));
    updateText("minutes", Math.floor((distance % hour) / minute));
    updateText("seconds", Math.floor((distance % minute) / second));
  }, 1000);
}());

