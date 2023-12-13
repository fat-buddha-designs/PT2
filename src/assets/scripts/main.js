/*-- Focus Visible Polyfill --*/
import 'focus-visible';

/*-- Dark Mode Switcher --*/
var themeSwitcher = document.querySelector('.theme--switcher input');
var currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'light') {
    themeSwitcher.checked = true;
  }
}
function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
}
themeSwitcher.addEventListener('change', switchTheme, false);

/*-- Navigation --*/
document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll('.navbar-burger'),
    0
  );
  $navbarBurgers.forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      const $target = document.getElementById(target);
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });
});

const thumbnail = document.querySelectorAll('.thumbnail');

thumbnail.forEach(function(thumb){
    thumb.addEventListener("click", changeImage);
});

