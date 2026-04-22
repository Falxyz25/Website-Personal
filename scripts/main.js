$(document).ready(function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  AOS.init({
    duration: 900,
    easing: "ease-out-cubic",
    once: true,
    offset: 40
  });

  var $year = $("#current-year");
  if ($year.length) {
    $year.text(new Date().getFullYear());
  }

  $('a.smooth-scroll').on("click", function (event) {
    var targetId = this.hash;

    if (!targetId) {
      return;
    }

    if (
      location.pathname.replace(/^\//, "") === this.pathname.replace(/^\//, "") &&
      location.hostname === this.hostname
    ) {
      var $target = $(targetId);

      if ($target.length) {
        event.preventDefault();

        $("html, body").animate(
          {
            scrollTop: $target.offset().top - 74
          },
          700
        );

        $(".navbar-collapse").collapse("hide");
      }
    }
  });

  var sectionIds = ["#about", "#skills", "#work", "#experience", "#contact"];
  var $navLinks = $(".navbar .nav-link");
  var $animatedMeters = $(".skill-bar span");
  var $statNumbers = $(".stat-number");
  var cardSelector = ".project-card, .value-card, .timeline-card, .education-card, .spotlight-card, .approach-card, .stat-card, .hero-card";

  function animateHeroIntro() {
    if (prefersReducedMotion) {
      $("body").addClass("intro-ready");
      return;
    }

    window.requestAnimationFrame(function () {
      $("body").addClass("intro-ready");
    });
  }

  function animateSkillBars() {
    $animatedMeters.each(function () {
      var meter = this;
      var targetWidth = meter.getAttribute("style");

      if (!targetWidth) {
        return;
      }

      meter.dataset.width = targetWidth.replace("width:", "").replace(";", "").trim();
      meter.style.width = prefersReducedMotion ? meter.dataset.width : "0";
    });

    if (prefersReducedMotion || !$animatedMeters.length || !("IntersectionObserver" in window)) {
      $animatedMeters.each(function () {
        this.style.width = this.dataset.width || this.style.width;
      });
      return;
    }

    var skillObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        $(entry.target)
          .find(".skill-bar span")
          .each(function (index) {
            var meter = this;
            window.setTimeout(function () {
              meter.style.width = meter.dataset.width;
            }, index * 120);
          });

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    $(".skill-panel").each(function () {
      skillObserver.observe(this);
    });
  }

  function animateStatNumbers() {
    if (!$statNumbers.length) {
      return;
    }

    function runCounter(element) {
      var rawValue = $(element).text().trim();
      var numericValue = parseInt(rawValue.replace(/\D/g, ""), 10);
      var suffix = rawValue.replace(/[0-9]/g, "");

      if (!numericValue) {
        return;
      }

      if (prefersReducedMotion) {
        element.textContent = numericValue + suffix;
        return;
      }

      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) {
          startTime = timestamp;
        }

        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var currentValue = Math.floor(eased * numericValue);

        element.textContent = currentValue + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = numericValue + suffix;
        }
      }

      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      $statNumbers.each(function () {
        runCounter(this);
      });
      return;
    }

    var statsObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        runCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.8 });

    $statNumbers.each(function () {
      statsObserver.observe(this);
    });
  }

  function setActiveNav() {
    var scrollPosition = $(window).scrollTop() + 120;

    sectionIds.forEach(function (id) {
      var $section = $(id);
      if (!$section.length) {
        return;
      }

      var sectionTop = $section.offset().top;
      var sectionBottom = sectionTop + $section.outerHeight();
      var $link = $('.navbar .nav-link[href="' + id + '"]');

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        $navLinks.removeClass("active");
        $navLinks.removeAttr("aria-current");
        $link.addClass("active");
        $link.attr("aria-current", "page");
      }
    });
  }

  function initCertificateLightbox() {
    var $lightbox = $("#certificate-lightbox");
    var $lightboxImage = $("#certificate-lightbox-image");
    var $closeButton = $("#certificate-lightbox-close");
    var previousOverflow = "";

    if (!$lightbox.length || !$lightboxImage.length) {
      return;
    }

    function openLightbox(imageSrc, imageAlt) {
      previousOverflow = document.body.style.overflow;
      $lightboxImage.attr("src", imageSrc);
      $lightboxImage.attr("alt", imageAlt || "Pratinjau sertifikat");
      $lightbox.addClass("is-open");
      $lightbox.attr("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      if ($closeButton.length) {
        $closeButton.trigger("focus");
      }
    }

    function closeLightbox() {
      $lightbox.removeClass("is-open");
      $lightbox.attr("aria-hidden", "true");
      $lightboxImage.attr("src", "");
      document.body.style.overflow = previousOverflow;
    }

    $(".certificate-trigger").on("click", function () {
      openLightbox(
        this.getAttribute("data-certificate-src"),
        this.getAttribute("data-certificate-alt")
      );
    });

    $lightbox.on("click", "[data-close-certificate='true']", function () {
      closeLightbox();
    });

    $closeButton.on("click", function () {
      closeLightbox();
    });

    $(document).on("keydown", function (event) {
      if (event.key === "Escape" && $lightbox.hasClass("is-open")) {
        closeLightbox();
      }
    });
  }

  function initTimelineSliders() {
    $(".timeline-gallery").each(function (galleryIndex) {
      var gallery = this;
      var slides = Array.prototype.slice.call(gallery.querySelectorAll(".certificate-trigger"));

      if (gallery.classList.contains("timeline-gallery-single") || slides.length <= 1) {
        return;
      }

      var controls = document.createElement("div");
      controls.className = "timeline-slider-controls";

      var arrows = document.createElement("div");
      arrows.className = "timeline-slider-arrows";

      var prevButton = document.createElement("button");
      prevButton.type = "button";
      prevButton.className = "timeline-slider-arrow";
      prevButton.setAttribute("aria-label", "Slide sebelumnya");
      prevButton.innerHTML = "&#8592;";

      var nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "timeline-slider-arrow";
      nextButton.setAttribute("aria-label", "Slide berikutnya");
      nextButton.innerHTML = "&#8594;";

      var dots = document.createElement("div");
      dots.className = "timeline-slider-dots";

      var dotButtons = slides.map(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "timeline-slider-dot";
        dot.setAttribute("aria-label", "Pergi ke slide " + (index + 1));
        dot.setAttribute("data-slide-index", index);
        dots.appendChild(dot);
        return dot;
      });

      arrows.appendChild(prevButton);
      arrows.appendChild(nextButton);
      controls.appendChild(dots);
      controls.appendChild(arrows);
      gallery.insertAdjacentElement("afterend", controls);

      function scrollToSlide(index) {
        var target = slides[index];

        if (!target) {
          return;
        }

        gallery.scrollTo({
          left: target.offsetLeft,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
      }

      function getActiveIndex() {
        var currentIndex = 0;
        var galleryLeft = gallery.scrollLeft;

        slides.forEach(function (slide, index) {
          if (Math.abs(slide.offsetLeft - galleryLeft) < Math.abs(slides[currentIndex].offsetLeft - galleryLeft)) {
            currentIndex = index;
          }
        });

        return currentIndex;
      }

      function updateControls() {
        var activeIndex = getActiveIndex();

        dotButtons.forEach(function (dot, index) {
          dot.classList.toggle("is-active", index === activeIndex);
          dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
        });

        prevButton.disabled = activeIndex === 0;
        nextButton.disabled = activeIndex === slides.length - 1;
      }

      prevButton.addEventListener("click", function () {
        scrollToSlide(Math.max(0, getActiveIndex() - 1));
      });

      nextButton.addEventListener("click", function () {
        scrollToSlide(Math.min(slides.length - 1, getActiveIndex() + 1));
      });

      dotButtons.forEach(function (dot) {
        dot.addEventListener("click", function () {
          scrollToSlide(parseInt(dot.getAttribute("data-slide-index"), 10));
        });
      });

      gallery.addEventListener("scroll", function () {
        window.requestAnimationFrame(updateControls);
      });

      window.addEventListener("resize", updateControls);
      updateControls();
    });
  }

  animateHeroIntro();
  animateSkillBars();
  animateStatNumbers();
  initCertificateLightbox();
  initTimelineSliders();
  setActiveNav();
  $(window).on("scroll", setActiveNav);
});
