// api/history.js
import { getHistory } from './database.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const history = await getHistory();
    console.log('Retrieved history:', history);

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
