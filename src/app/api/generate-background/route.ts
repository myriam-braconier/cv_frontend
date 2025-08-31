import { NextResponse } from 'next/server';

interface RequestBody {
  prompt: string;
  style?: string;
  num_images?: number;
}

interface ApiError extends Error {
  status?: number;
}

interface FreepikResponse {
  data: Array<{
    base64: string;
    seed: number;
  }>;
  meta: {
    api_key: {
      api_key_id: string;
      api_key_name: string;
    };
    request_id: string;
    response_id: string;
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function attemptGeneration(prompt: string, style: string = "photographic", numImages: number = 1, maxRetries = 5) {
  let lastError;
  console.log('Démarrage attemptGeneration avec prompt:', prompt);
 
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentative ${attempt}: envoi requête à Freepik`);
      const response = await fetch(
        "https://api.freepik.com/v1/ai/text-to-image",
        {
          method: "POST",
          headers: {
            "x-freepik-api-key": process.env.FREEPIK_API_KEY || 'NON_DÉFINI',
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            prompt: prompt,
            style: style,
            num_images: numImages,
            image: {
              size: "landscape_16_9" // Options: square_1_1, landscape_4_3, landscape_16_9, portrait_3_4, portrait_9_16
            }
          })
        }
      );
      
      console.log(`Status code: ${response.status}`);
      const responseText = await response.text();
      console.log('Response body preview:', responseText.substring(0, 200));

      if (!response.ok) {
        let errorMessage = `API error ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || responseText;
          
          // Gestion spécifique des erreurs Freepik
          if (response.status === 429) {
            console.log('Rate limit atteint, attente...');
            const waitTime = Math.min(Math.pow(2, attempt) * 1000, 30000);
            if (attempt < maxRetries) {
              await delay(waitTime);
              continue;
            }
          }
          
          if (response.status === 402) {
            throw new Error('Quota API dépassé - vérifiez votre abonnement Freepik');
          }
          
        } catch (parseError) {
          console.error('Erreur parsing JSON:', parseError);
        }

        const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
        console.log(`Échec tentative ${attempt}/${maxRetries}, attente: ${waitTime/1000}s`);
       
        if (attempt < maxRetries && response.status >= 500) {
          await delay(waitTime);
          continue;
        }
        throw new Error(errorMessage);
      }

      // Retourner la réponse JSON parsée
      const data = JSON.parse(responseText) as FreepikResponse;
      return data;
      
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
  console.log('Début GET request pour Freepik');
  try {
    const response = await attemptGeneration(
      "abstract digital art background, colorful, vibrant, high quality", 
      "digital-art", 
      1
    );
    
    console.log('Réponse reçue de Freepik');
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Aucune image générée');
    }
    
    // Freepik retourne déjà les images en base64
    const base64Image = response.data[0].base64;
    
    return NextResponse.json({ 
      imageUrl: `data:image/png;base64,${base64Image}`,
      seed: response.data[0].seed,
      request_id: response.meta.request_id
    });
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Erreur GET détaillée:', apiError);
    return NextResponse.json(
      { error: apiError.message || 'Erreur inconnue' },
      { status: apiError.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, style = "photographic", num_images = 1 } = (await request.json()) as RequestBody;
    
    console.log('POST request reçue:', { prompt, style, num_images });
    
    const response = await attemptGeneration(prompt, style, num_images);
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Aucune image générée');
    }
    
    // Si plusieurs images demandées, retourner toutes
    const images = response.data.map(img => ({
      imageUrl: `data:image/png;base64,${img.base64}`,
      seed: img.seed
    }));
    
    return NextResponse.json({ 
      images: images,
      request_id: response.meta.request_id,
      count: images.length
    });
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Erreur POST détaillée:', apiError);
    return NextResponse.json(
      { error: apiError.message || 'Erreur inconnue' },
      { status: apiError.status || 500 }
    );
  }
}