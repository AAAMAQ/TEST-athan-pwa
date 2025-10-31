// Add this near the bottom of src/main.tsx (or wherever your app bootstraps)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = (import.meta.env.BASE_URL || '/') + 'service-worker.js';
    navigator.serviceWorker.register(swUrl).catch(console.error);
  });
}