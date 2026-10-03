import { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';

const BackgroundRemovalTest = () => {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [transparentUrl, setTransparentUrl] = useState(null);
  const [maskUrl, setMaskUrl] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setOriginalUrl(URL.createObjectURL(selected));
      setTransparentUrl(null);
      setMaskUrl(null);
      setError(null);
      setMetrics(null);
    }
  };

  const processImage = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setStatus('Loading model and processing (this may take a few seconds)...');
    setError(null);
    const startTime = performance.now();

    try {
      // 1. Run imgly background removal
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          setStatus(`Loading asset: ${key} (${Math.round((current / total) * 100)}%)`);
        }
      });
      
      setStatus('Generating mask...');
      const modelTime = performance.now() - startTime;
      
      const tUrl = URL.createObjectURL(blob);
      setTransparentUrl(tUrl);

      // 2. Generate Black/White Mask from transparent PNG
      // AI Horde convention: White = Background (editable), Black = Product (protected)
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the transparent product
        ctx.drawImage(img, 0, 0);
        
        // Get pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          
          if (alpha > 128) {
            // Product region -> Make it Black (protected)
            data[i] = 0;     // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
            data[i + 3] = 255; // Alpha
          } else {
            // Background region -> Make it White (editable)
            data[i] = 255;   // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 255; // Alpha
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((maskBlob) => {
          setMaskUrl(URL.createObjectURL(maskBlob));
          const totalTime = performance.now() - startTime;
          setMetrics({
            processingTimeMs: totalTime,
            imageWidth: img.width,
            imageHeight: img.height,
          });
          setIsProcessing(false);
          setStatus('Complete!');
        }, 'image/png');
      };
      
      img.src = tUrl;
      
    } catch (err) {
      console.error('Background removal failed:', err);
      setError(err.message || 'Background removal failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-white text-[#101828]">
      <h1 className="text-3xl font-bold">Browser-Side Mask Generation (PoC)</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. Select Product Image</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-slate-900 hover:file:bg-primary/90" />
      </div>

      {originalUrl && (
        <div className="space-y-4">
          <button 
            onClick={processImage} 
            disabled={isProcessing}
            className="px-6 py-2 bg-[#101828] text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Run Segmentation'}
          </button>
          {status && <p className="text-sm font-medium text-slate-600">{status}</p>}
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        </div>
      )}

      {metrics && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
          <p><strong>Processing Time:</strong> {(metrics.processingTimeMs / 1000).toFixed(2)} seconds</p>
          <p><strong>Dimensions:</strong> {metrics.imageWidth} x {metrics.imageHeight}</p>
          <p><strong>Mask Convention:</strong> WHITE = Editable Background | BLACK = Protected Product</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {originalUrl && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Original Image</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <img src={originalUrl} alt="Original" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}
        
        {transparentUrl && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Transparent Product Cutout</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-300" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }}>
              <img src={transparentUrl} alt="Transparent Cutout" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}

        {maskUrl && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Product Mask</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <img src={maskUrl} alt="Mask" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default BackgroundRemovalTest;
