(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    var nav = document.querySelector('.c-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var navList = document.querySelector('.c-nav__list');
    var navLinks = document.querySelectorAll('.c-nav__link');

    if (!nav || !toggle || !navList) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      nav.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
      trapFocus();
    }

    function closeMenu() {
      isOpen = false;
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function trapFocus() {
      if (!isOpen) return;
      var focusableElements = navList.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length === 0) return;
      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      function handleTabKey(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      navList.addEventListener('keydown', handleTabKey);
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (isOpen) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    var pathname = window.location.pathname;
    var isHomepage = pathname === '/' || pathname.endsWith('/index.html');

    var links = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href');

      if (href === '#' || href === '#!') continue;

      if (!isHomepage && href.indexOf('/') === -1) {
        link.setAttribute('href', '/' + href);
      }

      link.addEventListener('click', function(e) {
        var targetHref = this.getAttribute('href');
        var hash = targetHref.indexOf('#') !== -1 ? targetHref.substring(targetHref.indexOf('#')) : '';

        if (hash && hash !== '#' && hash !== '#!') {
          var currentPath = window.location.pathname;
          var linkPath = targetHref.substring(0, targetHref.indexOf('#'));

          if (!linkPath || linkPath === currentPath || (linkPath === '/' && (currentPath === '/' || currentPath.endsWith('/index.html')))) {
            e.preventDefault();
            var targetId = hash.substring(1);
            var targetElement = document.getElementById(targetId);

            if (targetElement) {
              var header = document.querySelector('.l-header');
              var headerHeight = header ? header.offsetHeight : 80;
              var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });

              history.pushState(null, '', hash);
            }
          }
        }
      });
    }
  }

  function initScrollSpy() {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      var scrollPosition = window.pageYOffset;
      var header = document.querySelector('.l-header');
      var headerHeight = header ? header.offsetHeight : 80;

      sections.forEach(function(section) {
        var sectionTop = section.offsetTop - headerHeight - 100;
        var sectionBottom = sectionTop + section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          navLinks.forEach(function(link) {
            link.classList.remove('active');
            var linkHref = link.getAttribute('href');
            if (linkHref === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler);
    updateActiveLink();
  }

  function initActiveMenu() {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    var pathname = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkHref = link.getAttribute('href');

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (linkHref === pathname || (pathname === '/' && linkHref === '/index.html') || (pathname.endsWith('/index.html') && linkHref === '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else if (linkHref !== '/' && linkHref !== '/index.html' && pathname.indexOf(linkHref) === 0) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');
      if (!isCritical && !img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        var isLogo = this.classList.contains('c-logo__img');
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#e9ecef" width="400" height="300"/><text x="50%" y="50%" fill="#6c757d" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">Bild nicht verfügbar</text></svg>';
        this.src = 'data:image/svg+xml;base64,' + btoa(svg);
        this.alt = 'Bild nicht verfügbar';
      });
    }
  }

  function initFormValidation() {
    if (app.formValidationInitialized) return;
    app.formValidationInitialized = true;

    var form = document.getElementById('contactForm');
    if (!form) return;

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
    var namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;

    function validateField(field) {
      var value = field.value.trim();
      var fieldId = field.id;
      var isValid = true;
      var errorMessage = '';

      if (fieldId === 'firstName' || fieldId === 'lastName') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Dieses Feld ist erforderlich.';
        } else if (!namePattern.test(value)) {
          isValid = false;
          errorMessage = 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen).';
        }
      }

      if (fieldId === 'email') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
        } else if (!emailPattern.test(value)) {
          isValid = false;
          errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        }
      }

      if (fieldId === 'phone' && value !== '') {
        if (!phonePattern.test(value)) {
          isValid = false;
          errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).';
        }
      }

      if (fieldId === 'message') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Bitte geben Sie eine Nachricht ein.';
        } else if (value.length < 10) {
          isValid = false;
          errorMessage = 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
        }
      }

      if (fieldId === 'privacyConsent') {
        if (!field.checked) {
          isValid = false;
          errorMessage = 'Sie müssen der Datenschutzerklärung zustimmen.';
        }
      }

      var feedback = field.parentElement.querySelector('.invalid-feedback');
      if (!feedback && field.type === 'checkbox') {
        feedback = field.parentElement.parentElement.querySelector('.invalid-feedback');
      }

      if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        if (feedback) feedback.textContent = '';
      } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        if (feedback) {
          feedback.textContent = errorMessage;
        } else {
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = errorMessage;
          if (field.type === 'checkbox') {
            field.parentElement.parentElement.appendChild(feedback);
          } else {
            field.parentElement.appendChild(feedback);
          }
        }
      }

      return isValid;
    }

    var fields = form.querySelectorAll('input, textarea');
    for (var i = 0; i < fields.length; i++) {
      fields[i].addEventListener('blur', function() {
        validateField(this);
      });

      fields[i].addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          validateField(this);
        }
      });
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var allValid = true;
      var fieldsToValidate = form.querySelectorAll('input, textarea');

      for (var i = 0; i < fieldsToValidate.length; i++) {
        if (!validateField(fieldsToValidate[i])) {
          allValid = false;
        }
      }

      if (!allValid) {
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
      }

      setTimeout(function() {
        window.location.href = 'thank_you.html';
      }, 1000);
    });
  }

  function initScrollToTop() {
    if (app.scrollToTopInitialized) return;
    app.scrollToTopInitialized = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.className = 'c-scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.innerHTML = '↑';
    document.body.appendChild(scrollBtn);

    function toggleScrollBtn() {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('is-visible');
      } else {
        scrollBtn.classList.remove('is-visible');
      }
    }

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    var scrollHandler = throttle(toggleScrollBtn, 100);
    window.addEventListener('scroll', scrollHandler);
    toggleScrollBtn();

    var style = document.createElement('style');
    style.textContent = '.c-scroll-to-top{position:fixed;bottom:var(--space-xl);right:var(--space-xl);width:56px;height:56px;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));color:var(--color-white);border:none;border-radius:var(--border-radius-full);font-size:24px;cursor:pointer;box-shadow:var(--shadow-lg);opacity:0;visibility:hidden;transition:all var(--transition-base);z-index:var(--z-tooltip);}.c-scroll-to-top.is-visible{opacity:1;visibility:visible;}.c-scroll-to-top:hover{transform:translateY(-4px);box-shadow:var(--shadow-xl);}@media (max-width:768px){.c-scroll-to-top{bottom:var(--space-lg);right:var(--space-lg);width:48px;height:48px;font-size:20px;}}';
    document.head.appendChild(style);
  }

  function initCountUp() {
    if (app.countUpInitialized) return;
    app.countUpInitialized = true;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    function animateCounter(element) {
      var target = parseInt(element.getAttribute('data-count'), 10);
      var duration = parseInt(element.getAttribute('data-duration'), 10) || 2000;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = timestamp - startTime;
        var percentage = Math.min(progress / duration, 1);
        var current = Math.floor(percentage * target);

        element.textContent = current.toLocaleString('de-DE');

        if (percentage < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = target.toLocaleString('de-DE');
        }
      }

      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  function initNotifications() {
    app.notify = function(message, type) {
      type = type || 'info';
      var container = document.getElementById('toast-container');

      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);

        var style = document.createElement('style');
        style.textContent = '#toast-container{position:fixed;top:calc(var(--header-h) + var(--space-md));right:var(--space-xl);z-index:calc(var(--z-modal) + 100);max-width:400px;}#toast-container .alert{margin-bottom:var(--space-md);box-shadow:var(--shadow-xl);animation:slideIn 0.3s ease-out;}@keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}@media (max-width:768px){#toast-container{right:var(--space-md);left:var(--space-md);max-width:none;}}';
        document.head.appendChild(style);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + type + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button>';
      container.appendChild(toast);

      var closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          toast.classList.remove('show');
          setTimeout(function() {
            if (toast.parentElement) {
              container.removeChild(toast);
            }
          }, 150);
        });
      }

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentElement) {
            container.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };
  }

  app.init = function() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initFormValidation();
    initScrollToTop();
    initCountUp();
    initNotifications();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();