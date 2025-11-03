import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!prompt || !imageBase64) {
      setResult('Please provide an image and a prompt.');
      return;
    }
    setIsLoading(true);
    setResult('');
    const analysisResult = await analyzeImage(prompt, imageBase64, mimeType);
    setResult(analysisResult);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[var(--glow-secondary)] mb-4 text-center" style={{ textShadow: '0 0 8px var(--glow-secondary)' }}>Analyze an Image</h2>
      <p className="text-center text-[var(--text-secondary)] mb-6 max-w-prose">
        Upload a photo of a problem (e.g., a leaky pipe, a damaged wall) and ask Gemini for an analysis or what kind of help you might need.
      </p>
      
      <div className="w-full max-w-2xl p-4 card-style">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-lg p-4 h-64">
            {image ? (
              <img src={image} alt="Upload preview" className="max-h-full max-w-full object-contain rounded"/>
            ) : (
              <div className="text-center text-[var(--text-secondary)]">
                <p>Upload an image</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--glow-primary)] file:text-white hover:file:opacity-80"/>
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'What kind of professional do I need to fix this? Is it an urgent issue?'"
              className="w-full h-full p-3 input-style"
              rows={5}
            />
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt || !image}
          className="mt-4 w-full btn-primary"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>

      {result && (
        <div className="mt-6 w-full max-w-2xl card-style p-5">
          <h3 className="text-lg font-semibold text-[var(--glow-secondary)] mb-2">Analysis Result:</h3>
          <p className="text-[var(--text-primary)] whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
