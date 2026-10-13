// Recruitment icon bundled as an inline SVG so it works inside an isolated web app.
export const partyBookingIcon = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#194d77"/><stop offset="1" stop-color="#101e40"/></linearGradient></defs>
<rect x="3" y="3" width="58" height="58" rx="12" fill="url(#g)" stroke="#59dcfa" stroke-width="3"/>
<path d="M14 16h36v32H14z" fill="#e9d9ad" stroke="#b68745" stroke-width="2"/>
<path d="M19 22h26M19 27h21" stroke="#946943" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="22" cy="36" r="4" fill="#209bbf"/><circle cx="32" cy="35" r="5" fill="#388bc5"/><circle cx="43" cy="36" r="4" fill="#209bbf"/>
<path d="M15 47c0-6 3-8 7-8s7 2 7 8M25 47c0-8 3-10 7-10s7 2 7 10M36 47c0-6 3-8 7-8s7 2 7 8" fill="#153d6d" stroke="#8deaff" stroke-width="1.5"/>
<path d="M32 7l3.1 6.9L42 17l-6.9 3.1L32 27l-3.1-6.9L22 17l6.9-3.1z" fill="#74f4ff" stroke="#fff5ce" stroke-width="1.5"/>
</svg>`);