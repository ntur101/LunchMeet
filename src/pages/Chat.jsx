import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

function Chat() {
  const { chatId } = useParams();
  const videoRef = useRef(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setTimeout(() => {
          takePhoto();
          stream.getTracks().forEach((track) => track.stop());
        }, 2000);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();
  }, []);

  const takePhoto = () => {
    setPhotoTaken(true);
  };

  return (
    <div className="p-4 text-center">
      {!photoTaken ? (
        <>
          <h2 className="text-xl mb-2">Taking photo...</h2>
          <video ref={videoRef} autoPlay playsInline className="mx-auto w-full max-w-xs rounded" />
        </>
      ) : (
        <div>
          <h2 className="text-xl font-bold">Chat {chatId}</h2>
          <p className="mt-4">Start chatting below...</p>
        </div>
      )}
    </div>
  );
}

export default Chat;
