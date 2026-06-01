/**
 * Motion Theme System for EduSync ERP
 * Provides consistent animations and transitions across the application
 */

// Animation variants for different components
export const motionVariants = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  },

  // Slide animations
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Modal animations
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },

  // List animations
  listContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },

  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  },

  // Card animations
  cardHover: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { scale: 0.98 }
  },

  // Button animations
  buttonTap: {
    tap: { scale: 0.95 },
    transition: { duration: 0.1 }
  },

  // Sidebar animations
  sidebarExpanded: {
    width: 240,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  sidebarCollapsed: {
    width: 64,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Toast/Notification animations
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Dropdown animations
  dropdown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  },

  // Collapse/Expand animations
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  }
};

// Easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 }
};

// Hover effects
export const hoverEffects = {
  lift: {
    whileHover: { y: -4, transition: { duration: 0.2 } }
  },
  scale: {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } }
  },
  glow: {
    whileHover: { 
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.2 }
    }
  }
};

// Loading animations
export const loadingVariants = {
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  dots: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

// Utility function to create custom variants
export const createVariant = (config) => {
  return {
    initial: config.initial || {},
    animate: config.animate || {},
    exit: config.exit || {},
    transition: config.transition || { duration: 0.3 }
  };
};

export default motionVariants;
