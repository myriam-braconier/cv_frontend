import { NextResponse } from 'next/server';
import huggingFaceApi  from "@/lib/axios/huggingface";
import { AxiosError } from 'axios';

interface RequestBody {
  prompt: string;
}

interface ApiError extends Error {
 status?: number;
}


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function attemptGeneration(prompt: string, maxRetries = 5) {
  let lastError;
  console.log('Démarrage attemptGeneration avec prompt:', prompt);
 
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentative ${attempt}: envoi requête`);
      const response = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN || 'NON_DÉFINI'}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: prompt + ", high resolution, 4k, high quality, masterpiece",
            parameters: {
              negative_prompt: "blur, low quality, lowres, bad anatomy, bad hands, cropped, worst quality",
              width: 768,
              height: 768,
              num_inference_steps: 30,
              guidance_scale: 7.5
            }
          })
        }
      );
      
      console.log(`Status code: ${response.status}`);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        try {
          const responseData = JSON.parse(responseText);
          if (response.status === 503 && responseData.estimated_time) {
            const waitTime = Math.ceil(responseData.estimated_time * 1000);
            console.log(`Modèle en chargement, attente de ${waitTime/1000}s...`);
            await delay(waitTime);
            continue;
          }
        } catch (e) {
          console.error('Erreur parsing JSON:', e);
        }

        const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
        console.log(`Échec tentative ${attempt}/${maxRetries}, attente: ${waitTime/1000}s`);
       
        if (attempt < maxRetries) {
          await delay(waitTime);
          continue;
        }
        throw new Error(`API error ${response.status}: ${responseText}`);
      }

      return new Response(responseText, {
        status: response.status,
        headers: response.headers
      });
    } catch (error) {
      console.error(`Erreur détaillée tentative ${attempt}:`, error);
      lastError = error;
      if (attempt === maxRetries) break;
     
      const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
      await delay(waitTime);
    }
  }
  throw lastError || new Error('Maximum retry attempts reached');
}

export async function GET() {
  console.log('Début GET request');
  try {
    const response = await attemptGeneration("abstract digital art background, colorful, vibrant, high quality");
    console.log('Réponse reçue GET');
    const imageBuffer = await response.arrayBuffer();
    console.log('Buffer converti');
    const base64String = Buffer.from(imageBuffer).toString('base64');
    return NextResponse.json({ imageUrl: `data:image/jpeg;base64,${base64String}` });
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Erreur GET détaillée:', apiError);
    return NextResponse.json(
      { error: apiError.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
 }

 export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as RequestBody;
    
    const response = await huggingFaceApi.post(
      "/models/runwayml/stable-diffusion-v1-5",
      {
        inputs: prompt,
        parameters: {
          negative_prompt: "blur, low quality, lowres, bad anatomy, bad hands, cropped, worst quality",
          width: 768,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5
        }
      },
      { responseType: 'arraybuffer' }
    );
 
    const base64String = Buffer.from(response.data).toString('base64');
    return NextResponse.json({ 
      imageUrl: `data:image/jpeg;base64,${base64String}` 
    });
    
  } catch (error) {
    const axiosError = error as AxiosError;
    return NextResponse.json(
      { error: axiosError.response?.data || axiosError.message || 'Erreur inconnue' },
      { status: axiosError.response?.status || 500 }
    );
  }
 }
 
 
 
 