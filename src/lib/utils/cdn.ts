const IS_DEV = import.meta.env.DEV;

export const cdn = (path: string, params: Record<string, string> = {}): string => {
  if (IS_DEV) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', ...params });
  return `/.netlify/images?${p}`;
};
