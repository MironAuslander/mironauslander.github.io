// Mobile navigation
class MobileNav {
  constructor() {
    this.init();
  }
  
  init() {
    this.menuToggle = document.querySelector('.menu-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.bindEvents();
  }
  
  bindEvents() {
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', () => {
        this.toggleMenu();
      });
    }
    
    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });
  }
  
  toggleMenu() {
    this.menuToggle.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    
    // Update aria-expanded
    const expanded = this.navMenu.classList.contains('active');
    this.menuToggle.setAttribute('aria-expanded', expanded);
  }
  
  closeMenu() {
    this.menuToggle.classList.remove('active');
    this.navMenu.classList.remove('active');
    this.menuToggle.setAttribute('aria-expanded', 'false');
  }
}

// Form handling
class ContactForm {
  constructor() {
    this.init();
  }
  
  init() {
    this.form = document.querySelector('.contact-form');
    if (this.form) {
      this.bindEvents();
    }
  }
  
  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  handleSubmit() {
    // Basic form handling - customize as needed
    const formData = new FormData(this.form);
    console.log('Form submitted:', Object.fromEntries(formData));
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    this.form.reset();
  }
}

// Smooth scrolling and section navigation
class SmoothScroll {
  constructor() {
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupScrollSnap();
  }
  
  bindEvents() {
    // Handle smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '#home') return;
        
        e.preventDefault();
        this.scrollToSection(href);
      });
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        this.scrollToNextSection();
      } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        this.scrollToPreviousSection();
      }
    });
  }
  
  setupScrollSnap() {
    // Ensure scroll snap points are properly set
    const sections = document.querySelectorAll('.hero, .section');
    sections.forEach(section => {
      if (!section.style.scrollSnapAlign) {
        section.style.scrollSnapAlign = 'start';
      }
    });
  }
  
  scrollToSection(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
      const targetPosition = target.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
  
  scrollToNextSection() {
    const sections = document.querySelectorAll('.hero, .section');
    const currentSection = this.getCurrentSection();
    const currentIndex = Array.from(sections).indexOf(currentSection);
    
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      const targetId = '#' + nextSection.id;
      this.scrollToSection(targetId);
    }
  }
  
  scrollToPreviousSection() {
    const sections = document.querySelectorAll('.hero, .section');
    const currentSection = this.getCurrentSection();
    const currentIndex = Array.from(sections).indexOf(currentSection);
    
    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];
      const targetId = '#' + (previousSection.id || 'home');
      this.scrollToSection(targetId);
    }
  }
  
  getCurrentSection() {
    const sections = document.querySelectorAll('.hero, .section');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (let section of sections) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
        return section;
      }
    }
    
    return sections[0]; // Default to first section
  }
}

// Skip link functionality
class SkipLink {
  constructor() {
    this.init();
  }
  
  init() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector('#main');
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new MobileNav();
  new ContactForm();
  new SmoothScroll();
  new SkipLink();
});