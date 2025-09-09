// api/test-kv.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    // Probar conexión a Vercel KV
    await kv.set('test', 'hello');
    const result = await kv.get('test');
    await kv.del('test');
    
    return new Response(JSON.stringify({ 
      ok: true, 
      message: 'KV connection successful',
      testResult: result,
      env: {
        hasKvUrl: !!process.env.KV_REST_API_URL,
        hasKvToken: !!process.env.KV_REST_API_TOKEN
      }
    }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'KV connection failed', 
      details: error.message,
      env: {
        hasKvUrl: !!process.env.KV_REST_API_URL,
        hasKvToken: !!process.env.KV_REST_API_TOKEN
      }
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
