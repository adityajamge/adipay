import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

const SLIDES = [
  {
    id: 0,
    title: 'Send money instantly',
    subtitle: 'Secure. Fast. Simple.',
    shape1: 'bg-brand-primary',
    shape2: 'bg-accent-receive',
  },
  {
    id: 1,
    title: 'Split bills with friends',
    subtitle: 'No more tracking who owes what.',
    shape1: 'bg-accent-warning',
    shape2: 'bg-brand-primary',
  },
  {
    id: 2,
    title: 'Bank-grade security',
    subtitle: 'Your money is always protected.',
    shape1: 'bg-accent-send',
    shape2: 'bg-accent-receive',
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function OnboardingPage() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < SLIDES.length) {
      setDirection(newDirection);
      setPage(newPage);
    }
  };

  const handleGetStarted = () => navigate('/signup');
  const handleLogin = () => navigate('/login');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-primary text-text-primary selection:bg-brand-primary/30">
      {/* 60% Height - Illustration Area */}
      <div className="relative flex h-[60%] w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-b-3xl bg-bg-secondary p-8 shadow-2xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Abstract Gradient Mesh Representation */}
            <div className="relative h-64 w-64">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute left-0 top-0 h-48 w-48 rounded-full opacity-50 mix-blend-screen blur-3xl filter ${SLIDES[page].shape1}`}
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className={`absolute bottom-0 right-0 h-48 w-48 rounded-full opacity-50 mix-blend-screen blur-3xl filter ${SLIDES[page].shape2}`}
              />

              {/* Glass Element Mock Illustration inside */}
              <div className="glass-panel absolute inset-4 flex items-center justify-center rounded-2xl border-white/10 bg-white/5 shadow-xl backdrop-blur-md">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-white/20 shadow-inner">
                  <div className={`h-8 w-8 rounded-full ${SLIDES[page].shape1} opacity-80 shadow-lg`} />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 40% Height - Text & Controls Area */}
      <div className="flex h-[40%] flex-col justify-between px-6 pb-10 pt-8">
        {/* Text Area */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-3 font-heading text-3xl font-bold tracking-tight text-white">
                {SLIDES[page].title}
              </h1>
              <p className="font-body text-base text-text-secondary leading-relaxed px-4">
                {SLIDES[page].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="my-6 flex justify-center space-x-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== page) {
                  setDirection(index > page ? 1 : -1);
                  setPage(index);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === page ? 'w-8 bg-brand-primary' : 'w-2 bg-text-tertiary hover:bg-text-secondary'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col space-y-3"
        >
          <button
            onClick={handleGetStarted}
            className="w-full rounded-xl bg-brand-primary py-4 font-body text-lg font-semibold text-white shadow-[0_4px_14px_0_rgba(66,133,244,0.39)] transition-transform active:scale-95 hover:bg-blue-600"
          >
            Get Started
          </button>
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-transparent py-4 font-body text-lg font-medium text-text-secondary transition-colors active:bg-white/5 active:text-white hover:text-white"
          >
            I have an account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
