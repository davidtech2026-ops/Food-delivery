// Set this to the deployed Express API origin before publishing the frontend.
window.LOCALBITE_API_BASE = "http://localhost:3000";

window.LOCALBITE_API_URL = (pathname) => {
  const base = window.LOCALBITE_API_BASE.replace(/\/+$/, "");
  const route = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${route}`;
};
