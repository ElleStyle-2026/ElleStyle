import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, PartyPopper, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) return;

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token in request URL.');
      return;
    }

    hasVerifiedRef.current = true;

    const verify = async () => {
      try {
        const data = await authService.verifyEmail(token);
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          if (data.user && data.accessToken) {
            login(data.user, data.accessToken);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email token.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during email verification.');
      }
    };

    verify();
  }, [token, login]);

  return (
    <div className="bg-white min-h-screen w-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-white/20">
          <img src="https://res.cloudinary.com/gc1qeznc/image/upload/v1787972485/bg-login_lpffi5.jpg" alt="Background" className="w-full h-full object-cover blur-[60px] scale-125 opacity-80" />
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[20px]"></div>
      </div>

      {/* Logo */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
          <Link to="/">
              <img src="https://res.cloudinary.com/gc1qeznc/image/upload/v1784531072/logo_ellestyle_ierdp3.jpg" alt="ElleStyle" className="h-12 w-auto object-contain rounded-xl shadow-sm" />
          </Link>
      </div>

      <div className="relative z-10 flex w-full flex-1 h-full items-center justify-center p-4">
        <AnimatePresence mode="wait">
            <motion.div 
                key={status}
                initial={{ scale: 0.9, opacity: 0, y: 10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: -10 }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6 mx-2 text-center"
            >
              {status === 'loading' && (
                <>
                  <Loader className="w-12 h-12 text-black animate-spin" />
                  <div>
                    <h2 className="text-2xl font-serif font-light tracking-tight text-black mb-2">Verifying...</h2>
                    <p className="text-sm font-medium text-black/60">Please wait while we verify your account.</p>
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <PartyPopper className="w-12 h-12 text-green-500" />
                  <div>
                    <h2 className="text-2xl font-serif font-light tracking-tight text-black mb-2">Verified!</h2>
                    <p className="text-sm font-medium text-black/60">{message}</p>
                  </div>
                  <div className="w-full flex flex-col gap-3 pt-4">
                    <button onClick={() => navigate('/')} className="w-full h-12 rounded-full bg-black text-white font-semibold hover:bg-black/80 transition-colors shadow-md">
                      Go to Homepage
                    </button>
                    <Link to="/account/profile" className="w-full h-12 rounded-full border border-black/10 flex items-center justify-center text-black font-semibold hover:bg-black/5 transition-colors">
                      View Profile
                    </Link>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div>
                    <h2 className="text-2xl font-serif font-light tracking-tight text-black mb-2">Oops!</h2>
                    <p className="text-sm font-medium text-black/60">{message}</p>
                  </div>
                  <div className="w-full flex flex-col gap-3 pt-4">
                    <Link to="/login" className="w-full h-12 rounded-full bg-black text-white font-semibold flex items-center justify-center hover:bg-black/80 transition-colors shadow-md">
                      Return to Login
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
