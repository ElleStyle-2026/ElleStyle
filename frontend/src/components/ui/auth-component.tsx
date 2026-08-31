import { cn } from "../../lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, createContext, Children } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Mail, Gem, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, User } from "lucide-react";
import { AnimatePresence, motion, useInView, type Variants, type Transition } from "framer-motion";
import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";
import { useGoogleLogin } from '@react-oauth/google';
import { Link } from "react-router-dom";

// --- CONFETTI LOGIC ---
type Api = { fire: (options?: ConfettiOptions) => void }
export type ConfettiRef = Api | null

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & { options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean }>((props, ref) => {
    const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props
    const instanceRef = useRef<ConfettiInstance | null>(null)
    const canvasRef = useCallback((node: HTMLCanvasElement) => {
        if (node !== null) {
            if (instanceRef.current) return
            instanceRef.current = confetti.create(node, { ...globalOptions, resize: true })
        } else {
            if (instanceRef.current) {
                instanceRef.current.reset()
                instanceRef.current = null
            }
        }
    }, [globalOptions])
    const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options])
    const api = useMemo(() => ({ fire }), [fire])
    useImperativeHandle(ref, () => api, [api])
    useEffect(() => { if (!manualstart) fire() }, [manualstart, fire])
    return <canvas ref={canvasRef} {...rest} />
})
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
type TextLoopProps = { children: React.ReactNode[]; className?: string; interval?: number; transition?: Transition; variants?: Variants; onIndexChange?: (index: number) => void; stopOnEnd?: boolean; };
export function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }: TextLoopProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const items = Children.toArray(children);
    useEffect(() => {
        const intervalMs = interval * 1000;
        const timer = setInterval(() => {
            setCurrentIndex((current) => {
                if (stopOnEnd && current === items.length - 1) {
                    clearInterval(timer);
                    return current;
                }
                const next = (current + 1) % items.length;
                onIndexChange?.(next);
                return next;
            });
        }, intervalMs);
        return () => clearInterval(timer);
    }, [items.length, interval, onIndexChange, stopOnEnd]);
    const motionVariants: Variants = {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
    };
    return (
        <div className={cn('relative inline-block whitespace-nowrap', className)}>
            <AnimatePresence mode='popLayout' initial={false}>
                <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
                    {items[currentIndex]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// --- BUILT-IN BLUR FADE ANIMATION COMPONENT ---
interface BlurFadeProps { children: React.ReactNode; className?: string; variant?: { hidden: { y: number }; visible: { y: number } }; duration?: number; delay?: number; yOffset?: number; inView?: boolean; inViewMargin?: any; blur?: string; }
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
    const ref = useRef(null);
    const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
    const isInView = !inView || inViewResult;
    const defaultVariants: Variants = {
        hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
        visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
    };
    const combinedVariants = variant || defaultVariants;
    return (
        <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
            {children}
        </motion.div>
    );
}

// --- BUILT-IN GLASS BUTTON COMPONENT ---
const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } });
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } });
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> { contentClassName?: string; }
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
        const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
            const button = e.currentTarget.querySelector('button');
            if (button && e.target !== button) button.click();
        };
        return (
            <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
                <button className={cn("glass-button relative z-10 w-full", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
                    <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
                </button>
                <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
        );
    }
);
GlassButton.displayName = "GlassButton";

