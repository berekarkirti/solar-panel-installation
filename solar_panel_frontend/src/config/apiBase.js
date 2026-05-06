/**
 * Single source for API origin. Ensures /api/v1 so fetch() URLs match backend mounts.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  let base = String(raw).trim().replace(/\/+$/, '');
  if (!/\/api\/v\d+$/i.test(base)) {
    base = `${base}/api/v1`;
  }
  return base;
}
