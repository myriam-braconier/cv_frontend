import huggingFaceApi from "@/lib/axios/huggingface";

export const generateBackground = async (
	prompt: string
): Promise<string | null> => {
	try {
    console.log('Headers:', huggingFaceApi.defaults.headers);
		const response = await huggingFaceApi.post(
			"/models/stabilityai/stable-diffusion-xl-base-1.0",
			{
				inputs: prompt,
				parameters: {
					num_inference_steps: 30,
					guidance_scale: 7.5,
					width: 1024,
					height: 768,
				},
			}
		);

		console.log('Response type:', typeof response.data);
		console.log('Response:', response.data);

		 // Si response.data est déjà un Buffer
		 const base64Image = (Buffer.isBuffer(response.data)) 
		 ? response.data.toString('base64')
		 : Buffer.from(response.data).toString("base64");
		return `data:image/jpeg;base64,${base64Image}`;
	} catch (error) {
		console.error("Image generation failed:", error);
		return null;
	}
};

// Optional: Cache version
export const generateBackgroundWithCache = async (
	prompt: string
): Promise<string | null> => {
	const cacheKey = `bg_${prompt}`;
	const cachedImage = localStorage.getItem(cacheKey);

	if (cachedImage) return cachedImage;

	const newImage = await generateBackground(prompt);
	if (newImage) {
		localStorage.setItem(cacheKey, newImage);
	}

	return newImage;
};
