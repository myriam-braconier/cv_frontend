import { NextResponse } from 'next/server';

interface RequestBody {
  prompt: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function attemptGeneration(prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
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

      if (!response.ok) {
        if (response.status === 503 && attempt < maxRetries) {
          console.log(`Tentative ${attempt} échouée, nouvelle tentative dans ${attempt * 2} secondes...`);
          await delay(attempt * 2000);
          continue;
        }
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Erreur lors de la tentative ${attempt}, nouvelle tentative...`);
      await delay(attempt * 2000);
    }
  }
  throw new Error('Maximum retry attempts reached');
}

export async function GET() {
  try {
    const response = await attemptGeneration("abstract digital art background, colorful, vibrant, high quality");
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

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as RequestBody;
    const response = await attemptGeneration(prompt);
    
    const arrayBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({ imageUrl: `data:image/jpeg;base64,${base64String}` });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
}