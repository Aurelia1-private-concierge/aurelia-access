import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion } from "framer-motion";
import { X, RotateCcw, ZoomIn, ZoomOut, Check, Eye, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 80,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const AvatarCropModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: AvatarCropModalProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  // Update preview canvas when crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Preview size
    const previewSize = 80;
    canvas.width = previewSize;
    canvas.height = previewSize;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clear and draw circular clip
    ctx.clearRect(0, 0, previewSize, previewSize);
    ctx.beginPath();
    ctx.arc(previewSize / 2, previewSize / 2, previewSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate source coordinates
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    // Apply rotation
    ctx.translate(previewSize / 2, previewSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-previewSize / 2, -previewSize / 2);

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      previewSize,
      previewSize
    );
  }, [completedCrop, rotation]);

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to desired output (square avatar)
    const outputSize = 256;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Enable high-quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Calculate source coordinates
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    // Apply rotation
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-outputSize / 2, -outputSize / 2);

    // Draw the cropped image
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.92
      );
    });
  }, [completedCrop, rotation]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, 1));
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Crop Your Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-6">
            {/* Crop Area */}
            <div className="flex-1 relative bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center min-h-[280px]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[350px]"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${scale})`,
                    maxHeight: "350px",
                    width: "auto",
                  }}
                  className="transition-transform"
                />
              </ReactCrop>
            </div>

            {/* Live Preview Panel */}
            <div className="flex flex-col items-center justify-center w-32 shrink-0">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Eye className="w-3 h-3" />
                  Preview
                </div>
              </div>
              
              {/* Large Preview */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/10 overflow-hidden bg-muted/50">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full"
                  />
                </div>
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(212, 175, 55, 0)",
                      "0 0 0 4px rgba(212, 175, 55, 0.1)",
                      "0 0 0 0 rgba(212, 175, 55, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                />
              </div>

              {/* Size indicators */}
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full border border-border/50 overflow-hidden bg-muted/30">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-full"
                      style={{ display: "none" }}
                    />
                    {completedCrop && imgRef.current && (
                      <SmallPreview
                        image={imgRef.current}
                        crop={completedCrop}
                        size={40}
                      />
                    )}
                  </div>
                  <div className="w-6 h-6 rounded-full border border-border/50 overflow-hidden bg-muted/30">
                    {completedCrop && imgRef.current && (
                      <SmallPreview
                        image={imgRef.current}
                        crop={completedCrop}
                        size={24}
                      />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  How it will appear
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 px-2">
            {/* Rotation Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleRotateLeft}
                title="Rotate left 90°"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleRotateRight}
                title="Rotate right 90°"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Control */}
            <div className="flex items-center gap-2 flex-1">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[scale]}
                onValueChange={([value]) => setScale(value)}
                min={0.5}
                max={2}
                step={0.01}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              Reset
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isProcessing || !completedCrop}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"
                  />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Apply
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Drag to reposition • Use buttons to rotate • Use slider to zoom
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Small preview component for different sizes
const SmallPreview = ({ 
  image, 
  crop, 
  size 
}: { 
  image: HTMLImageElement; 
  crop: PixelCrop; 
  size: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = size;
    canvas.height = size;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      size,
      size
    );
  }, [image, crop, size]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default AvatarCropModal;
