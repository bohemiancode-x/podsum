import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.LISTENNOTES_API_KEY;
  
  return NextResponse.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString(),
    message: apiKey ? 'API is configured and ready' : 'API key not found'
  });
}
