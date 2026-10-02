const fs = require('fs');

let file = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

const errorBlockOld = `{generationError && (<div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-red-500 mb-8">{generationError}</div>)}`;
const errorBlockNew = `{generationError && (
  <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-red-500 mb-8 flex flex-col items-center text-center">
    <AlertCircle className="w-12 h-12 mb-4" />
    <p className="mb-4">{generationError}</p>
    <button 
      onClick={startGeneration} 
      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      disabled={isGenerating}
    >
      Retry Generation
    </button>
  </div>
)}`;

file = file.replace(errorBlockOld, errorBlockNew);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', file);
console.log('Added Retry Generation button.');
