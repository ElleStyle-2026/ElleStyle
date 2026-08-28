import React from 'react';
import type { Toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertCircle, Info, Loader2, Image as ImageIcon, X } from 'lucide-react';
import type { ToastPayload } from '../../lib/toastTypes';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CustomToastProps {
  t: Toast;
  payload: ToastPayload;
  onDismiss: (id: string) => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({ t, payload, onDismiss }) => {
  const animationClass = t.visible 
    ? 'animate-toast-enter' 
    : 'animate-toast-leave';

  const renderVisual = () => {
    if (payload.image) {
      return (
        <div className="flex-shrink-0 w-11 h-11 rounded-[10px] overflow-hidden bg-gray-800 border border-white/10 flex items-center justify-center">
          <img 
            src={payload.image} 
            alt="Notification" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ''; // Fallback handled by CSS/Icon if broken
              (e.target as HTMLImageElement).classList.add('hidden');
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <ImageIcon className="hidden w-5 h-5 text-gray-500 absolute" />
        </div>
      );
    }
    
    if (payload.icon) {
      return (
        <div className="flex-shrink-0 w-11 h-11 rounded-[10px] bg-black/20 border border-white/20 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          {payload.icon}
        </div>
      );
    }

    // Default icons based on type
    let DefaultIcon = Info;
    let iconColor = 'text-white';
    let bgColor = 'bg-white/20 border-white/30';

    if (payload.type === 'success') {
      DefaultIcon = CheckCircle2;
      iconColor = 'text-white';
      bgColor = 'bg-white/20 border-white/30';
    } else if (payload.type === 'error') {
      DefaultIcon = AlertCircle;
      iconColor = 'text-white';
      bgColor = 'bg-red-400/40 border-red-400/50';
    } else if (payload.type === 'warning') {
      DefaultIcon = AlertCircle;
      iconColor = 'text-white';
      bgColor = 'bg-amber-400/40 border-amber-400/50';
    } else if (payload.type === 'loading') {
      DefaultIcon = Loader2;
      iconColor = 'text-white';
      bgColor = 'bg-white/20 border-white/30';
    }

    return (
      <div className={cn("flex-shrink-0 w-11 h-11 rounded-[10px] flex items-center justify-center border", bgColor, iconColor)}>
        <DefaultIcon className={cn("w-5 h-5", payload.type === 'loading' && "animate-spin")} />
      </div>
    );
  };

  return (
    <div
      {...t.ariaProps}
      className={cn(
        "pointer-events-auto flex items-center w-full max-w-sm sm:max-w-[420px] rounded-[2rem] p-2 pr-4 shadow-2xl backdrop-blur-xl",
        "bg-[#03989E]/85 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.15)]",
        animationClass
      )}
    >
      {/* Visual Area (Left) */}
      <div className="flex-shrink-0 pl-1 py-1">
        {renderVisual()}
      </div>

      {/* Content Area (Center) */}
      <div className="ml-3 flex-1 flex flex-col justify-center min-w-0 pr-2">
        <p className="text-[14px] font-semibold text-white truncate">
          {payload.title}
        </p>
        {payload.message && (
          <p className="text-[13px] text-white/85 truncate mt-0.5">
            {payload.message}
          </p>
        )}
      </div>

      {/* Dismiss Button (Right) */}
      <div className="flex-shrink-0">
        <button
          onClick={() => onDismiss(t.id)}
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors focus:outline-none"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
