// text-formation-framework.js
class TextFormationFramework {
  constructor(options = {}) {
    this.options = {
      defaultFontFamily: 'Inter',
      defaultFontSize: 'base',
      defaultColor: 'primary',
      enableAnimations: true,
      autoInit: true,
      ...options
    };
    
    this.initialized = false;
    this.animations = new Map();
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  init() {
    if (this.initialized) return;
    
    this.setupGlobalStyles();
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupEventListeners();
    this.enhanceTextElements();
    
    this.initialized = true;
    console.log('Text Formation Framework initialized');
  }
  
  setupGlobalStyles() {
    // Add global styles for enhanced text rendering
    const style = document.createElement('style');
    style.textContent = `
      .tf-enhanced {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .tf-smooth-transition {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .tf-parallax-text {
        transform: translateZ(0);
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }
  
  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleElementInViewport(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
  }
  
  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        this.handleElementResize(entry.target);
      });
    });
  }
  
  setupEventListeners() {
    // Handle font loading
    document.fonts.ready.then(() => {
      this.handleFontsLoaded();
    });
    
    // Handle prefers-reduced-motion
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
      this.reduceMotion = e.matches;
      this.toggleAnimations(!this.reduceMotion);
    });
  }
  
  enhanceTextElements() {
    // Enhance all text elements with tf- classes
    const textElements = document.querySelectorAll('[class*="tf-"]');
    
    textElements.forEach(element => {
      this.enhanceTextElement(element);
    });
    
    // Observe elements for animations
    const animatedElements = document.querySelectorAll('[data-tf-animate]');
    animatedElements.forEach(element => {
      this.intersectionObserver.observe(element);
    });
    
    // Observe responsive text elements
    const responsiveElements = document.querySelectorAll('[data-tf-responsive]');
    responsiveElements.forEach(element => {
      this.resizeObserver.observe(element);
    });
  }
  
  enhanceTextElement(element) {
    // Add enhanced rendering class
    element.classList.add('tf-enhanced');
    
    // Handle specific text effects
    if (element.classList.contains('tf-typewriter')) {
      this.setupTypewriterEffect(element);
    }
    
    if (element.classList.contains('tf-parallax-text')) {
      this.setupParallaxEffect(element);
    }
    
    if (element.hasAttribute('data-tf-gradient')) {
      this.applyCustomGradient(element);
    }
    
    if (element.hasAttribute('data-tf-animate')) {
      this.setupCustomAnimation(element);
    }
  }
  
  setupTypewriterEffect(element) {
    if (this.reduceMotion) return;
    
    const text = element.textContent;
    element.textContent = '';
    element.style.width = '0';
    
    let i = 0;
    const typewriter = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typewriter);
        element.style.borderRight = 'none';
      }
    }, 100);
  }
  
  setupParallaxEffect(element) {
    if (this.reduceMotion) return;
    
    const speed = parseFloat(element.getAttribute('data-tf-parallax-speed') || '0.5');
    
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      element.style.transform = `translateY(${rate}px)`;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Store cleanup function
    this.animations.set(element, () => {
      window.removeEventListener('scroll', handleScroll);
    });
  }
  
  applyCustomGradient(element) {
    const gradient = element.getAttribute('data-tf-gradient');
    if (gradient) {
      element.style.background = gradient;
      element.style.webkitBackgroundClip = 'text';
      element.style.backgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
    }
  }
  
  setupCustomAnimation(element) {
    if (this.reduceMotion) return;
    
    const animationName = element.getAttribute('data-tf-animate');
    const duration = element.getAttribute('data-tf-duration') || '0.8s';
    const delay = element.getAttribute('data-tf-delay') || '0s';
    
    element.style.animation = `${animationName} ${duration} ease-out ${delay} both`;
  }
  
  handleElementInViewport(element) {
    if (this.reduceMotion) return;
    
    const animation = element.getAttribute('data-tf-animate');
    if (animation) {
      element.style.animationPlayState = 'running';
    }
  }
  
  handleElementResize(element) {
    // Adjust text size based on container width
    const containerWidth = element.offsetWidth;
    const baseSize = parseFloat(getComputedStyle(element).fontSize);
    
    if (containerWidth < 400) {
      element.style.fontSize = `${baseSize * 0.8}px`;
    } else if (containerWidth > 1200) {
      element.style.fontSize = `${baseSize * 1.2}px`;
    } else {
      element.style.fontSize = '';
    }
  }
  
  handleFontsLoaded() {
    // Trigger font loading animations
    document.body.classList.add('tf-fonts-loaded');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('tf:fontsLoaded'));
  }
  
  toggleAnimations(enabled) {
    const animatedElements = document.querySelectorAll('[data-tf-animate]');
    
    animatedElements.forEach(element => {
      if (enabled) {
        element.style.animationPlayState = 'running';
      } else {
        element.style.animationPlayState = 'paused';
      }
    });
  }
  
  // Public API Methods
  createTextElement(options = {}) {
    const element = document.createElement(options.tag || 'span');
    
    // Apply classes
    if (options.classes) {
      element.className = options.classes.join(' ');
    }
    
    // Apply styles
    if (options.styles) {
      Object.assign(element.style, options.styles);
    }
    
    // Set content
    if (options.content) {
      element.textContent = options.content;
    }
    
    // Set attributes
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    // Enhance the element
    this.enhanceTextElement(element);
    
    return element;
  }
  
  applyTextEffect(element, effect, options = {}) {
    const effects = {
      '3d': () => this.apply3DEffect(element, options),
      'neon': () => this.applyNeonEffect(element, options),
      'outline': () => this.applyOutlineEffect(element, options),
      'gradient': () => this.applyGradientEffect(element, options),
      'shadow': () => this.applyShadowEffect(element, options)
    };
    
    if (effects[effect]) {
      effects[effect]();
    }
  }
  
  apply3DEffect(element, options) {
    const depth = options.depth || 5;
    const color = options.color || '#2c3e50';
    
    let shadow = '';
    for (let i = 1; i <= depth; i++) {
      shadow += `0 ${i}px 0 ${this.adjustColor(color, -i * 10)}${i === depth ? '' : ', '}`;
    }
    
    element.style.textShadow = shadow;
    element.style.color = color;
  }
  
  applyNeonEffect(element, options) {
    const color = options.color || '#3498db';
    const intensity = options.intensity || 1;
    
    element.style.color = '#fff';
    element.style.textShadow = `
      0 0 ${5 * intensity}px #fff,
      0 0 ${10 * intensity}px #fff,
      0 0 ${15 * intensity}px ${color},
      0 0 ${20 * intensity}px ${color},
      0 0 ${25 * intensity}px ${color}
    `;
  }
  
  applyOutlineEffect(element, options) {
    const width = options.width || '1px';
    const color = options.color || '#2c3e50';
    
    element.style.color = 'transparent';
    element.style.webkitTextStroke = `${width} ${color}`;
  }
  
  applyGradientEffect(element, options) {
    const gradient = options.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    element.style.background = gradient;
    element.style.webkitBackgroundClip = 'text';
    element.style.backgroundClip = 'text';
    element.style.webkitTextFillColor = 'transparent';
  }
  
  applyShadowEffect(element, options) {
    const blur = options.blur || '10px';
    const color = options.color || 'rgba(0, 0, 0, 0.3)';
    const offsetX = options.offsetX || '0';
    const offsetY = options.offsetY || '4px';
    
    element.style.textShadow = `${offsetX} ${offsetY} ${blur} ${color}`;
  }
  
  animateText(element, animation, options = {}) {
    if (this.reduceMotion) return;
    
    const duration = options.duration || '0.8s';
    const delay = options.delay || '0s';
    
    element.style.animation = `${animation} ${duration} ease-out ${delay} both`;
    
    // Store animation for cleanup
    this.animations.set(element, () => {
      element.style.animation = '';
    });
  }
  
  // Utility methods
  adjustColor(color, amount) {
    let usePound = false;
    
    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }
    
    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    
    let b = ((num >> 8) & 0x00FF) + amount;
    
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    
    let g = (num & 0x0000FF) + amount;
    
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }
  
  // Cleanup method
  destroy() {
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
    
    // Clean up animations
    this.animations.forEach((cleanup, element) => {
      cleanup();
    });
    
    this.animations.clear();
    this.initialized = false;
  }
}

// Plugin system for extending functionality
TextFormationFramework.plugins = new Map();

TextFormationFramework.registerPlugin = function(name, plugin) {
  this.plugins.set(name, plugin);
};

TextFormationFramework.loadPlugin = function(name, instance) {
  const plugin = this.plugins.get(name);
  if (plugin) {
    plugin(instance);
  }
};

// Default plugins
TextFormationFramework.registerPlugin('morphing', (tff) => {
  tff.applyMorphingEffect = function(element, options = {}) {
    const duration = options.duration || 2000;
    const shapes = options.shapes || ['circle', 'square', 'triangle'];
    
    let currentShape = 0;
    
    setInterval(() => {
      element.style.clipPath = this.getShapePath(shapes[currentShape]);
      currentShape = (currentShape + 1) % shapes.length;
    }, duration);
  };
  
  tff.getShapePath = function(shape) {
    const paths = {
      circle: 'circle(50% at 50% 50%)',
      square: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)'
    };
    
    return paths[shape] || paths.circle;
  };
});

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextFormationFramework;
} else if (typeof define === 'function' && define.amd) {
  define([], () => TextFormationFramework);
} else {
  window.TextFormationFramework = TextFormationFramework;
}

// Auto-initialize if script is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.TFF_AUTO_INIT !== false) {
    window.tff = new TextFormationFramework();
  }
});
