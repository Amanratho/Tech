export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('rv-alert', { detail: { type: 'success', message: msg } })),
  error: (msg) => window.dispatchEvent(new CustomEvent('rv-alert', { detail: { type: 'danger', message: msg } })),
  info: (msg) => window.dispatchEvent(new CustomEvent('rv-alert', { detail: { type: 'info', message: msg } })),
  warning: (msg) => window.dispatchEvent(new CustomEvent('rv-alert', { detail: { type: 'warning', message: msg } })),
  // default toast fallback
  show: (msg) => window.dispatchEvent(new CustomEvent('rv-alert', { detail: { type: 'info', message: msg } }))
};

// Also export default to support `import toast from ...` if needed
export default toast;
