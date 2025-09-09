// api/simple-history.js - Versión simplificada para testing
export const config = { runtime: 'edge' };

// Base de datos simple en memoria (debe ser la misma que simple-links.js)
let simpleDb = new Map();

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    const history = Array.from(simpleDb.values());
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(`Simple DB: Returning history with ${history.length} entries`);

    return new Response(JSON.stringify({ ok: true, history }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting history:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
