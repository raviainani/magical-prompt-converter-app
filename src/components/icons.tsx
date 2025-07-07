
import React from 'react';

export const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M11.603 2.197a.75.75 0 0 1 .802 0l4.025 1.102 1.102 4.025a.75.75 0 0 1 0 .802l-1.102 4.025-4.025 1.102a.75.75 0 0 1-.802 0l-4.025-1.102-1.102-4.025a.75.75 0 0 1 0-.802l1.102-4.025 4.025-1.102Z" />
        <path d="M13.25 9.75a.75.75 0 0 0-1.5 0v.008a.75.75 0 0 0 1.5 0v-.008ZM12 11.25a.75.75 0 0 0-.75.75v.008a.75.75 0 0 0 1.5 0v-.008A.75.75 0 0 0 12 11.25Zm0 2.25a.75.75 0 0 0-.75.75v.008a.75.75 0 0 0 1.5 0v-.008A.75.75 0 0 0 12 13.5ZM9.75 12a.75.75 0 0 0 .75-.75h-.008a.75.75 0 0 0-.75.75h.008Z" />
        <path d="M19.34 20.916 18 22.5l-.36-1.921c-.347-.282-.69-.597-1.026-.957L14.25 18l-1.5 1.34c-.7.625-1.523 1.077-2.404 1.355L9 22.5l-1.34-1.5c-.625-.7-1.077-1.523-1.355-2.404L4.5 18l1.5-1.34c.7-.625 1.523-1.077 1.355-2.404L9 14.25l1.34 1.5c.625.7 1.077 1.523 2.404 1.355L14.25 15l1.5 1.34c.7.625 1.523 1.077 1.355-2.404L18 14.25l1.34 1.5c.625.7 1.077 1.523 2.404 1.355L22.5 18l-1.5 1.34c-.7.625-1.523 1.077-1.355 2.404Z" />
    </svg>
);

export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L9.27 6.27L6 7L8.27 9.27L7 12L9.27 12.73L12 15L14.73 12.73L17 12L14.73 9.27L18 7L14.73 6.27L12 3z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

export const RefreshCwIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);
