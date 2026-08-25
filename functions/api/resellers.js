
// Cloudflare Pages Function: /api/resellers
import defaultResellers from '../../data/resellers.json';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const search = url.searchParams.get('search');

  let list = defaultResellers;

  // If Cloudflare D1 / KV is bound
  if (env && env.RESELLERS_KV) {
    try {
      const stored = await env.RESELLERS_KV.get('resellers', { type: 'json' });
      if (stored && Array.isArray(stored)) {
        list = stored;
      }
    } catch(e) {}
  }

  if (state && state !== 'Semua') {
    list = list.filter(r => r.state.toLowerCase() === state.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.area.toLowerCase().includes(q) || 
      r.state.toLowerCase().includes(q) ||
      (r.postcode && r.postcode.includes(q))
    );
  }

  return new Response(JSON.stringify({ success: true, count: list.length, data: list }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60'
    }
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone || !body.state || !body.area) {
      return new Response(JSON.stringify({ success: false, error: 'Maklumat tidak lengkap.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newReseller = {
      id: Date.now(),
      name: body.name,
      tier: body.tier || 'Ejen Baru',
      phone: body.phone,
      state: body.state,
      area: body.area,
      postcode: body.postcode || '',
      cod_available: !!body.cod_available,
      rating: 5.0,
      ready_stock: body.ready_stock || ["Mandy Kambing", "Kabsah Ayam"]
    };

    return new Response(JSON.stringify({ success: true, message: 'Pendaftaran ejen berjaya dihantar!', data: newReseller }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
