import React from 'react';
import { DownloadIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DownloadTxtButtonProps {
  reportText: string;
  initialQuery?: string;
  fileName?: string;
}

const DownloadTxtButton: React.FC<DownloadTxtButtonProps> = ({
  reportText,
  initialQuery = '',
  fileName,
}) => {
  const handleDownload = () => {
    // Generate a sanitized filename from the query if no custom filename is provided
    const sanitizedName = fileName || generateFilename(initialQuery);
    
    // Create a blob from the report text content.
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    // Create a temporary URL for the blob.
    const url = window.URL.createObjectURL(blob);
    // Create a temporary anchor element.
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedName;
    // Append the link, trigger click, remove it, and revoke the URL.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  // Helper function to generate a filename from the query
  const generateFilename = (query: string): string => {
    if (!query || query.trim() === '') {
      return 'research_report.md';
    }
    
    // Truncate and sanitize the query for use as a filename
    const sanitized = query
      .trim()
      .substring(0, 50) // Limit length
      .replace(/[\/\\:*?"<>|]/g, '_') // Replace invalid filename chars
      .replace(/\s+/g, '_'); // Replace spaces with underscores
      
    return `${sanitized}.md`;
  };

  return (
    <motion.button
      onClick={handleDownload}
      initial={{ opacity: 0.9, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="
        group
        relative
        flex
        items-center
        justify-center
        gap-2
        px-6
        py-3
        bg-primary
        hover:bg-primary/90
        border-none
        rounded-full
        text-sm
        font-semibold
        text-primary-foreground
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]
        transition-all
        duration-300
        ease-out
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/30 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
      <motion.div
        animate={{ 
          y: [0, -3, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5,
          ease: "easeInOut"
        }}
        className="text-white"
      >
        <DownloadIcon className="w-5 h-5 mr-1" />
      </motion.div>
      <span className="text-white font-medium">レポートをダウンロード</span>
    </motion.button>
  );
};

export default DownloadTxtButton;
