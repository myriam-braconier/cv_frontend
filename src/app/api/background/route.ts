// app/api/background/route.ts
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    console.log('Début de la génération d\'image...'); // Debug

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        },
        body: JSON.stringify({
          inputs: "abstract digital art background, colorful, vibrant, high quality",
        }),
      }
    );

    // Vérifions si la réponse est ok
    if (!response.ok) {
      console.error('Erreur API:', response.status, response.statusText);
      const text = await response.text();
      console.error('Détails:', text);
      throw new Error('Erreur API Hugging Face');
    }

    // La réponse est un buffer d'image
    const imageBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64String}`;

    console.log('Image générée avec succès'); // Debug

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log('Prompt reçu:', prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        },
        body: JSON.stringify({
          inputs: prompt || "abstract digital art background, colorful, vibrant, high quality",
        }),
      }
    );

    if (!response.ok) {
      console.error('Erreur API:', response.status, response.statusText);
      throw new Error('Erreur API Hugging Face');
    }

    const imageBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64String}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
}