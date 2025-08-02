import { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Check, X, Loader2, Plus, SkipForward } from 'lucide-react';

function AddFood() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedPortions, setCroppedPortions] = useState([]);
  const [currentPortionIndex, setCurrentPortionIndex] = useState(0);
  const [showCroppedView, setShowCroppedView] = useState(false);
  const [addedItems, setAddedItems] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera when component mounts
  useEffect(() => {
    console.log('AddFood component mounted, starting camera...');
    startCamera();
    return () => {
      // Cleanup camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Cleanup image URLs when component unmounts
      if (capturedImage?.url) {
        URL.revokeObjectURL(capturedImage.url);
      }
      
      croppedPortions.forEach(portion => {
        if (portion.image && portion.image.startsWith('blob:')) {
          URL.revokeObjectURL(portion.image);
        }
      });
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('AddFood state:', {
      isLoading,
      cameraError,
      isProcessing,
      showCroppedView,
      currentPortionIndex,
      totalPortions: croppedPortions.length,
      hasStream: !!stream,
      hasCapturedImage: !!capturedImage
    });
  }, [isLoading, cameraError, isProcessing, showCroppedView, currentPortionIndex, croppedPortions.length, stream, capturedImage]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      
      // Request access to the camera with landscape constraints for food photography
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 16/9 } // Landscape aspect ratio
        }
      });
      
      setStream(mediaStream);
      
      // Set the video source to the stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(`Unable to access camera: ${error.message}`);
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Get the video's actual dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Set canvas dimensions to match video exactly as displayed
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw the video frame to canvas exactly as it appears in the viewfinder
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob/base64
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({
          url: imageUrl,
          blob: blob,
          width: canvas.width,
          height: canvas.height
        });
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
  };

  const confirmPhoto = async () => {
    setIsProcessing(true);
    
    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Simulate AI processing and food detection
    try {
      const croppedItems = await simulateFoodDetection(capturedImage);
      setCroppedPortions(croppedItems);
      setCurrentPortionIndex(0);
      setShowCroppedView(true);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateFoodDetection = async (image) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Log image dimensions for debugging
    console.log('Captured image dimensions:', {
      width: image.width,
      height: image.height
    });
    
    // Generate mock cropped portions with bounding boxes for landscape images
    // Using percentages and then converting to actual pixels
    const imageWidth = image.width || 1920;
    const imageHeight = image.height || 1080;
    
    const mockCroppedPortions = [
      {
        id: 1,
        name: "Sandwich",
        confidence: 0.92,
        image: image.url,
        boundingBox: { 
          x: Math.floor(imageWidth * 0.08), // 10% from left
          y: Math.floor(imageHeight * 0.16), // 20% from top
          width: Math.floor(imageWidth * 0.45), // 35% of width
          height: Math.floor(imageHeight * 0.75) // 60% of height
        }
      },
      {
        id: 2,
        name: "Apple", 
        confidence: 0.87,
        image: image.url,
        boundingBox: { 
          x: Math.floor(imageWidth * 0.4), // 10% from left
          y: Math.floor(imageHeight * 0.10), // 20% from top
          width: Math.floor(imageWidth * 0.45), // 35% of width
          height: Math.floor(imageHeight * 0.45) // 60% of height
        }
      },
      {
        id: 3,
        name: "Chips",
        confidence: 0.78,
        image: image.url,
        boundingBox: { 
          x: Math.floor(imageWidth * 0.4), // 10% from left
          y: Math.floor(imageHeight * 0.45), // 20% from top
          width: Math.floor(imageWidth * 0.45), // 35% of width
          height: Math.floor(imageHeight * 0.45) // 60% of height
        }
      }
    ];
    
    console.log('Generated bounding boxes:', mockCroppedPortions.map(p => ({
      name: p.name,
      boundingBox: p.boundingBox
    })));
    
    // Create cropped images for each portion
    const croppedPortions = await Promise.all(
      mockCroppedPortions.map(async (portion) => {
        const croppedImageUrl = await cropImage(image.url, portion.boundingBox);
        return {
          ...portion,
          image: croppedImageUrl
        };
      })
    );
    
    return croppedPortions;
  };

  const cropImage = async (imageUrl, boundingBox) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to the bounding box dimensions
        canvas.width = boundingBox.width;
        canvas.height = boundingBox.height;
        
        // Draw the cropped portion of the image
        ctx.drawImage(
          img,
          boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height, // Source rectangle
          0, 0, boundingBox.width, boundingBox.height // Destination rectangle
        );
        
        // Convert canvas to blob URL
        canvas.toBlob((blob) => {
          const croppedUrl = URL.createObjectURL(blob);
          resolve(croppedUrl);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = imageUrl;
    });
  };

  const addFoodItem = (item) => {
    console.log('Adding food item:', item);
    setAddedItems(prev => [...prev, item]);
    goToNextPortion();
  };

  const skipFoodItem = () => {
    console.log('Skipping food item');
    goToNextPortion();
  };

  const goToNextPortion = () => {
    if (currentPortionIndex < croppedPortions.length - 1) {
      setCurrentPortionIndex(prev => prev + 1);
    } else {
      // Finished with all portions
      finishAdding();
    }
  };

  const finishAdding = () => {
    console.log('Finished adding food items:', addedItems);
    // Here you would typically save to database or navigate somewhere
    alert(`Added ${addedItems.length} food items: ${addedItems.map(item => item.name).join(', ')}`);
    startOver();
  };

  const startOver = () => {
    // Clean up cropped image URLs to prevent memory leaks
    croppedPortions.forEach(portion => {
      if (portion.image && portion.image.startsWith('blob:')) {
        URL.revokeObjectURL(portion.image);
      }
    });
    
    // Clean up captured image URL
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    
    // Reset all states
    setCapturedImage(null);
    setCroppedPortions([]);
    setShowCroppedView(false);
    setCurrentPortionIndex(0);
    setAddedItems([]);
    setIsProcessing(false);
    // Restart camera
    startCamera();
  };

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      // Try to switch between front and back camera
      const currentFacingMode = stream?.getVideoTracks()[0]?.getSettings()?.facingMode;
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 16/9 } // Landscape aspect ratio
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      // If switching fails, restart with default camera
      startCamera();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Starting camera...</p>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="text-center">
          <p className="mb-4">{cameraError}</p>
          <div className="space-y-3">
            <button 
              onClick={startCamera}
              className="block w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                // Skip camera and go directly to demo mode
                setCameraError(null);
                setIsLoading(false);
                setShowCroppedView(true);
                setCurrentPortionIndex(0);
                setCroppedPortions([
                  {
                    id: 1,
                    name: "Demo Sandwich",
                    confidence: 0.92,
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvb2QgSW1hZ2U8L3RleHQ+PC9zdmc+",
                    boundingBox: { x: 0, y: 30, width: 150, height: 200 }
                  },
                  {
                    id: 2,
                    name: "Demo Apple",
                    confidence: 0.87,
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFwcGxlPC90ZXh0Pjwvc3ZnPg==",
                    boundingBox: { x: 300, y: 100, width: 120, height: 120 }
                  }
                ]);
              }}
              className="block w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
            >
              Skip Camera (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Processing/Loading Screen */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Analyzing your food...</h2>
            <p className="text-white/80">Using AI to detect food items</p>
            <div className="mt-6 w-64 bg-gray-700 rounded-full h-2 mx-auto">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Cropped Portion View */}
      {showCroppedView && croppedPortions.length > 0 && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {croppedPortions[currentPortionIndex]?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentPortionIndex + 1} of {croppedPortions.length} detected items
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Confidence: {Math.round((croppedPortions[currentPortionIndex]?.confidence || 0) * 100)}%
                </p>
                <button
                  onClick={startOver}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 h-2">
            <div 
              className="bg-blue-500 h-2 transition-all duration-300"
              style={{ width: `${((currentPortionIndex + 1) / croppedPortions.length) * 100}%` }}
            />
          </div>

          {/* Food Image */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-sm">
              <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <img
                  src={croppedPortions[currentPortionIndex]?.image}
                  alt={croppedPortions[currentPortionIndex]?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Food Info */}
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {croppedPortions[currentPortionIndex]?.name}
                </h2>
                <p className="text-gray-600">
                  Would you like to add this to your inventory?
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex gap-4">
              {/* Skip Button */}
              <button
                onClick={skipFoodItem}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                Skip
              </button>
              
              {/* Add Button */}
              <button
                onClick={() => addFoodItem(croppedPortions[currentPortionIndex])}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add to Inventory
              </button>
            </div>
            
            {/* Added Items Counter */}
            {addedItems.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Added {addedItems.length} item{addedItems.length !== 1 ? 's' : ''} so far
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Camera View - Only show if not processing and not showing cropped view */}
      {!isProcessing && !showCroppedView && !capturedImage && (
        <div className="relative w-full h-screen">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain bg-black"
          />
          
          {/* Camera Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              {/* Switch Camera Button */}
              <button
                onClick={switchCamera}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </button>
              
              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:border-gray-100 transition-colors"
              >
                <Camera className="w-8 h-8 text-black mx-auto" />
              </button>
              
              {/* Placeholder for balance */}
              <div className="w-12 h-12"></div>
            </div>
          </div>
          
          {/* Top overlay with title */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
            <h1 className="text-white text-xl font-semibold text-center">Add Food</h1>
            <p className="text-white/80 text-sm text-center mt-1">Take a photo of your food</p>
          </div>
        </div>
      )}

      {/* Photo Preview - Only show if not processing and not showing cropped view */}
      {!isProcessing && !showCroppedView && capturedImage && (
        <div className="relative w-full h-screen">
          <img
            src={capturedImage.url}
            alt="Captured food"
            className="w-full h-full object-contain bg-black"
          />
          
          {/* Photo Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center gap-8">
              {/* Retake Button */}
              <button
                onClick={retakePhoto}
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              {/* Confirm Button */}
              <button
                onClick={confirmPhoto}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
              >
                <Check className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex justify-center gap-8 mt-2">
              <span className="text-white/80 text-sm">Retake</span>
              <span className="text-white/80 text-sm">Analyze</span>
            </div>
          </div>
          
          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
            <h1 className="text-white text-xl font-semibold text-center">Photo Preview</h1>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default AddFood;