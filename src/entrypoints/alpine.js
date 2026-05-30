import focus from '@alpinejs/focus';
import collapse from '@alpinejs/collapse';

// Netlify Image CDN helper — transforms on deploy, raw path in local dev
const cdn = (path, params = {}) => {
  if (import.meta.env.DEV) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', ...params });
  return `/.netlify/images?${p}`;
};

// Real YBE event photos — drop files into public/photos/ and add entries here
const GALLERY_PHOTOS = [
  { file: 'poster.jpg', caption: 'Yacolt Burn Experience 2026' },
  { file: 'john-bridge.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'shane-dawg.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'yacolt-bench.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'todd-crew.png', caption: 'Yacolt Burn Experience' },
  { file: 'bike-stand.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'jeep.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'bike-table.jpeg', caption: 'Yacolt Burn Experience' },
  { file: 'ybe-tents.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'ybe-rain.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'ybe-mud.jpg', caption: 'Yacolt Burn Experience' },
  { file: 'ybe-shred-mud.jpg', caption: 'Yacolt Burn Experience' },
];

export default (Alpine) => {
  Alpine.plugin(focus);
  Alpine.plugin(collapse);

  Alpine.store('ui', { galleryOpen: false });

  // Post-event state — driven by data-event-start on <body>
  const eventStart = document.body.dataset.eventStart;
  Alpine.store('ybe', { isPast: eventStart ? new Date() >= new Date(eventStart) : false });

  // Remaining seats counter — animates from capacity down to remaining
  // Starts only when the element crosses the viewport midpoint
  Alpine.data('seatsLeft', (capacity, registered) => ({
    displayed: capacity,
    init() {
      const end = capacity - registered;
      const duration = 2800;

      const run = () => {
        const startTime = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          this.displayed = Math.round(capacity - (capacity - end) * eased);
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
    shared: false,
    share() {
      const url = window.location.href;
      const text = 'A full-day MTB shuttle event in the Yacolt Burn State Forest. Check it out!';
      if (navigator.share) {
        navigator.share({ title: document.title, text, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        this.shared = true;
        setTimeout(() => {
          this.shared = false;
        }, 2000);
      }
    },
  }));

  // Photo gallery with focus management
  Alpine.data('photoGallery', () => {
    const photos = GALLERY_PHOTOS.map(({ file, caption }) => ({
      thumb: cdn(`/photos/${file}`, { w: '400', h: '400', fit: 'cover', q: '75' }),
      full: cdn(`/photos/${file}`, { w: '1600', q: '85' }),
      caption,
    }));

    return {
      isOpen: false,
      current: 0,
      loading: false,
      _trigger: null,
      photos,
      openAt(i) {
        this._trigger = document.activeElement;
        this.current = i;
        this.loading = true;
        this.isOpen = true;
        this.$store.ui.galleryOpen = true;
        this.$nextTick(() => {
          if (this.$refs.fullImg?.complete) this.loading = false;
        });
      },
      close() {
        this.isOpen = false;
        this.$store.ui.galleryOpen = false;
        this.$nextTick(() => this._trigger?.focus());
      },
      prev() {
        this.loading = true;
        this.current = (this.current - 1 + this.photos.length) % this.photos.length;
        this.$nextTick(() => {
          if (this.$refs.fullImg?.complete) this.loading = false;
        });
      },
      next() {
        this.loading = true;
        this.current = (this.current + 1) % this.photos.length;
        this.$nextTick(() => {
          if (this.$refs.fullImg?.complete) this.loading = false;
        });
      },
      onImageLoad() {
        this.loading = false;
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
