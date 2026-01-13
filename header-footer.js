(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var nav = header.querySelector('.dr-nav');
  if (!nav) return;

  var toggle = nav.querySelector('.dr-nav-toggle');
  var menu = nav.querySelector('.dr-nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('dr-nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();
