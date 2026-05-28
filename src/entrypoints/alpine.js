const base = 'https://images.unsplash.com/';

// Swap Unsplash placeholders for real event photos by updating this array.
// Each entry needs: thumb (square crop URL), full (large URL), caption.
export default (Alpine) => {
  Alpine.data('photoGallery', () => {
    const photos = [
      { id: 'photo-1627044185459-09e6dbc39444', caption: 'Mountain biking the Yacolt Burn trail system' },
      { id: 'photo-1592483335937-a3213ac4a833', caption: 'Trail building in the Yacolt Burn' },
      { id: 'photo-1448375240586-882707db888b', caption: 'Pacific Northwest old-growth forest' },
      { id: 'photo-1506905925346-21bda4d32df4', caption: 'Southwest Washington mountains' },
      { id: 'photo-1518495973542-4542c06a5843', caption: 'Morning light through the forest' },
      { id: 'photo-1441974231531-c6227db76b6e', caption: 'Forest trail, Yacolt Burn State Forest' },
    ].map(p => ({
      thumb:   `${base}${p.id}?auto=format&fit=crop&w=400&h=400&q=75`,
      full:    `${base}${p.id}?auto=format&fit=crop&w=1600&q=85`,
      caption: p.caption,
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
