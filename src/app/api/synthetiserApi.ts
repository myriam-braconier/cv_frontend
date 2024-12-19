
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Appel à votre API Express
    const response = await fetch('http://localhost:4000/api', {
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