//set the active link in the menu based on the current URL.
function setActiveLink(currentUrl, menuLinks) {
  menuLinks.forEach(function (link) {
    if (link.getAttribute("href") === currentUrl) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {

  // Hamburger menu

  const hamburger = document.querySelector(".ham");
  const navsub = document.querySelector(".nav-sub");

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle("change");
    navsub.classList.toggle("nav-change");
  });

  // Set active links in the menu based on the current URL

  const menuLinks = document.querySelectorAll(".wrapper-nav");
  setActiveLink(window.location.pathname, menuLinks);

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const url = this.getAttribute("href");
      setActiveLink(url, menuLinks);
      window.location.href = url;
    });
  });
});

// Show/hide user information

const eventOwnerLink = document.querySelector(".event-owner-a");
const userInfo = document.querySelector(".user-info");
if (eventOwnerLink) {
  eventOwnerLink.addEventListener('click', () => {
    userInfo.classList.toggle("user-info-show");
  });
}

// Expand/collapse filter

const filterHeader = document.querySelector('.filter-header');
const filterBody = document.querySelector('.filter-body');
filterHeader?.addEventListener('click', function () {
  filterBody.classList.toggle('expanded');
});

