import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setImageUrl('');
    const url = await generateImage(prompt);
    setImageUrl(url);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[var(--glow-secondary)] mb-4 text-center" style={{ textShadow: '0 0 8px var(--glow-secondary)' }}>AI Image Generator</h2>
      <p className="text-center text-[var(--text-secondary)] mb-6 max-w-prose">
        Generate an image with Imagen. Try creating a logo concept for your freelance business or visualizing a completed project.
      </p>

      <div className="w-full max-w-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A logo for a modern handyman service, minimalist and blue"
            className="flex-grow p-3 input-style"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt}
            className="btn-primary"
          >
            {isLoading ? '...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-xl h-96 card-style flex items-center justify-center p-2">
        {isLoading && <div className="text-[var(--text-secondary)]">Generating your image...</div>}
        {!isLoading && imageUrl && <img src={imageUrl} alt="Generated" className="object-contain max-h-full max-w-full rounded-lg" />}
        {!isLoading && !imageUrl && <div className="text-[var(--text-secondary)]">Your generated image will appear here</div>}
      </div>
    </div>
  );
};

export default ImageGenerator;
