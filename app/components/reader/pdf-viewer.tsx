import React, { useState, useRef, useEffect } from 'react';
import { Download, ExternalLink, AlertCircle, Maximize2, Minimize2, Loader2, RefreshCw, FileText } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  className?: string;
}

export function PDFViewer({ fileUrl, className = '' }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to fetch the PDF as blob and convert to data URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }

        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);
        setPdfData(dataUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPDF();

    // Cleanup blob URL on unmount
    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [fileUrl]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleRetry = () => {
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
    }
    setPdfData(null);
    setLoading(true);
    setError(null);
    
    // Reload the PDF
    const loadPDF = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }

        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);
        setPdfData(dataUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPDF();
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF');
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`pdf-viewer bg-background border rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">PDF Document</span>
          {error && (
            <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
              Display Error
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={handleRetry}
              className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Retry loading"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <a
            href={fileUrl}
            download
            className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* PDF Display */}
      <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '600px' }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-8">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Cannot Display PDF</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Due to browser security restrictions, this PDF cannot be displayed inline. 
              Please use one of the options below to view it.
            </p>
            
            {/* Viewing options */}
            <div className="space-y-3 w-full max-w-md">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF in New Tab
              </a>
              
              <a
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View with Google Docs
              </a>
              
              <a
                href={fileUrl}
                download
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
            
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : pdfData ? (
          <iframe
            src={pdfData}
            className="w-full h-full border-0"
            title="PDF Document"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : null}
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 bg-muted/30 border-t">
        <p className="text-xs text-muted-foreground text-center">
          {error 
            ? 'Click "Open PDF in New Tab" to view the document'
            : 'PDF loaded successfully. Use browser controls for navigation.'
          }
        </p>
      </div>
    </div>
  );
}
