import React from 'react';

export const FloatingWhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/message/UMVDCVPXPTNWN1"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center transition-all duration-300 hover:scale-110 rounded-[50px]"
      title="Chat with us on WhatsApp"
      aria-label="Chat with us on WhatsApp"
    >
      <img
        src="https://static.vecteezy.com/system/resources/previews/013/901/824/non_2x/whatsapp-icon-ios-whatsapp-social-media-logo-on-white-background-free-free-vector.jpg"
        alt="WhatsApp"
        className="w-16 h-16 object-contain"
        style={{
          mixBlendMode: 'multiply',
          filter: 'brightness(1.1) contrast(1.2)'
        }}
      />
    </a>
  );
};
