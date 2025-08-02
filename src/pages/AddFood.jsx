import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RotateCcw, Check, X, Loader2, Plus, SkipForward } from 'lucide-react';

function AddFood() {
  const navigate = useNavigate();
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

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
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

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 16 / 9 }
        }
      });

      setStream(mediaStream);
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

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

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

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

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

  const getNextFoodId = () => {
    let nextId = 1;
    
    // Check localStorage to find the highest existing food-image ID
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('food-image-')) {
        const id = parseInt(key.replace('food-image-', ''));
        if (id >= nextId) {
          nextId = id + 1;
        }
      }
    }
    
    return nextId;
  };

  const simulateFoodDetection = async (image) => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const imageWidth = image.width || 1920;
    const imageHeight = image.height || 1080;
    
    // Get the starting ID for this batch of detected foods
    let currentId = getNextFoodId();

    const mockCroppedPortions = [
      {
        id: currentId++,
        name: "Sandwich",
        confidence: 0.92,
        image: image.url,
        boundingBox: {
          x: Math.floor(imageWidth * 0.0),
          y: Math.floor(imageHeight * 0.16),
          width: Math.floor(imageWidth * 0.7),
          height: Math.floor(imageHeight * 0.7)
        }
      },
      {
        id: currentId++,
        name: "Apple",
        confidence: 0.87,
        image: image.url,
        boundingBox: {
          x: Math.floor(imageWidth * 0.4),
          y: Math.floor(imageHeight * 0.10),
          width: Math.floor(imageWidth * 0.45),
          height: Math.floor(imageHeight * 0.45)
        }
      },
      {
        id: currentId++,
        name: "Chips",
        confidence: 0.78,
        image: image.url,
        boundingBox: {
          x: Math.floor(imageWidth * 0.4),
          y: Math.floor(imageHeight * 0.45),
          width: Math.floor(imageWidth * 0.45),
          height: Math.floor(imageHeight * 0.45)
        }
      }
    ];

    const croppedPortions = await Promise.all(
      mockCroppedPortions.map(async (portion) => {
        const croppedBase64 = await cropImage(image.url, portion.boundingBox);

        try {
          localStorage.setItem(`food-image-${portion.id}`, croppedBase64);
          // Also store the food name for the Profile component to use
          localStorage.setItem(`food-name-${portion.id}`, portion.name);
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }

        return {
          ...portion,
          image: croppedBase64
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

        canvas.width = boundingBox.width;
        canvas.height = boundingBox.height;

        ctx.drawImage(
          img,
          boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
          0, 0, boundingBox.width, boundingBox.height
        );

        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };

      img.src = imageUrl;
    });
  };

  const addFoodItem = (item) => {
    const newAddedItems = [...addedItems, item];
    setAddedItems(newAddedItems);
    
    if (currentPortionIndex < croppedPortions.length - 1) {
      setCurrentPortionIndex(prev => prev + 1);
    } else {
      // This is the last item, finish with the updated count
      finishAddingWithItems(newAddedItems);
    }
  };

  const skipFoodItem = () => {
    if (currentPortionIndex < croppedPortions.length - 1) {
      setCurrentPortionIndex(prev => prev + 1);
    } else {
      finishAdding();
    }
  };

  const goToNextPortion = () => {
    if (currentPortionIndex < croppedPortions.length - 1) {
      setCurrentPortionIndex(prev => prev + 1);
    } else {
      finishAdding();
    }
  };

  const finishAddingWithItems = (itemsArray) => {
    const totalDetected = croppedPortions.length;
    const totalAdded = itemsArray.length;
    const skipped = totalDetected - totalAdded;
    
    let message = `Added ${totalAdded} food item${totalAdded !== 1 ? 's' : ''}`;
    if (totalAdded > 0) {
      message += `: ${itemsArray.map(item => item.name).join(', ')}`;
    }
    if (skipped > 0) {
      message += `\nSkipped ${skipped} item${skipped !== 1 ? 's' : ''}`;
    }
    
    alert(message);
    navigate('/'); // Redirect to main page
  };

  const finishAdding = () => {
    const totalDetected = croppedPortions.length;
    const totalAdded = addedItems.length;
    const skipped = totalDetected - totalAdded;
    
    let message = `Added ${totalAdded} food item${totalAdded !== 1 ? 's' : ''}`;
    if (totalAdded > 0) {
      message += `: ${addedItems.map(item => item.name).join(', ')}`;
    }
    if (skipped > 0) {
      message += `\nSkipped ${skipped} item${skipped !== 1 ? 's' : ''}`;
    }
    
    alert(message);
    navigate('/'); // Redirect to main page
  };

  const startOver = () => {
    croppedPortions.forEach(portion => {
      if (portion.image && portion.image.startsWith('blob:')) {
        URL.revokeObjectURL(portion.image);
      }
    });

    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }

    setCapturedImage(null);
    setCroppedPortions([]);
    setShowCroppedView(false);
    setCurrentPortionIndex(0);
    setAddedItems([]);
    setIsProcessing(false);
    startCamera();
  };

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const currentFacingMode = stream?.getVideoTracks()[0]?.getSettings()?.facingMode;
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 16 / 9 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      startCamera();
    }
  };

  return (
    <div className="relative bg-black" style={{ height: 'calc(100vh - 60px)' }}>
      {/* Processing/Loading Screen */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" style={{ top: 0 }}>
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
        <div className="bg-white flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
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
        <div className="relative w-full h-full">
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
        <div className="relative w-full h-full">
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