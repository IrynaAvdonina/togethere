

const hamburger = document.querySelector(".ham");
const navsub = document.querySelector(".nav-sub");
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle("change")
  navsub.classList.toggle("nav-change")
});

const eventOwnerLink = document.querySelector(".event-owner-a");
const userInfo = document.querySelector(".user-info");
if (eventOwnerLink) {
  eventOwnerLink.addEventListener('click', () => {
    userInfo.classList.toggle("user-info-show");
  });
}





