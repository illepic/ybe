// Netlify Image CDN helper — transforms on deploy, raw path in local dev
const cdn = (path, params = {}) => {
  if (import.meta.env.DEV) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', ...params });
  return `/.netlify/images?${p}`;
};

// Replace these with real event photos by updating the filenames.
// Drop new images into public/photos/ and update the list below.
const GALLERY_PHOTOS = [
  { file: 'mtb-trail-forest.jpg',   caption: 'Mountain biking the Yacolt Burn trail system' },
  { file: 'trail-building.jpg',      caption: 'Trail building in the Yacolt Burn' },
  { file: 'pnw-forest-misty.jpg',   caption: 'Pacific Northwest old-growth forest' },
  { file: 'mountain-landscape.jpg', caption: 'Southwest Washington mountains' },
  { file: 'forest-light.jpg',       caption: 'Morning light through the forest' },
  { file: 'forest-path.jpg',        caption: 'Forest trail, Yacolt Burn State Forest' },
];

export default (Alpine) => {
  Alpine.data('photoGallery', () => {
    const photos = GALLERY_PHOTOS.map(({ file, caption }) => ({
      thumb: cdn(`/photos/${file}`, { w: '400', h: '400', fit: 'cover', q: '75' }),
      full:  cdn(`/photos/${file}`, { w: '1600', q: '85' }),
      caption,
    }));

    return {
      isOpen: false,
      current: 0,
      photos,
      openAt(i) { this.current = i; this.isOpen = true; },
      prev() { this.current = (this.current - 1 + this.photos.length) % this.photos.length; },
      next() { this.current = (this.current + 1) % this.photos.length; },
    };
  });
};
