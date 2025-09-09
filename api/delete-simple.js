// api/delete-simple.js - Eliminar enlaces simplificado
export const config = { runtime: 'edge' };

// Base de datos simple
let simpleDb = new Map();

export default async function handler(req) {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];

  console.log('Delete simple handler called with slug:', slug);

  try {
    // Eliminar directamente de ultra-simple-v2 usando DELETE
    const deleteResponse = await fetch(`${new URL(req.url).origin}/api/ultra-simple-v2/${slug}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      return new Response(JSON.stringify({ error: errorData.error || 'Could not delete link' }), {
        status: deleteResponse.status,
        headers: { 'content-type': 'application/json' }
      });
    }

    const deleteData = await deleteResponse.json();
    console.log('Deleted link:', slug);

    return new Response(JSON.stringify({ 
      ok: true, 
      message: 'Link deleted successfully' 
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in delete simple handler:', error);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
