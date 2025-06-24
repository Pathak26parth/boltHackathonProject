import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface WebcamFeedProps {
  isRecording: boolean;
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({ isRecording }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  console.log('[useEffect] isRecording:', isRecording);
  if (isRecording) {
    startCamera();
  } else {
    stopCamera();
  }

  return () => {
    console.log('[useEffect cleanup] stopping camera');
    stopCamera();
  };
}, [isRecording]);


 const startCamera = async () => {
  try {
    if (stream) return; // ✅ Prevent double init

    setIsLoading(true);
    setError(null);
    
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    });

    setStream(mediaStream);
    
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
    
    setIsLoading(false);
  } catch (err) {
    console.error('Error accessing camera:', err);
    setError('Unable to access camera. Please check permissions.');
    setIsLoading(false);
  }
};

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Please enable camera permissions and refresh the page
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 font-medium">Starting camera...</p>
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full h-96 bg-black rounded-lg object-cover"
        playsInline
        muted
      />
      
      {/* Face detection overlay simulation */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning effect */}
        <div className="absolute inset-4 border-2 border-blue-400 rounded-lg opacity-50">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
        </div>
        
        {/* Center crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border border-white opacity-60">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
            <div className="absolute top-0 left-1/2 w-px h-full bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamFeed;