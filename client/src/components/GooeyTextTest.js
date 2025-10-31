import React from 'react';
import { GooeyText } from './ui/gooey-text-morphing';

function GooeyTextTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6">
            <span className="text-white text-2xl">✨</span>
          </div>
          
          <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 flex items-center justify-center w-full">
            <GooeyText
              texts={["QA Tech Builder", "Smart Testing", "Perfect Stack", "Build & Learn"]}
              morphTime={2}
              cooldownTime={0.5}
              className="font-bold w-full"
              textClassName="text-white drop-shadow-lg"
            />
          </div>
        </div>
        
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
          Testing the GooeyText component with improved positioning and resolution
        </p>
      </div>
    </div>
  );
}

export default GooeyTextTest;








