'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  imageName: string;
  onSave: (editedImage: File) => void;
  onCancel: () => void;
}

export default function ImageEditor({ imageUrl, imageName, onSave, onCancel }: ImageEditorProps) {
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawImage();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      drawImage();
    }
  }, [rotation, imageLoaded]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions
    const maxSize = 600;
    let width = img.width;
    let height = img.height;
    
    // Scale down if too large
    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
    }

    // Adjust canvas size for rotation
    if (rotation === 90 || rotation === 270) {
      canvas.width = height;
      canvas.height = width;
      setCanvasSize({ width: height, height: width });
    } else {
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
    }

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply rotation from center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    
    if (rotation === 90 || rotation === 270) {
      ctx.drawImage(img, -height / 2, -width / 2, height, width);
    } else {
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    }

    ctx.restore();
  };

  const handleRotate = (degrees: number) => {
    setRotation((rotation + degrees + 360) % 360);
  };

  const handleCropMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (!cropMode) return;
    e.stopPropagation();
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!cropMode || (!isDragging && !isResizing)) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (isDragging) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      setCrop(prev => ({
        x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
        width: prev.width,
        height: prev.height,
      }));
      
      setDragStart({ x: currentX, y: currentY });
    } else if (isResizing) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      setCrop(prev => {
        let newCrop = { ...prev };
        
        switch (resizeHandle) {
          case 'se':
            newCrop.width = Math.max(10, Math.min(100 - prev.x, prev.width + deltaX));
            newCrop.height = Math.max(10, Math.min(100 - prev.y, prev.height + deltaY));
            break;
          case 'sw':
            const newX = prev.x + deltaX;
            if (newX >= 0 && newX < prev.x + prev.width - 10) {
              newCrop.x = newX;
              newCrop.width = prev.width - deltaX;
            }
            newCrop.height = Math.max(10, Math.min(100 - prev.y, prev.height + deltaY));
            break;
          case 'ne':
            newCrop.width = Math.max(10, Math.min(100 - prev.x, prev.width + deltaX));
            const newY = prev.y + deltaY;
            if (newY >= 0 && newY < prev.y + prev.height - 10) {
              newCrop.y = newY;
              newCrop.height = prev.height - deltaY;
            }
            break;
          case 'nw':
            const newXnw = prev.x + deltaX;
            const newYnw = prev.y + deltaY;
            if (newXnw >= 0 && newXnw < prev.x + prev.width - 10) {
              newCrop.x = newXnw;
              newCrop.width = prev.width - deltaX;
            }
            if (newYnw >= 0 && newYnw < prev.y + prev.height - 10) {
              newCrop.y = newYnw;
              newCrop.height = prev.height - deltaY;
            }
            break;
        }
        
        return newCrop;
      });
      
      setDragStart({ x: currentX, y: currentY });
    }
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If crop mode, apply crop first
    let finalCanvas = canvas;
    if (cropMode) {
      const cropCanvas = document.createElement('canvas');
      const ctx = cropCanvas.getContext('2d');
      if (!ctx) return;

      const scaleX = canvas.width / 100;
      const scaleY = canvas.height / 100;
      
      cropCanvas.width = crop.width * scaleX;
      cropCanvas.height = crop.height * scaleY;

      ctx.drawImage(
        canvas,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      finalCanvas = cropCanvas;
    }

    // Convert to blob
    finalCanvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], imageName, { type: 'image/jpeg' });
      onSave(file);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Image</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 flex justify-center bg-gray-100">
          <div 
            ref={containerRef}
            className="relative inline-block"
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="border-2 border-gray-300 max-w-full h-auto block"
            />
            {cropMode && (
              <>
                {/* Crop overlay - just border, no fill */}
                <div
                  className="absolute border-4 border-blue-500 cursor-move pointer-events-auto"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
                  }}
                  onMouseDown={(e) => handleCropMouseDown(e)}
                >
                  {/* Resize handles */}
                  <div
                    className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-nw-resize rounded-full"
                    onMouseDown={(e) => handleCropMouseDown(e, 'nw')}
                  />
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-ne-resize rounded-full"
                    onMouseDown={(e) => handleCropMouseDown(e, 'ne')}
                  />
                  <div
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-sw-resize rounded-full"
                    onMouseDown={(e) => handleCropMouseDown(e, 'sw')}
                  />
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-se-resize rounded-full"
                    onMouseDown={(e) => handleCropMouseDown(e, 'se')}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tools */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Rotate Tools */}
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Rotate:</span>
              <button
                onClick={() => handleRotate(90)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                ↻ 90°
              </button>
              <button
                onClick={() => handleRotate(-90)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                ↺ -90°
              </button>
              <button
                onClick={() => handleRotate(180)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                180°
              </button>
            </div>

            {/* Crop Tool */}
            <div className="flex gap-2 items-center ml-4">
              <button
                onClick={() => setCropMode(!cropMode)}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  cropMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {cropMode ? '✓ Crop Mode' : '✂️ Enable Crop'}
              </button>
            </div>
          </div>

          {cropMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Crop Mode:</strong> Drag the blue rectangle to move it, or drag the corners to resize. Click "Save Changes" when ready.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
