import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  ExternalLink,
  AlertCircle,
  Maximize2,
  Minimize2,
  Loader2,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https:https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  fileUrl: string;
  className?: string;
}

export function PDFViewer({ fileUrl, className = "" }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try loading directly with PDF.js first
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF with PDF.js:", err);

        // Try fetching as blob (fallback for CORS issues)
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
          });

          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
        } catch (fetchErr) {
          console.error("Error fetching PDF:", fetchErr);
          setError(
            fetchErr instanceof Error
              ? fetchErr.message
              : "Failed to load PDF document"
          );
          setLoading(false);
        }
      }
    };

    loadPDF();
  }, [fileUrl]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Failed to render page");
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, rotation]);

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
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setError(null);
    setLoading(true);

    const loadPDF = async () => {
      try {
        // Try loading directly first
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load PDF document"
        );
        setLoading(false);
      }
    };

    loadPDF();
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pdf-viewer bg-background border rounded-lg overflow-hidden ${className} ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">PDF Document</span>
          {totalPages > 0 && (
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
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
      <div
        className="relative overflow-auto bg-muted/20"
        style={{ height: isFullscreen ? "calc(100vh - 140px)" : "600px" }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-8">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Cannot Load PDF</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {error}
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
        ) : (
          <div className="flex items-center justify-center p-4">
            <canvas ref={canvasRef} className="shadow-lg" />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {!loading && !error && totalPages > 0 && (
        <div className="flex items-center justify-between p-4 bg-card border-t">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center border rounded-lg bg-background"
              />
              <span className="text-sm text-muted-foreground">
                / {totalPages}
              </span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              disabled={scale >= 3}
              className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={rotate}
              className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
