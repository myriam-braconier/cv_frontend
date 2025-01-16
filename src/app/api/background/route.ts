// app/api/background/route.ts
import { NextResponse } from 'next/server';
import huggingFaceApi from '@/lib/axios/huggingface';
import { AxiosError } from 'axios';

interface RequestBody {
  prompt: string;
}

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
    const { prompt }: RequestBody = await request.json();

    const response = await huggingFaceApi.post(
      '/models/runwayml/stable-diffusion-v1-5',
      {
        inputs: prompt || "abstract digital art background, colorful"
      },
      {
        responseType: 'arraybuffer'
      }
    );

    const base64String = Buffer.from(response.data).toString('base64');

    return NextResponse.json({
      imageUrl: `data:image/jpeg;base64,${base64String}`
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Generation error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    return NextResponse.json({
      error: 'Failed to generate image',
      details: axiosError.message
    }, { status: 500 });
  }
}