import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export const ToastProvider = () => {
  const [position, setPosition] = useState<'top-center' | 'top-right'>('top-right');

  useEffect(() => {
    const handleResize = () => {
      setPosition(window.innerWidth < 768 ? 'top-center' : 'top-right');
    };
    handleResize(); // initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Toaster
      position={position}
      toastOptions={{
        className: '',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
      containerClassName="toast-container"
      containerStyle={{
        top: 20,
        left: 20,
        bottom: 20,
        right: 20,
      }}
    />
  );
};
