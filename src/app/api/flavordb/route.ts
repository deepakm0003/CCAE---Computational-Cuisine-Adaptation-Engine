import { NextRequest, NextResponse } from 'next/server';

const FLAVORDB_BASE_URL = 'https://cosylab.iiitd.edu.in/flavordb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'entities';
  const search = searchParams.get('search');
  const limit = searchParams.get('limit') || '20';
  const id = searchParams.get('id');

  try {
    let url = `${FLAVORDB_BASE_URL}/${endpoint}`;
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit);
    
    // Handle entity details
    if (id && endpoint === 'entity_details') {
      url = `${FLAVORDB_BASE_URL}/entity_details/${id}`;
    }
    
    // Handle pairings
    if (id && endpoint === 'pairing') {
      url = `${FLAVORDB_BASE_URL}/pairing/${id}`;
    }

    const queryString = params.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    console.log('[FlavorDB Proxy] Fetching:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CCAE-FlavorDB-Client/1.0'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.log('[FlavorDB Proxy] Error response:', response.status);
      return NextResponse.json(
        { error: `FlavorDB returned ${response.status}` },
        { status: response.status }
      );
    }

    // Try to parse as JSON, but handle HTML responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // FlavorDB might return HTML for some endpoints
      const text = await response.text();
      // Try to extract JSON from the response if possible
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          return NextResponse.json(data);
        }
      } catch {
        // Not JSON
      }
      return NextResponse.json({ 
        connected: true, 
        message: 'FlavorDB accessible',
        raw: text.substring(0, 500) 
      });
    }
  } catch (error: any) {
    console.error('[FlavorDB Proxy] Error:', error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${FLAVORDB_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'text/html,application/json' }
    });
    
    return NextResponse.json({
      connected: response.ok,
      status: response.status,
      message: response.ok ? 'FlavorDB is accessible' : `Status: ${response.status}`
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      message: error.message
    });
  }
}
