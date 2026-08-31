import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email || '';

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
                initial={{ scale: 0.9, opacity: 0, y: 10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6 mx-2 text-center"
            >
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-2">
                <Mail className="w-8 h-8 text-black" />
              </div>
              
              <div>
                <h2 className="text-3xl font-serif font-light tracking-tight text-black mb-3">Check your email</h2>
                <p className="text-sm font-medium text-black/60 mb-2">
                  We've sent a verification link to:
                </p>
                {email && (
                  <p className="text-base font-semibold text-black mb-4">{email}</p>
                )}
                <p className="text-sm font-medium text-black/60">
                  Click the link in the email to verify your account and continue.
                </p>
              </div>

              <div className="w-full flex flex-col gap-3 pt-4">
                <a 
                  href="https://mail.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full h-12 rounded-full bg-[#03989E] text-white font-semibold hover:bg-[#03989E]/90 transition-colors shadow-md flex items-center justify-center"
                >
                  Verify Email
                </a>
                
                <Link to="/login" className="w-full h-12 rounded-full border border-black/10 flex items-center justify-center text-black font-semibold hover:bg-black/5 transition-colors">
                  Back to login
                </Link>
              </div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
