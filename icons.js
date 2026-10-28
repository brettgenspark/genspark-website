// Original line icons on a 24px grid. Stroke uses shared gradient #gtIconGrad.
(function () {
  const P = {
    presentation: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8.5 20h7"/><path d="M7 12.5l3-3 2.2 2.2L17 7"/>',
    layers: '<path d="M12 3.5l8.5 4.6L12 12.7 3.5 8.1z"/><path d="M3.5 12.2L12 16.8l8.5-4.6"/><path d="M3.5 16.2L12 20.8l8.5-4.6"/>',
    video: '<rect x="2.5" y="6" width="13.5" height="12" rx="2.6"/><path d="M16 10.4l5.2-3v9.2l-5.2-3z"/><circle cx="9.2" cy="12" r="2.6"/>',
    browser: '<rect x="2.5" y="3.5" width="19" height="17" rx="2.6"/><path d="M2.5 8h19"/><path d="M5.6 5.8h.01M7.8 5.8h.01"/><rect x="6" y="11" width="5.2" height="6" rx="1.1"/><path d="M14 11.6h4M14 14h4M14 16.4h2.6"/>',
    terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2.6"/><path d="M6.8 9.2l3 2.8-3 2.8"/><path d="M12.5 15h4.7"/>',
    research: '<circle cx="10.4" cy="10.4" r="6.9"/><path d="M15.4 15.4L21 21"/><path d="M7.6 13v-1.6M10.4 13V8M13.2 13V9.8"/>',
    mail: '<path d="M12.5 18.5H5a2.5 2.5 0 0 1-2.5-2.5V7.5A2.5 2.5 0 0 1 5 5h13a2.5 2.5 0 0 1 2.5 2.5V11"/><path d="M3.2 6.6L11.75 12.4 20 6.6"/><path d="M15 21.2l.7-2.6 4.4-4.4a1.35 1.35 0 0 1 1.9 1.9l-4.4 4.4z"/>',
    mic: '<rect x="9" y="2.8" width="6" height="11" rx="3"/><path d="M5.6 11a6.4 6.4 0 0 0 12.8 0"/><path d="M12 17.4v3.6"/><path d="M2.4 9.2v3.6M21.6 9.2v3.6"/>',
    headphones: '<path d="M3.2 16v-3.4a8.8 8.8 0 0 1 17.6 0V16"/><rect x="2.4" y="14.6" width="4" height="6.2" rx="1.6"/><rect x="17.6" y="14.6" width="4" height="6.2" rx="1.6"/><rect x="9" y="9" width="6" height="8.6" rx="1.2"/><path d="M10.7 11.8h2.6M10.7 14.4h2"/>',
    meeting: '<path d="M4.5 3.8h9A2.5 2.5 0 0 1 16 6.3v5.2a2.5 2.5 0 0 1-2.5 2.5H8.6L5 16.8V14h-.5A2.5 2.5 0 0 1 2 11.5V6.3a2.5 2.5 0 0 1 2.5-2.5z"/><path d="M5.8 7.6h6.4M5.8 10.3h4"/><path d="M19 8.6a2.5 2.5 0 0 1 2.5 2.5v4.6a2.5 2.5 0 0 1-2.5 2.5v2.6l-3.4-2.6h-3.4a2.5 2.5 0 0 1-2-1"/>',
    bolt: '<path d="M10.6 2.5L4 12.8h5.6l-1.1 8.7 6.6-10.3H9.5z"/><circle cx="18" cy="17.6" r="3.9"/><path d="M16.3 17.7l1.2 1.2 2.3-2.4"/>',
    teammate: '<circle cx="8.6" cy="8.4" r="3.4"/><path d="M2.4 20.2a6.2 6.2 0 0 1 12.4 0"/><rect x="14.6" y="4.4" width="7" height="6" rx="2"/><path d="M17 7.4h.01M19.2 7.4h.01"/><path d="M18.1 10.4v2.4"/><path d="M16.2 15.6c1.9.4 3.6 2 4.4 4.6"/>'
  };
  window.GT_ICON = function (name, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" fill="none" stroke="url(#gtIconGrad)" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
})();
