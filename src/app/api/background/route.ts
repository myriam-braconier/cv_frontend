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


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function attemptGeneration(prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await huggingFaceApi.post(
        '/models/CompVis/stable-diffusion-v1-4',
        {
          inputs: prompt || "abstract digital art background, colorful",
          parameters: {
            num_inference_steps: 50,
            guidance_scale: 7.5,
            negative_prompt: "blurry, bad quality, low resolution",         }
        },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'image/png'
          }
        }
      );

      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 503 && attempt < maxRetries) {
        console.log(`Tentative ${attempt} échouée, nouvelle tentative dans ${attempt * 2} secondes...`);
        await delay(attempt * 2000); // Attente croissante entre les tentatives
        continue;
      }
      throw error;
    }
  }
  throw new Error('Maximum retry attempts reached');
}


export async function POST(request: Request) {
  try {
    const { prompt }: RequestBody = await request.json();
    console.log('Tentative de génération pour le prompt:', prompt);

    const response = await attemptGeneration(prompt);
    const base64String = Buffer.from(response.data).toString('base64');
    
    return NextResponse.json({ 
      imageUrl: `data:image/jpeg;base64,${base64String}`,
      success: true
    });

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur finale:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText
    });

    return NextResponse.json({
      error: axiosError.response?.status === 503 ? 
        "Le service est temporairement indisponible, veuillez réessayer plus tard" :
        "Erreur lors de la génération de l'image",
      details: axiosError.message
    }, { 
      status: axiosError.response?.status || 500 
    });
  }
}