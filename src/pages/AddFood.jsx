import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RotateCcw, Check, X, Loader2, Plus } from 'lucide-react';
import { detectFood } from '../lib/foodDetection';

function AddFood() {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestartingCamera, setIsRestartingCamera] = useState(false);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
  const [detectedFoodName, setDetectedFoodName] = useState('');
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
      
      savedPhotos.forEach(photo => {
        if (photo.url && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
      });
    };
  }, []);

  // Effect to connect stream to video element
  useEffect(() => {
    if (stream && videoRef.current && !isRestartingCamera && !showSavedConfirmation) {
      console.log('Connecting stream to video element');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, isRestartingCamera, showSavedConfirmation]);

  // Debug logging
  useEffect(() => {
    console.log('AddFood state:', {
      isLoading,
      cameraError,
      isProcessing,
      isRestartingCamera,
      showSavedConfirmation,
      savedPhotosCount: savedPhotos.length,
      hasStream: !!stream,
      hasCapturedImage: !!capturedImage
    });
  }, [isLoading, cameraError, isProcessing, isRestartingCamera, showSavedConfirmation, savedPhotos.length, stream, capturedImage]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Stop existing stream if it exists
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
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
        videoRef.current.play().catch(console.error);
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
    
    try {
      // Detect food using AI
      const foodName = await detectFood(capturedImage.blob);
      setDetectedFoodName(foodName);
      
      // Convert image to base64 for localStorage
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Convert to base64
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        // Generate a unique ID for this photo
        const photoId = Date.now();
        
        // Save to localStorage with AI-detected name
        localStorage.setItem(`food-image-${photoId}`, base64Image);
        localStorage.setItem(`food-name-${photoId}`, foodName);
        
        // Add to saved photos list
        const newPhoto = {
          id: photoId,
          url: capturedImage.url,
          base64: base64Image,
          name: foodName,
          timestamp: new Date().toISOString()
        };
        
        setSavedPhotos(prev => [...prev, newPhoto]);
        setCapturedImage(null);
        setShowSavedConfirmation(true);
        setIsProcessing(false);
        
        // Keep camera running in background for taking another photo
        // Don't stop the stream here
      };
      
      img.src = capturedImage.url;
    } catch (error) {
      console.error('Error saving photo:', error);
      setIsProcessing(false);
    }
  };

  const getNextPhotoId = () => {
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

  const retakeLastPhoto = () => {
    if (savedPhotos.length > 0) {
      const lastPhoto = savedPhotos[savedPhotos.length - 1];
      
      // Remove the last photo from localStorage
      localStorage.removeItem(`food-image-${lastPhoto.id}`);
      localStorage.removeItem(`food-name-${lastPhoto.id}`);
      
      // Clean up the blob URL
      if (lastPhoto.url && lastPhoto.url.startsWith('blob:')) {
        URL.revokeObjectURL(lastPhoto.url);
      }
      
      // Remove from savedPhotos array
      setSavedPhotos(prev => prev.slice(0, -1));
      
      // Reset states and go back to camera
      setShowSavedConfirmation(false);
      setDetectedFoodName('');
      
      // Camera should already be running in the background
    }
  };

  const takeAnotherPhoto = async () => {
    setIsRestartingCamera(true);
    setShowSavedConfirmation(false);
    setDetectedFoodName(''); // Reset detected food name
    
    // Short delay for the loading animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simply restart the camera using the existing startCamera function
    // This will handle all the complexity of stopping and starting properly
    await startCamera();
    
    setIsRestartingCamera(false);
  };

  const finishAdding = () => {
    console.log(`Saved ${savedPhotos.length} photos to localStorage`);
    // Navigate to profile to see the updated inventory
    navigate('/profile');
  };

  const startOver = () => {
    // Clean up saved photo URLs to prevent memory leaks
    savedPhotos.forEach(photo => {
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    });
    
    // Clean up captured image URL
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    
    // Reset all states
    setCapturedImage(null);
    setSavedPhotos([]);
    setShowSavedConfirmation(false);
    setIsProcessing(false);
    setDetectedFoodName(''); // Reset detected food name
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
      <div className="flex items-center justify-center bg-black" style={{ height: 'calc(100vh - 60px)' }}>
        <div className="text-white text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-500" />
          <h2 className="text-xl font-semibold mb-2">Starting camera...</h2>
          <p className="text-white/80">Getting ready to take photos</p>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="flex items-center justify-center bg-black text-white p-4" style={{ height: 'calc(100vh - 60px)' }}>
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
                // Set up a demo captured image
                setCapturedImage({
                  url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzY2NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gRm9vZCBQaG90bzwvdGV4dD48L3N2Zz4=",
                  blob: null,
                  width: 400,
                  height: 300
                });
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
    <div className="relative bg-black" style={{ height: 'calc(100vh - 60px)' }}>
      {/* Processing/Loading Screen */}
      {(isProcessing || isRestartingCamera) && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" style={{ top: 0 }}>
          <div className="text-white text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">
              {isRestartingCamera ? 'Restarting camera...' : 'Analyzing your photo...'}
            </h2>
            <p className="text-white/80">
              {isRestartingCamera ? 'Getting ready for another photo' : 'Using AI to identify what you captured'}
            </p>
          </div>
        </div>
      )}

      {/* Photo Saved Confirmation */}
      {showSavedConfirmation && (
        <div className="bg-white flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Photo Saved!</h1>
                <p className="text-sm text-gray-500">
                  {savedPhotos.length} photo{savedPhotos.length !== 1 ? 's' : ''} in your inventory
                </p>
              </div>
              <button
                onClick={startOver}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Saved Photo Display */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-sm text-center">
              {/* Photo Preview */}
              {savedPhotos.length > 0 && savedPhotos[savedPhotos.length - 1] && (
                <div className="mb-6">
                  <div className="relative w-full aspect-[7/4] rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={savedPhotos[savedPhotos.length - 1].url}
                      alt={detectedFoodName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {detectedFoodName} Detected!
              </h2>
              <p className="text-gray-600 mb-6">
                Your {detectedFoodName.toLowerCase()} photo has been added to your inventory.
              </p>
              
              {savedPhotos.length > 0 && (
                <div className="text-sm text-gray-500 mb-6">
                  Total photos: {savedPhotos.length}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="space-y-3">
              {/* Top row - Retake button (full width) */}
              <button
                onClick={retakeLastPhoto}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Retake Photo
              </button>
              
              {/* Bottom row - View Inventory and Take Another */}
              <div className="flex gap-3">
                <button
                  onClick={finishAdding}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm">View ({savedPhotos.length})</span>
                </button>
                
                <button
                  onClick={takeAnotherPhoto}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Take Another</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera View - Only show if not processing and not showing saved confirmation */}
      {!isProcessing && !isRestartingCamera && !showSavedConfirmation && !capturedImage && (
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

      {/* Photo Preview - Only show if not processing and not showing saved confirmation */}
      {!isProcessing && !isRestartingCamera && !showSavedConfirmation && capturedImage && (
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
              <span className="text-white/80 text-sm">Save & Analyze</span>
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