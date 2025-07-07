import React from 'react';

interface LoaderProps {
  text?: string;
  className?: string; // Add className prop here
}

const Loader: React.FC<LoaderProps> = ({ text = 'Loading...', className }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center text-white ${className}`}> {/* Apply className here */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-lg text-slate-300">{text}</p>
    </div>
  );
};

export default Loader;