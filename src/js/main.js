

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

document.addEventListener("DOMContentLoaded", function () {
  const filterHeader = document.querySelector('.filter-header');
  const filterBody = document.querySelector('.filter-body');
  filterHeader?.addEventListener('click', function () {
    console.log(1)
    filterBody.classList.toggle('expanded');
  });
});






