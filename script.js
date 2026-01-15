/**
 * System Administrator Portfolio - Cloudflare Optimized Version
 * Version: 1.0.4
 * Features: Theme toggle, responsive design, projects pagination, bubbles animation
 * Cloudflare fixes: Rocket Loader bypass, CSS fallback, asset optimization
 */

// ===== Cloudflare Rocket Loader Bypass =====
// This script uses data-cfasync="false" in HTML to bypass Rocket Loader

// ===== Initialize Portfolio =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Portfolio initializing...');
    
    // ===== CSS Load Check =====
    const cssLoading = document.getElementById('cssLoading');
    
    function hideLoadingIndicator() {
        if (cssLoading) {
            cssLoading.classList.add('hidden');
            setTimeout(() => {
                if (cssLoading && cssLoading.parentNode) {
                    cssLoading.parentNode.removeChild(cssLoading);
                }
            }, 500);
        }
    }
    
    // Check if CSS is properly loaded
    function checkCSSLoaded() {
        // Method 1: Check CSS variable
        const rootStyles = getComputedStyle(document.documentElement);
        const bgColor = rootStyles.getPropertyValue('--bg-primary').trim();
        
        // Method 2: Check if critical element has styles
        const testEl = document.createElement('div');
        testEl.style.cssText = 'position:absolute;top:-9999px;width:100px';
        document.body.appendChild(testEl);
        const hasPosition = window.getComputedStyle(testEl).position === 'absolute';
        document.body.removeChild(testEl);
        
        console.log('🎨 CSS Load Check:', {
            hasCSSVariables: bgColor !== '',
            hasPositionStyle: hasPosition,
            bgColor: bgColor || 'undefined'
        });
        
        // If CSS seems broken, apply fallback
        if (!hasPosition || bgColor === '') {
            console.warn('⚠️ CSS load issue detected. Applying emergency styles...');
            applyEmergencyStyles();
            document.body.classList.add('critical-css-failure');
        }
        
        // Hide loading indicator with delay
        setTimeout(hideLoadingIndicator, 1000);
        
        // Force hide after 3 seconds
        setTimeout(hideLoadingIndicator, 3000);
    }
    
    // Emergency CSS for critical failures
    function applyEmergencyStyles() {
        const emergencyCSS = `
            /* Emergency CSS Fallback */
            .critical-css-failure {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                line-height: 1.6 !important;
                background: #f5f5f7 !important;
                color: #1a1a1a !important;
            }
            
            .critical-css-failure[data-theme="dark"] {
                background: #0a0a0a !important;
                color: #f8f9fa !important;
            }
            
            .critical-css-failure .navbar {
                background: rgba(245, 245, 247, 0.95) !important;
                backdrop-filter: blur(10px) !important;
                border-bottom: 1px solid #ddd !important;
                padding: 1rem 0 !important;
            }
            
            .critical-css-failure[data-theme="dark"] .navbar {
                background: rgba(10, 10, 10, 0.95) !important;
                border-bottom: 1px solid #333 !important;
            }
            
            .critical-css-failure .nav-logo,
            .critical-css-failure .footer-logo {
                display: flex !important;
                align-items: center !important;
                gap: 0.5rem !important;
            }
            
            .critical-css-failure .nav-logo-img,
            .critical-css-failure .footer-logo-img {
                height: 40px !important;
                width: auto !important;
            }
            
            .critical-css-failure .section {
                padding: 4rem 2rem !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
            }
            
            .critical-css-failure .hero-section {
                min-height: 100vh !important;
                padding: 6rem 2rem 2rem !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'emergency-css';
        style.textContent = emergencyCSS;
        document.head.appendChild(style);
    }
    
    // Start CSS check
    setTimeout(checkCSSLoaded, 100);
    window.addEventListener('load', checkCSSLoaded);
    
    // ===== Asset Path Fixer =====
    function fixAssetPaths() {
        const domain = window.location.origin;
        console.log('🌐 Fixing asset paths for domain:', domain);
        
        // Fix all image paths
        const images = document.querySelectorAll('img[src^="src/"], img[src^="/src/"]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http')) {
                const cleanSrc = src.startsWith('/') ? src : '/' + src;
                img.src = domain + cleanSrc + '?v=1.0.4';
                
                // Add error handling
                img.onerror = function() {
                    console.error('❌ Failed to load image:', this.src);
                    this.style.opacity = '0.5';
                };
            }
        });
        
        // Fix CSS background images
        const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
        elementsWithBg.forEach(el => {
            const style = el.getAttribute('style');
            if (style && style.includes('url("src/')) {
                const fixedStyle = style.replace(/url\("([^"]*)"\)/g, (match, url) => {
                    if (url.startsWith('src/')) {
                        return `url("${domain}/${url}")`;
                    }
                    return match;
                });
                el.setAttribute('style', fixedStyle);
            }
        });
    }
    
    // ===== Theme Management =====
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('portfolio-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        applyTheme(currentTheme);
        
        // Update icon
        if (themeIcon) {
            themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            themeIcon.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
        
        console.log('🎨 Theme initialized:', currentTheme);
        return currentTheme;
    }
    
    let currentTheme = initTheme();
    
    // Apply theme and update logos
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        
        // Update logos with cache busting
        const timestamp = new Date().getTime();
        const logos = document.querySelectorAll('#navLogo, #footerLogo');
        
        logos.forEach(logo => {
            if (!logo) return;
            
            let logoUrl;
            if (theme === 'dark') {
                logoUrl = '/src/img/1-logo-dark.png';
            } else {
                logoUrl = '/src/img/2-logo-light.png';
            }
            
            // Add version parameter to bust cache
            logo.src = logoUrl + '?v=' + timestamp;
            
            // Enhanced error handling
            logo.onerror = function() {
                console.warn('⚠️ Logo failed to load:', this.src);
                // Try fallback
                this.src = '/src/img/fallback-logo.svg';
                this.alt = 'Logo';
                this.style.border = '1px solid #ccc';
                this.style.padding = '5px';
                this.style.backgroundColor = theme === 'dark' ? '#333' : '#f0f0f0';
            };
            
            logo.onload = function() {
                console.log('✅ Logo loaded successfully:', this.src);
            };
        });
        
        // Update bubbles for theme
        updateBubblesTheme();
    }
    
    // Theme toggle event
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(currentTheme);
            
            // Update icon
            if (themeIcon) {
                themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                themeIcon.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            }
            
            console.log('🔄 Theme toggled to:', currentTheme);
        });
    }
    
    // ===== Mobile Menu =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = mobileMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
            
            // Update aria label
            const isExpanded = mobileMenu.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            this.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
        });
        
        // Close menu on link click
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                if (menuToggle) {
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Open menu');
                }
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                if (menuToggle) {
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Open menu');
                }
            }
        });
    }
    
    // ===== Scroll Progress =====
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / winHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
    
    // ===== Back to Top =====
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ===== Active Navigation Link on Scroll =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // ===== Projects Pagination =====
    const projectsPages = document.querySelectorAll('.projects-page');
    const prevBtn = document.getElementById('prevProjects');
    const nextBtn = document.getElementById('nextProjects');
    const currentPageEl = document.querySelector('.current-page');
    const totalPagesEl = document.querySelector('.total-pages');
    
    if (projectsPages.length > 0) {
        let currentProjectPage = 1;
        const totalProjectPages = projectsPages.length;
        
        totalPagesEl.textContent = totalProjectPages;
        
        function showProjectsPage(page) {
            // Hide all pages
            projectsPages.forEach(p => p.classList.remove('active'));
            
            // Show target page
            const target = document.querySelector(`.projects-page:nth-child(${page})`);
            if (target) {
                target.classList.add('active');
                currentProjectPage = page;
                currentPageEl.textContent = page;
                
                // Update button states
                if (prevBtn) {
                    prevBtn.disabled = page === 1;
                    prevBtn.style.opacity = page === 1 ? '0.5' : '1';
                    prevBtn.setAttribute('aria-label', page === 1 ? 'No previous page' : 'Previous page');
                }
                if (nextBtn) {
                    nextBtn.disabled = page === totalProjectPages;
                    nextBtn.style.opacity = page === totalProjectPages ? '0.5' : '1';
                    nextBtn.setAttribute('aria-label', page === totalProjectPages ? 'No next page' : 'Next page');
                }
                
                console.log('📄 Projects page changed to:', page);
            }
        }
        
        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentProjectPage > 1) {
                    showProjectsPage(currentProjectPage - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentProjectPage < totalProjectPages) {
                    showProjectsPage(currentProjectPage + 1);
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentProjectPage > 1) {
                showProjectsPage(currentProjectPage - 1);
            } else if (e.key === 'ArrowRight' && currentProjectPage < totalProjectPages) {
                showProjectsPage(currentProjectPage + 1);
            }
        });
        
        // Initialize
        showProjectsPage(1);
    }
    
    // ===== Terminal Typing Effect =====
    const typingOutput = document.getElementById('typing-output');
    if (typingOutput) {
        const originalText = typingOutput.textContent;
        typingOutput.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                typingOutput.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start when terminal is in view
        const terminalObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(typeWriter, 1000);
                terminalObserver.disconnect();
            }
        }, { threshold: 0.5 });
        
        const terminal = document.querySelector('.hero-terminal');
        if (terminal) terminalObserver.observe(terminal);
    }
    
    // ===== Skill Tags Hover Effect =====
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // ===== Create Elegant Bubbles =====
    function createBubbles() {
        const bubblesContainer = document.getElementById('bubblesContainer');
        if (!bubblesContainer) return;
        
        // Clear existing bubbles
        bubblesContainer.innerHTML = '';
        
        const bubbleCount = 12;
        const sizes = ['small', 'medium', 'large'];
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            
            bubble.className = `bubble bubble-${size}`;
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            bubble.style.left = `${posX}%`;
            bubble.style.top = `${posY}%`;
            
            // Random animation
            const delay = Math.random() * 5;
            const duration = 20 + Math.random() * 10;
            
            bubble.style.animationDelay = `${delay}s`;
            bubble.style.animationDuration = `${duration}s`;
            
            // Theme-based styling
            updateBubbleTheme(bubble);
            
            // Interactive effects
            bubble.addEventListener('mouseenter', function() {
                this.style.opacity = '0.6';
                this.style.transform = 'scale(1.2)';
            });
            
            bubble.addEventListener('mouseleave', function() {
                this.style.opacity = '0.3';
                this.style.transform = 'scale(1)';
            });
            
            bubble.addEventListener('click', function() {
                const randomX = Math.random() * 50 - 25;
                const randomY = Math.random() * 50 - 25;
                
                this.style.transform = `translate(${randomX}px, ${randomY}px) scale(1.3)`;
                this.style.opacity = '0.8';
                
                // Reset
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.opacity = '0.3';
                }, 500);
            });
            
            bubblesContainer.appendChild(bubble);
        }
        
        console.log('💧 Bubbles created:', bubbleCount);
    }
    
    // Update bubble theme
    function updateBubbleTheme(bubble) {
        const theme = document.documentElement.getAttribute('data-theme');
        
        if (theme === 'dark') {
            bubble.style.background = 'rgba(255, 255, 255, 0.05)';
            bubble.style.boxShadow = 
                'inset 0 0 20px rgba(255, 255, 255, 0.05), 0 0 30px rgba(255, 255, 255, 0.05)';
        } else {
            const opacity = Math.random() * 0.2 + 0.1;
            bubble.style.background = `rgba(255, 255, 255, ${opacity})`;
            bubble.style.boxShadow = 
                `inset 0 0 20px rgba(255, 255, 255, ${opacity}), 0 0 30px rgba(255, 255, 255, ${opacity})`;
        }
    }
    
    // Update all bubbles theme
    function updateBubblesTheme() {
        const bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(updateBubbleTheme);
    }
    
    // ===== Background Image Preloader =====
    function preloadBackgroundImage() {
        const imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80';
        
        const img = new Image();
        img.src = imageUrl;
        
        img.onload = function() {
            console.log('✅ Background image loaded');
            const bgImage = document.querySelector('.hero-bg-image');
            if (bgImage) {
                bgImage.style.opacity = '0';
                setTimeout(() => {
                    bgImage.style.transition = 'opacity 1s ease';
                    bgImage.style.opacity = '0.4';
                    if (document.documentElement.getAttribute('data-theme') === 'dark') {
                        bgImage.style.opacity = '0.3';
                    }
                }, 100);
            }
        };
        
        img.onerror = function() {
            console.warn('⚠️ Background image failed to load');
            const heroBg = document.querySelector('.hero-bg');
            if (heroBg) {
                heroBg.innerHTML = `
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, 
                            rgba(245, 245, 247, 0.9) 0%, 
                            rgba(232, 232, 237, 0.9) 100%);
                        z-index: -1;
                    "></div>
                `;
                
                if (document.documentElement.getAttribute('data-theme') === 'dark') {
                    heroBg.innerHTML = `
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(135deg, 
                                rgba(18, 18, 18, 0.9) 0%, 
                                rgba(26, 26, 26, 0.9) 100%);
                            z-index: -1;
                        "></div>
                    `;
                }
            }
        };
    }
    
    // ===== Certificate Hover Effects =====
    const certificateCards = document.querySelectorAll('.certificate-card');
    certificateCards.forEach(card => {
        const logoColor = card.getAttribute('data-logo-color');
        
        card.addEventListener('mouseenter', function() {
            if (logoColor) {
                const icon = this.querySelector('.certificate-icon i, .certificate-icon .bnsp-logo');
                if (icon) {
                    icon.style.color = logoColor;
                    icon.style.filter = 'brightness(1.2)';
                }
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.certificate-icon i, .certificate-icon .bnsp-logo');
            if (icon) {
                icon.style.color = '';
                icon.style.filter = '';
            }
        });
    });
    
    // ===== Timeline Animation =====
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            item.style.transitionDelay = (index * 0.2) + 's';
            timelineObserver.observe(item);
        });
    }
    
    // ===== Initialize Everything =====
    createBubbles();
    preloadBackgroundImage();
    fixAssetPaths();
    
    // Recreate bubbles on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createBubbles, 250);
    });
    
    // Final initialization
    setTimeout(() => {
        document.body.style.opacity = '1';
        console.log('✅ Portfolio fully initialized!');
        console.log('🌐 Current theme:', currentTheme);
        console.log('📱 Viewport:', window.innerWidth, 'x', window.innerHeight);
    }, 500);
    
    // ===== Error Handling =====
    window.addEventListener('error', function(e) {
        console.error('❌ Global error:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
        
        // Try to recover from critical errors
        if (e.message.includes('CSS') || e.message.includes('style')) {
            applyEmergencyStyles();
        }
    });
    
    // Log initialization
    console.log('🚀 Portfolio script loaded successfully');
});

// ===== Service Worker Registration (Optional) =====
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('⚡ ServiceWorker registered:', registration.scope);
        }).catch(function(err) {
            console.log('❌ ServiceWorker registration failed:', err);
        });
    });
}