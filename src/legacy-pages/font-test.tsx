
export default function FontTest() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold mb-8">Raleway Font Test</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Font Weights Test</h2>
            <p className="font-light text-xl mb-2">Light (300): The quick brown fox jumps over the lazy dog</p>
            <p className="font-normal text-xl mb-2">Regular (400): The quick brown fox jumps over the lazy dog</p>
            <p className="font-medium text-xl mb-2">Medium (500): The quick brown fox jumps over the lazy dog</p>
            <p className="font-semibold text-xl mb-2">Semibold (600): The quick brown fox jumps over the lazy dog</p>
            <p className="font-bold text-xl mb-2">Bold (700): The quick brown fox jumps over the lazy dog</p>
            <p className="font-extrabold text-xl mb-2">Extra Bold (800): The quick brown fox jumps over the lazy dog</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Different Sizes</h2>
            <p className="text-xs">Extra Small (12px): Family First Smile Care</p>
            <p className="text-sm">Small (14px): Family First Smile Care</p>
            <p className="text-base">Base (16px): Family First Smile Care</p>
            <p className="text-lg">Large (18px): Family First Smile Care</p>
            <p className="text-xl">Extra Large (20px): Family First Smile Care</p>
            <p className="text-2xl">2XL (24px): Family First Smile Care</p>
            <p className="text-3xl">3XL (30px): Family First Smile Care</p>
            <p className="text-4xl">4XL (36px): Family First Smile Care</p>
            <p className="text-5xl">5XL (48px): Family First Smile Care</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Italic Text</h2>
            <p className="italic text-xl">This text should be in italic Raleway font</p>
            <p className="italic font-bold text-xl">This text should be bold italic Raleway font</p>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Current Font Family</h2>
            <p className="text-lg">If Raleway is loaded correctly, all text on this page should use the Raleway font family.</p>
            <p className="text-lg mt-2">Check the computed styles in browser DevTools to verify: font-family should show "Raleway"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
