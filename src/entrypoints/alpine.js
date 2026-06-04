import focus from '@alpinejs/focus';

import { cdn } from '../lib/utils/cdn';

// Gallery photos — source of truth lives in src/data/gallery.ts (shared with Astro build)
import { GALLERY_PHOTOS } from '../data/gallery.ts';

export default (Alpine) => {
  Alpine.plugin(focus);

  Alpine.store('ui', { galleryOpen: false });

  // Post-event state — driven by data-event-end on <body>
  // Uses isoEnd (4 PM day-of) so the site stays active all day during the event
  const eventEnd = document.body.dataset.eventEnd;
  Alpine.store('ybe', { isPast: eventEnd ? new Date() > new Date(eventEnd) : false });

  // Remaining seats counter — animates from capacity down to remaining
  // Starts only when the element crosses the viewport midpoint
  Alpine.data('seatsLeft', (capacity, registered) => ({
    displayed: capacity,
    init() {
      const end = capacity - registered;
      const duration = 2800;
      const progressEl = this.$el.querySelector('[data-slot=progress]');

      const run = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.displayed = end;
          if (progressEl) progressEl.dataset.value = registered;
          return;
        }
        const startTime = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          this.displayed = Math.round(capacity - (capacity - end) * eased);
          if (progressEl) progressEl.dataset.value = Math.round(registered * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            run();
          }
        },
        { rootMargin: '0px 0px -50% 0px' }
      );
      observer.observe(this.$el);
    },
  }));

  // Share button — Web Share API on mobile, clipboard fallback on desktop
  Alpine.data('shareBtn', () => ({
    share() {
      const url = window.location.href;
      const text = 'A full-day MTB shuttle event in the Yacolt Burn State Forest. Check it out!';
      if (navigator.share) {
        navigator.share({ title: document.title, text, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
      }
    },
  }));

  // Photo gallery — thumbnail grid state + modal open/close
  // Slide navigation inside the modal is handled by Embla (Starwind Carousel)
  Alpine.data('photoGallery', () => {
    const photos = GALLERY_PHOTOS.map(({ file, caption }) => ({
      thumb: cdn(`/photos/${file}`, { w: '400', h: '400', fit: 'cover', q: '75' }),
      caption,
    }));

    return {
      isOpen: false,
      _trigger: null,
      photos,
      openAt(i) {
        this._trigger = document.activeElement;
        this.isOpen = true;
        this.$store.ui.galleryOpen = true;
        // Lazy-loads Embla on first open, then jumps to the clicked slide.
        this.$nextTick(() =>
          window.dispatchEvent(new CustomEvent('gallery:open', { detail: { index: i } }))
        );
      },
      close() {
        this.isOpen = false;
        this.$store.ui.galleryOpen = false;
        this.$nextTick(() => this._trigger?.focus());
      },
    };
  });

  // Countdown to event
  Alpine.data('countdown', (targetDate) => {
    const target = new Date(targetDate);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      ticking: false,
      _interval: null,
      init() {
        const tick = () => {
          const diff = target - new Date();
          if (diff <= 0) {
            this.days = this.hours = this.minutes = 0;
            return;
          }
          this.days = Math.floor(diff / 86400000);
          this.hours = Math.floor((diff % 86400000) / 3600000);
          this.minutes = Math.floor((diff % 3600000) / 60000);
          this.ticking = true;
          setTimeout(() => {
            this.ticking = false;
          }, 350);
        };
        tick();
        this._interval = setInterval(tick, 30000);
      },
      destroy() {
        clearInterval(this._interval);
      },
    };
  });
};