// --- CHILD COMPONENTS ---
const modalStepsSignup = [
    { message: "Signing you up...", icon: <Loader className="w-12 h-12 text-black animate-spin" /> },
    { message: "Onboarding you...", icon: <Loader className="w-12 h-12 text-black animate-spin" /> },
    { message: "Finalizing...", icon: <Loader className="w-12 h-12 text-black animate-spin" /> },
    { message: "Welcome Aboard!", icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];

const modalStepsLogin = [
    { message: "Authenticating...", icon: <Loader className="w-12 h-12 text-black animate-spin" /> },
    { message: "Signing you in...", icon: <Loader className="w-12 h-12 text-black animate-spin" /> },
    { message: "Finalizing...", icon: <Loader className="w-12 h-12 text-black animate-spin" /> },
    { message: "Welcome Back!", icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.5;

const DefaultLogo = () => (<img src="https://res.cloudinary.com/gc1qeznc/image/upload/v1784531072/logo_ellestyle_ierdp3.jpg" alt="ElleStyle" className="h-12 w-auto object-contain rounded-xl shadow-sm" />);

interface AuthComponentProps {
    mode: 'login' | 'signup';
    logo?: React.ReactNode;
    brandName?: string;
    onAuthSubmit: (data: any) => Promise<{ success: boolean; message?: string;[key: string]: any }>;
    onGoogleSuccess: (credentialResponse: any) => void;
    onSuccessRedirect: (status?: string, email?: string) => void;
}

export const AuthComponent = ({ mode, logo = <DefaultLogo />, brandName = "ElleStyle", onAuthSubmit, onGoogleSuccess, onSuccessRedirect }: AuthComponentProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // authStep is only relevant for mode === 'signup'
    const [authStep, setAuthStep] = useState(mode === 'signup' ? 'name' : 'none');
    const [modalStatus, setModalStatus] = useState<'closed' | 'loading' | 'error' | 'success'>('closed');
    const [modalErrorMessage, setModalErrorMessage] = useState('');
    const confettiRef = useRef<ConfettiRef>(null);

    const isNameValid = name.trim().length > 1;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    const isConfirmPasswordValid = confirmPassword.length >= 6;

    const nameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            onGoogleSuccess(tokenResponse);
        },
        onError: () => {
            setModalErrorMessage('Google Login Failed');
            setModalStatus('error');
        }
    });

    const fireSideCanons = () => {
        const fire = confettiRef.current?.fire;
        if (fire) {
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
            const particleCount = 50;
            fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
            fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalStatus !== 'closed') return;
        if (mode === 'signup' && authStep !== 'confirmPassword') return;

        if (mode === 'signup' && password !== confirmPassword) {
            setModalErrorMessage("Passwords do not match!");
            setModalStatus('error');
            return;
        }

        setModalStatus('loading');

        try {
            const result = await onAuthSubmit(mode === 'signup' ? { name, email, password } : { email, password });
            if (result.success) {
                const stepsCount = mode === 'signup' ? modalStepsSignup.length - 1 : modalStepsLogin.length - 1;
                const totalDuration = stepsCount * TEXT_LOOP_INTERVAL * 1000;
                setTimeout(() => {
                    setModalStatus('success');
                    setTimeout(() => {
                        onSuccessRedirect(mode === 'signup' ? 'verify_email' : 'success', email);
                    }, 2000);
                }, totalDuration);
            } else {
                setModalErrorMessage(result.message || 'Authentication failed');
                setModalStatus('error');
            }
        } catch (err: any) {
            setModalErrorMessage(err.message || 'An error occurred');
            setModalStatus('error');
        }
    };

    const handleProgressStep = () => {
        if (mode === 'signup') {
            if (authStep === 'name' && isNameValid) setAuthStep("email");
            else if (authStep === 'email' && isEmailValid) setAuthStep("password");
            else if (authStep === 'password' && isPasswordValid) setAuthStep("confirmPassword");
            else if (authStep === 'confirmPassword' && isConfirmPasswordValid) {
                handleFinalSubmit({ preventDefault: () => { } } as React.FormEvent);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (mode === 'signup') handleProgressStep();
            else handleFinalSubmit(e);
        }
    };

    const handleGoBack = () => {
        if (mode === 'signup') {
            if (authStep === 'confirmPassword') {
                setAuthStep('password');
                setConfirmPassword('');
            }
            else if (authStep === 'password') {
                setAuthStep('email');
                setPassword('');
            }
            else if (authStep === 'email') {
                setAuthStep('name');
            }
        }
    };

    const closeModal = () => {
        setModalStatus('closed');
        setModalErrorMessage('');
    };

    useEffect(() => {
        if (mode === 'signup') {
            if (authStep === 'email') setTimeout(() => emailInputRef.current?.focus(), 500);
            else if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 500);
            else if (authStep === 'confirmPassword') setTimeout(() => confirmPasswordInputRef.current?.focus(), 500);
            else if (authStep === 'name') setTimeout(() => nameInputRef.current?.focus(), 500);
        }
    }, [authStep, mode]);

    useEffect(() => {
        if (modalStatus === 'success') {
            fireSideCanons();
        }
    }, [modalStatus]);

    const Modal = () => {
        const steps = mode === 'signup' ? modalStepsSignup : modalStepsLogin;
        return (
            <AnimatePresence>
                {modalStatus !== 'closed' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white border-4 border-gray-100 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2">
                            {(modalStatus === 'error' || modalStatus === 'success') && <button type="button" onClick={closeModal} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-black transition-colors"><X className="w-5 h-5" /></button>}
                            {modalStatus === 'error' && <>
                                <AlertCircle className="w-12 h-12 text-red-500" />
                                <p className="text-lg font-medium text-black text-center">{modalErrorMessage}</p>
                                <GlassButton type="button" onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
                            </>}
                            {modalStatus === 'loading' &&
                                <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                                    {steps.slice(0, -1).map((step, i) =>
                                        <div key={i} className="flex flex-col items-center gap-4">
                                            {step.icon}
                                            <p className="text-lg font-medium text-black">{step.message}</p>
                                        </div>
                                    )}
                                </TextLoop>
                            }
                            {modalStatus === 'success' &&
                                <div className="flex flex-col items-center gap-4">
                                    {steps[steps.length - 1].icon}
                                    <p className="text-lg font-medium text-black">{steps[steps.length - 1].message}</p>
                                </div>
                            }
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    return (
        <div className="bg-white min-h-screen w-screen flex flex-col relative">
            <style>{`
            input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; } input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; } input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: black !important; background-color: transparent !important; background-clip: content-box !important; transition: background-color 5000s ease-in-out 0s !important; color: black !important; caret-color: black !important; } input:autofill { background-color: transparent !important; background-clip: content-box !important; -webkit-text-fill-color: black !important; color: black !important; } input:-internal-autofill-selected { background-color: transparent !important; background-image: none !important; color: black !important; -webkit-text-fill-color: black !important; } input:-webkit-autofill::first-line { color: black !important; -webkit-text-fill-color: black !important; }
            @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; } @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
            .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); width: 100%; } .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); } .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); pointer-events: none; z-index: 0; } .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
            .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05)); box-shadow: inset 0 0.125em 0.125em rgba(0,0,0,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.25em 0.125em -0.125em rgba(0,0,0,0.2), 0 0 0.1em 0.25em inset rgba(255,255,255,0.2), 0 0 0 0 rgba(255,255,255,1); } .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em rgba(0,0,0,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.15em 0.05em -0.1em rgba(0,0,0,0.25), 0 0 0.05em 0.1em inset rgba(255,255,255,0.5), 0 0 0 0 rgba(255,255,255,1); } .glass-button-text { color: rgba(0,0,0,0.9); text-shadow: 0em 0.25em 0.05em rgba(0,0,0,0.1); transition: all var(--anim-time) var(--anim-ease); width: 100%; display: flex; justify-content: center; } .glass-button:hover .glass-button-text { text-shadow: 0.025em 0.025em 0.025em rgba(0,0,0,0.12); } .glass-button-text::after { content: ""; display: block; position: absolute; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, rgba(255,255,255,0.5) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(var(--anim-time) * 1.25) var(--anim-ease), --angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease); } .glass-button:hover .glass-button-text::after { background-position: 25% 50%; } .glass-button:active .glass-button-text::after { background-position: 50% 15%; --angle-2: -15deg; } .glass-button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(0,0,0,0.5) 0%, transparent 5% 40%, rgba(0,0,0,0.5) 50%, transparent 60% 95%, rgba(0,0,0,0.5) 100%), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255,255,255,0.5); pointer-events: none; } .glass-button:hover::after { --angle-1: -125deg; } .glass-button:active::after { --angle-1: -75deg; } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.875em); opacity: 1; } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.5em); opacity: 0.75; } .glass-button-wrap:has(.glass-button:active) .glass-button-text { text-shadow: 0.025em 0.25em 0.05em rgba(0,0,0,0.12); } .glass-button-wrap:has(.glass-button:active) .glass-button { box-shadow: inset 0 0.125em 0.125em rgba(0,0,0,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.125em 0.125em -0.125em rgba(0,0,0,0.2), 0 0 0.1em 0.25em inset rgba(255,255,255,0.2), 0 0.225em 0.05em 0 rgba(0,0,0,0.05), 0 0.25em 0 0 rgba(255,255,255,0.75), inset 0 0.25em 0.05em 0 rgba(0,0,0,0.15); } @media (hover: none) and (pointer: coarse) { .glass-button::after, .glass-button:hover::after, .glass-button:active::after { --angle-1: -75deg; } .glass-button .glass-button-text::after, .glass-button:active .glass-button-text::after { --angle-2: -45deg; } }
            .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; } .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05)); box-shadow: inset 0 0.125em 0.125em rgba(0,0,0,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.25em 0.125em -0.125em rgba(0,0,0,0.2), 0 0 0.1em 0.25em inset rgba(255,255,255,0.2), 0 0 0 0 rgba(255,255,255,1); } .glass-input-wrap:focus-within .glass-input { backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em rgba(0,0,0,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.15em 0.05em -0.1em rgba(0,0,0,0.25), 0 0 0.05em 0.1em inset rgba(255,255,255,0.5), 0 0 0 0 rgba(255,255,255,1); } .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + clamp(1px, 0.0625em, 4px)); height: calc(100% + clamp(1px, 0.0625em, 4px)); top: calc(0% - clamp(1px, 0.0625em, 4px) / 2); left: calc(0% - clamp(1px, 0.0625em, 4px) / 2); padding: clamp(1px, 0.0625em, 4px); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(0,0,0,0.5) 0%, transparent 5% 40%, rgba(0,0,0,0.5) 50%, transparent 60% 95%, rgba(0,0,0,0.5) 100%), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(clamp(1px, 0.0625em, 4px) / 2) rgba(255,255,255,0.5); pointer-events: none; } .glass-input-wrap:focus-within .glass-input::after { --angle-1: -125deg; } .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; } .glass-input-text-area::after { content: ""; display: block; position: absolute; width: calc(100% - clamp(1px, 0.0625em, 4px)); height: calc(100% - clamp(1px, 0.0625em, 4px)); top: calc(0% + clamp(1px, 0.0625em, 4px) / 2); left: calc(0% + clamp(1px, 0.0625em, 4px) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, rgba(255,255,255,0.5) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1), --angle-2 calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1); } .glass-input-wrap:focus-within .glass-input-text-area::after { background-position: 25% 50%; }
            .google-glass-btn .glass-button { background: #03989E !important; box-shadow: inset 0 0.125em 0.125em rgba(0,0,0,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.2), 0 0.25em 0.125em -0.125em rgba(0,0,0,0.2), 0 0 0.1em 0.25em inset rgba(255,255,255,0.1), 0 0 0 0 rgba(3,152,158,1) !important; border: 1px solid rgba(255,255,255,0.2) !important; } .google-glass-btn .glass-button-text { color: white !important; }
        `}</style>

            <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
            <Modal />

            <div className="absolute inset-0 z-0 overflow-hidden bg-white/20">
                <img src="https://res.cloudinary.com/gc1qeznc/image/upload/v1787972485/bg-login_lpffi5.jpg" alt="Background" className="w-full h-full object-cover blur-[60px] scale-125 opacity-80" />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[20px]"></div>
            </div>

            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                <Link to="/">{logo}</Link>
            </div>

            <div className={cn("flex w-full flex-1 h-full items-center justify-center", "relative overflow-hidden")}>
                <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-8 w-[320px] sm:w-[380px] mx-auto p-4 pt-10">
                    {mode === 'login' ? (
                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex flex-col items-center gap-4 mb-8">
                                <BlurFade delay={0.1} className="w-full">
                                    <div className="text-center">
                                        <p className="font-serif font-light text-4xl sm:text-5xl md:text-5xl tracking-tight text-black whitespace-nowrap">Welcome Back</p>
                                    </div>
                                </BlurFade>
                                <BlurFade delay={0.2}>
                                    <p className="text-sm font-medium text-black/60">Sign in to your account</p>
                                </BlurFade>
                            </div>

                            <form onSubmit={handleFinalSubmit} className="w-full px-2 space-y-4">
                                <BlurFade delay={0.3} className="w-full space-y-4">
                                    <div className="glass-input-wrap w-full">
                                        <div className="glass-input">
                                            <span className="glass-input-text-area"></span>
                                            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                                <Mail className="h-5 w-5 text-black/60 flex-shrink-0" />
                                            </div>
                                            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="relative z-10 h-10 flex-grow bg-transparent text-black placeholder:text-black/50 focus:outline-none pr-4" />
                                        </div>
                                    </div>

                                    <div className="glass-input-wrap w-full">
                                        <div className="glass-input">
                                            <span className="glass-input-text-area"></span>
                                            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="text-black/60 hover:text-black transition-colors p-1 rounded-full">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="relative z-10 h-10 flex-grow bg-transparent text-black placeholder:text-black/50 focus:outline-none pr-4" />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <GlassButton type="submit" size="default" className="w-full">Sign In</GlassButton>
                                    </div>
                                </BlurFade>

                                <BlurFade delay={0.4} className="w-full">
                                    <div className="flex items-center w-full gap-2 py-4">
                                        <hr className="w-full border-black/10" />
                                        <span className="text-xs font-semibold text-black/40">OR</span>
                                        <hr className="w-full border-black/10" />
                                    </div>

                                    <div className="flex items-center justify-center w-full">
                                        <div className="w-full">
                                            <GlassButton type="button" onClick={() => loginWithGoogle()} className="w-full google-glass-btn flex items-center justify-center gap-3">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                                Sign in with Google
                                            </GlassButton>
                                        </div>
                                    </div>

                                    <div className="pt-6 text-center">
                                        <p className="text-sm text-black/60">
                                            Don't have an account? <Link to="/signup" className="text-black font-semibold hover:underline">Create Account</Link>
                                        </p>
                                    </div>
                                </BlurFade>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {authStep === "name" && <motion.div key="name-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                                    <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-black whitespace-nowrap">Join Us</p></div></BlurFade>
                                    <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-black/60">What should we call you?</p></BlurFade>
                                </motion.div>}

                                {authStep === "email" && <motion.div key="email-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                                    <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-black whitespace-nowrap">Your Email</p></div></BlurFade>
                                    <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-black/60">Enter your email address to continue.</p></BlurFade>
                                </motion.div>}

                                {authStep === "password" && <motion.div key="password-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                                    <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-black whitespace-nowrap">Create password</p></div></BlurFade>
                                    <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-black/60">Your password must be at least 6 characters long.</p></BlurFade>
                                </motion.div>}

                                {authStep === "confirmPassword" && <motion.div key="confirm-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                                    <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-black whitespace-nowrap">One Last Step</p></div></BlurFade>
                                    <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-black/60">Confirm your password to continue</p></BlurFade>
                                </motion.div>}
                            </AnimatePresence>

                            <form onSubmit={(e) => e.preventDefault()} className="w-full px-2 mt-8 space-y-6">
                                <AnimatePresence>
                                    {authStep !== 'confirmPassword' && <motion.div key="email-password-fields" exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full space-y-6">
                                        <AnimatePresence>
                                            {authStep === "name" && <BlurFade key="name-field" className="w-full">
                                                <div className="relative w-full">
                                                    <div className="glass-input-wrap w-full"><div className="glass-input">
                                                        <span className="glass-input-text-area"></span>
                                                        <div className={cn("relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out", name.length > 20 && authStep === 'name' ? "w-0 px-0" : "w-10 pl-2")}><User className="h-5 w-5 text-black/60 flex-shrink-0" /></div>
                                                        <input ref={nameInputRef} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} className={cn("relative z-10 h-10 w-0 flex-grow bg-transparent text-black placeholder:text-black/50 focus:outline-none transition-[padding-right] duration-300 ease-in-out delay-300", isNameValid && authStep === 'name' ? "pr-2" : "pr-0")} />
                                                        <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isNameValid && authStep === 'name' ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Continue" contentClassName="text-black/80 hover:text-black"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                                    </div></div>
                                                </div>
                                            </BlurFade>}
                                        </AnimatePresence>

                                        <BlurFade delay={authStep === 'email' ? 0.25 * 5 : 0} inView={true} className={cn("w-full", authStep !== 'email' && authStep !== 'password' ? "hidden" : "block")}>
                                            <div className="relative w-full">
                                                <AnimatePresence>
                                                    {authStep === "password" && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.4 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-black/60 font-semibold">Email</label></motion.div>}
                                                </AnimatePresence>
                                                <div className="glass-input-wrap w-full"><div className="glass-input">
                                                    <span className="glass-input-text-area"></span>
                                                    <div className={cn("relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out", email.length > 20 && authStep === 'email' ? "w-0 px-0" : "w-10 pl-2")}><Mail className="h-5 w-5 text-black/60 flex-shrink-0" /></div>
                                                    <input ref={emailInputRef} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={cn("relative z-10 h-10 w-0 flex-grow bg-transparent text-black placeholder:text-black/50 focus:outline-none transition-[padding-right] duration-300 ease-in-out delay-300", isEmailValid && authStep === 'email' ? "pr-2" : "pr-0")} />
                                                    <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isEmailValid && authStep === 'email' ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Continue" contentClassName="text-black/80 hover:text-black"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                                </div></div>
                                            </div>
                                            <BlurFade inView delay={0.2} className={authStep === 'email' ? 'block' : 'hidden'}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                                        </BlurFade>

                                        <AnimatePresence>
                                            {authStep === "password" && <BlurFade key="password-field" className="w-full">
                                                <div className="relative w-full">
                                                    <AnimatePresence>
                                                        {password.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-black/60 font-semibold">Password</label></motion.div>}
                                                    </AnimatePresence>
                                                    <div className="glass-input-wrap w-full"><div className="glass-input">
                                                        <span className="glass-input-text-area"></span>
                                                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                                            {isPasswordValid ? <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="text-black/60 hover:text-black transition-colors p-2 rounded-full">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button> : <Lock className="h-5 w-5 text-black/60 flex-shrink-0" />}
                                                        </div>
                                                        <input ref={passwordInputRef} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-10 w-0 flex-grow bg-transparent text-black placeholder:text-black/50 focus:outline-none" />
                                                        <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isPasswordValid ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Submit" contentClassName="text-black/80 hover:text-black"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                                    </div></div>
                                                </div>
                                                <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                                            </BlurFade>}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {authStep === 'name' && (
                                                <BlurFade delay={0.4} className="w-full">
                                                    <div className="flex items-center w-full gap-2 py-4">
                                                        <hr className="w-full border-black/10" />
                                                        <span className="text-xs font-semibold text-black/40">OR</span>
                                                        <hr className="w-full border-black/10" />
                                                    </div>

                                                    <div className="flex items-center justify-center w-full">
                                                        <div className="w-full">
                                                            <GlassButton type="button" onClick={() => loginWithGoogle()} className="w-full google-glass-btn flex items-center justify-center gap-3">
                                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                                                Sign up with Google
                                                            </GlassButton>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 text-center">
                                                        <p className="text-sm text-black/60">
                                                            Already have an account? <Link to="/login" className="text-black font-semibold hover:underline">Log in</Link>
                                                        </p>
                                                    </div>
                                                </BlurFade>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {authStep === 'confirmPassword' && <BlurFade key="confirm-password-field" className="w-full">
                                        <div className="relative w-full">
                                            <AnimatePresence>
                                                {confirmPassword.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-black/60 font-semibold">Confirm Password</label></motion.div>}
                                            </AnimatePresence>
                                            <div className="glass-input-wrap w-full"><div className="glass-input">
                                                <span className="glass-input-text-area"></span>
                                                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                                    {isConfirmPasswordValid ? <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-black/60 hover:text-black transition-colors p-2 rounded-full">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button> : <Lock className="h-5 w-5 text-black/60 flex-shrink-0" />}
                                                </div>
                                                <input ref={confirmPasswordInputRef} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-10 w-0 flex-grow bg-transparent text-black placeholder:text-black/50 focus:outline-none" />
                                                <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isConfirmPasswordValid ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Finish sign-up" contentClassName="text-black/80 hover:text-black"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                            </div></div>
                                        </div>
                                        <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                                    </BlurFade>}
                                </AnimatePresence>
                            </form>
                        </div>
                    )}
                </fieldset>
            </div>
        </div>
    );
};
