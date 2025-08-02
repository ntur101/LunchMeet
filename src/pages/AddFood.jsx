import { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

function AddFood() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Request access to the camera with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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
      setCameraError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob/base64
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({
          url: imageUrl,
          blob: blob
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

  const confirmPhoto = () => {
    // Here you would typically upload the photo or process it
    console.log('Photo confirmed:', capturedImage);
    // For now, just show an alert
    alert('Photo captured! You can now implement upload/processing logic.');
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
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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
          <button 
            onClick={startCamera}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Camera View */}
      {!capturedImage && (
        <div className="relative w-full h-screen">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
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

      {/* Photo Preview */}
      {capturedImage && (
        <div className="relative w-full h-screen">
          <img
            src={capturedImage.url}
            alt="Captured food"
            className="w-full h-full object-cover"
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
              <span className="text-white/80 text-sm">Use Photo</span>
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