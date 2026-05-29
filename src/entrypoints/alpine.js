import focus from '@alpinejs/focus';
import collapse from '@alpinejs/collapse';

// Netlify Image CDN helper — transforms on deploy, raw path in local dev
const cdn = (path, params = {}) => {
  if (import.meta.env.DEV) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', ...params });
  return `/.netlify/images?${p}`;
};

// Swap these for real event photos — drop files into public/photos/ and update filenames
const GALLERY_PHOTOS = [
  { file: 'bikes-parked.jpg', caption: 'Bikes lined up at the Yacolt Burn Experience' },
  { file: 'trail-building.jpg', caption: 'Trail building in the Yacolt Burn' },
  { file: 'pnw-forest-misty.jpg', caption: 'Pacific Northwest old-growth forest' },
  { file: 'hood.jpg', caption: 'Southwest Washington mountains' },
  { file: 'stream.jpg', caption: 'Morning light through the forest' },
  { file: 'forest-path.jpg', caption: 'Forest trail, Yacolt Burn State Forest' },
];

export default (Alpine) => {
  Alpine.plugin(focus);
  Alpine.plugin(collapse);

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
      _trigger: null,
      photos,
      openAt(i) {
        this._trigger = document.activeElement;
        this.current = i;
        this.isOpen = true;
      },
      close() {
        this.isOpen = false;
        this.$nextTick(() => this._trigger?.focus());
      },
      prev() {
        this.current = (this.current - 1 + this.photos.length) % this.photos.length;
      },
      next() {
        this.current = (this.current + 1) % this.photos.length;
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
