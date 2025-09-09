// api/favicon.js - Servir favicon
export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Favicon simple en formato SVG
  const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" fill="#667eea"/>
  <path d="M8 12h16v2H8zm0 4h16v2H8zm0 4h12v2H8z" fill="white"/>
</svg>`;

  return new Response(faviconSvg, {
    headers: {
      'content-type': 'image/svg+xml',
      'cache-control': 'public, max-age=31536000'
    }
  });
}
