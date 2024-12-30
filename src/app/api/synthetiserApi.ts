import { API_URL } from '@/config/constants';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    // Appel à votre API Express
    const response = await fetch(`${API_URL}/api`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}