import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <h1 className="text-blue-700 font-bold text-4xl tracking-tighter font-serif italic">
          FEIRA LIVRE
        </h1>
        <div className="absolute -bottom-2 left-0 w-full h-3 bg-pink-400/60 -skew-x-12 rounded-full -z-10" />
      </div>
    </div>
  );
};

export const LogoSmall: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <h1 className="text-blue-700 font-bold text-xl tracking-tighter font-serif italic">
          FEIRA LIVRE
        </h1>
        <div className="absolute -bottom-1 left-0 w-full h-1.5 bg-pink-400/60 -skew-x-12 rounded-full -z-10" />
      </div>
    </div>
  );
};
