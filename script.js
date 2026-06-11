/** 
 * Portfolio JavaScript - Auto Refresh System
 * Version: 3.1
 * Last Updated: <?php echo date('Y-m-d H:i:s'); ?>
 */

console.log('🚀 Portfolio JavaScript loaded with auto-refresh system');

// Enhanced auto-refresh functionality
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        version: window.APP_VERSION || '3.1',
        checkInterval: 5 * 60 * 1000, // 5 minutes
        debugMode: window.location.search.includes('debug'),
        storageKeys: {
            lastCheck: 'portfolio_last_check',
            currentVersion: 'portfolio_version',
            assetHashes: 'portfolio_asset_hashes'
        }
    };
    
    // Asset monitoring
    class AssetMonitor {
        constructor() {
            this.assets = [
                { url: 'style.css', type: 'css', element: document.getElementById('main-css') },
                { url: 'script.js', type: 'js', element: document.getElementById('main-js') }
            ];
            
            this.init();
        }
        
        init() {
            // Store initial hashes
            this.storeAssetHashes();
            
            // Start monitoring
            setInterval(() => this.checkAssets(), CONFIG.checkInterval);
            
            // Check on visibility change
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.checkAssets();
                }
            });
            
            if (CONFIG.debugMode) {
                console.log('🔍 Asset Monitor initialized');
                this.logAssets();
            }
        }
        
        async storeAssetHashes() {
            try {
                const hashes = {};
                
                for (const asset of this.assets) {
                    try {
                        const response = await fetch(asset.url, {
                            method: 'GET',
                            headers: { 'Cache-Control': 'no-cache' },
                            cache: 'no-store'
                        });
                        
                        if (response.ok) {
                            const text = await response.text();
                            const hash = this.generateHash(text);
                            hashes[asset.url] = hash;
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch ${asset.url}:`, error);
                    }
                }
                
                localStorage.setItem(CONFIG.storageKeys.assetHashes, JSON.stringify(hashes));
                
                if (CONFIG.debugMode) {
                    console.log('💾 Asset hashes stored:', hashes);
                }
            } catch (error) {
                console.error('Error storing asset hashes:', error);
            }
        }
        
        async checkAssets() {
            try {
                const storedHashes = JSON.parse(localStorage.getItem(CONFIG.storageKeys.assetHashes) || '{}');
                let needsRefresh = false;
                
                for (const asset of this.assets) {
                    try {
                        const response = await fetch(asset.url, {
                            method: 'GET',
                            headers: { 'Cache-Control': 'no-cache' },
                            cache: 'no-store'
                        });
                        
                        if (response.ok) {
                            const text = await response.text();
                            const currentHash = this.generateHash(text);
                            const storedHash = storedHashes[asset.url];
                            
                            if (storedHash && currentHash !== storedHash) {
                                console.log(`🔄 Asset changed: ${asset.url}`);
                                needsRefresh = true;
                                
                                // Update hash
                                storedHashes[asset.url] = currentHash;
                            }
                        }
                    } catch (error) {
                        console.warn(`Error checking ${asset.url}:`, error);
                    }
                }
                
                // Update stored hashes
                localStorage.setItem(CONFIG.storageKeys.assetHashes, JSON.stringify(storedHashes));
                
                if (needsRefresh) {
                    this.notifyUser();
                }
                
                // Update last check timestamp
                localStorage.setItem(CONFIG.storageKeys.lastCheck, Date.now());
                
            } catch (error) {
                console.error('Error checking assets:', error);
            }
        }
        
        generateHash(str) {
            // Simple hash function
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString(36);
        }
        
        notifyUser() {
            // Create notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: var(--accent-color);
                color: var(--bg-primary);
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                cursor: pointer;
                font-family: 'Inter', sans-serif;
                font-weight: 500;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span>🔄 Update Available</span>
                    <button style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                        Refresh Now
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            // Add click handler
            notification.addEventListener('click', () => {
                localStorage.clear();
                window.location.reload();
            });
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => notification.remove(), 300);
                }
            }, 10000);
        }
        
        logAssets() {
            console.group('📦 Assets Monitoring');
            console.log('Version:', CONFIG.version);
            console.log('Check Interval:', CONFIG.checkInterval / 1000, 'seconds');
            console.log('Assets:', this.assets.map(a => a.url));
            console.groupEnd();
        }
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize asset monitor
        if (typeof window.AssetMonitor === 'undefined') {
            window.AssetMonitor = new AssetMonitor();
        }
        
        // Check version mismatch on load
        const storedVersion = localStorage.getItem(CONFIG.storageKeys.currentVersion);
        if (storedVersion && storedVersion !== CONFIG.version) {
            console.log(`🔄 Version mismatch: ${storedVersion} → ${CONFIG.version}`);
            localStorage.clear();
            window.location.reload();
            return;
        }
        
        // Store current version
        localStorage.setItem(CONFIG.storageKeys.currentVersion, CONFIG.version);
        
        // Log initialization
        console.log(`✅ Portfolio v${CONFIG.version} initialized with auto-refresh`);
    });
    
    // Export for debugging
    window.PortfolioConfig = CONFIG;
    
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio JavaScript loaded successfully!');
    
    // ===== CUSTOM CURSOR DUA ELEMEN =====
    const dot = document.getElementById('customCursorDot');
    const ring = document.getElementById('customCursorRing');
    
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    
    // Titik tengah mengikuti mouse secara instan
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Titik langsung mengikuti mouse
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    
    // Lingkaran luar mengejar dengan smoothing
    function animateRing() {
        // Smooth follow (lerp) untuk lingkaran
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();
    
    // Efek hover pada elemen interaktif:
    // - Lingkaran membesar
    // - Titik tengah menghilang (opacity 0)
    const interactiveElements = document.querySelectorAll('a, button, .skill-tag, .certificate-card, .project-list-item, .social-link-labeled, .projects-nav-btn, .back-to-top, .theme-toggle, .menu-toggle, .nav-logo, .footer-links a, .contact-simple-item, .certificate-id, .timeline-content, .project-list-tech span, .timeline-tech span');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.classList.add('hover');
            dot.style.opacity = '0'; // titik tengah hilang saat hover
        });
        el.addEventListener('mouseleave', () => {
            ring.classList.remove('hover');
            dot.style.opacity = '1'; // titik tengah muncul kembali
        });
    });
    
    // Update warna ring dan dot saat tema berubah
    function updateCursorTheme() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            ring.style.borderColor = '#f8f9fa';
            ring.style.boxShadow = '0 0 6px rgba(255,255,255,0.3)';
            dot.style.backgroundColor = '#f8f9fa';
        } else {
            ring.style.borderColor = '#1a1a1a';
            ring.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
            dot.style.backgroundColor = '#1a1a1a';
        }
    }
    
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-theme') {
                    updateCursorTheme();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    }
    updateCursorTheme();
    
    // Sembunyikan saat keluar window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
    });
    
    // ===== Logo Management =====
    const navLogo = document.getElementById('navLogo');
    const footerLogo = document.getElementById('footerLogo');
    const logoLightUrl = 'src/img/2-logo-light.png';
    const logoDarkUrl = 'src/img/1-logo-dark.png';
    
    function updateLogos(theme) {
        if (theme === 'dark') {
            if (navLogo) navLogo.src = logoDarkUrl;
            if (footerLogo) footerLogo.src = logoDarkUrl;
        } else {
            if (navLogo) navLogo.src = logoLightUrl;
            if (footerLogo) footerLogo.src = logoLightUrl;
        }
    }
    
    function preloadLogoImages() {
        const imgLight = new Image();
        const imgDark = new Image();
        imgLight.src = logoLightUrl;
        imgDark.src = logoDarkUrl;
    }
    
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    updateThemeIcon(currentTheme);
    updateLogos(currentTheme);
    
    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('portfolio-theme', currentTheme);
        updateThemeIcon(currentTheme);
        updateLogos(currentTheme);
        setTimeout(() => updateBubblesTheme(), 300);
    });
    
    // ===== Mobile Menu =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
    
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            if (menuToggle) menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });
    
    // ===== Scroll Progress Bar =====
    const progressBar = document.getElementById('progressBar');
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // ===== Back to Top =====
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // ===== Active Navigation Link =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-link');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
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
    
    // ===== Certificate Logo Color Effect =====
    const certificateCards = document.querySelectorAll('.certificate-card');
    certificateCards.forEach(card => {
        const icon = card.querySelector('.certificate-icon i, .certificate-icon .bnsp-logo');
        const logoColor = card.getAttribute('data-logo-color');
        card.addEventListener('mouseenter', function() {
            if (icon && logoColor) {
                icon.style.color = logoColor;
                icon.style.filter = 'brightness(1.2)';
            }
        });
        card.addEventListener('mouseleave', function() {
            if (icon) {
                icon.style.color = '';
                icon.style.filter = '';
            }
        });
    });
    
    // ===== Animate Timeline Items =====
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver(function(entries) {
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
    
    // ===== Projects Pagination =====
    const projectsPages = document.querySelectorAll('.projects-page');
    const prevBtn = document.getElementById('prevProjects');
    const nextBtn = document.getElementById('nextProjects');
    const currentPageEl = document.querySelector('.current-page');
    const totalPagesEl = document.querySelector('.total-pages');
    let currentProjectPage = 1;
    const totalProjectPages = projectsPages.length;
    
    function showProjectsPage(pageNumber) {
        projectsPages.forEach(page => page.classList.remove('active'));
        const targetPage = document.querySelector(`.projects-page:nth-child(${pageNumber})`);
        if (targetPage) {
            targetPage.classList.add('active');
            currentProjectPage = pageNumber;
            if (currentPageEl) currentPageEl.textContent = currentProjectPage;
            updateNavButtons();
            if (pageNumber > 1) {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    setTimeout(() => projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }
            }
        }
    }
    
    function updateNavButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentProjectPage === 1;
            prevBtn.style.opacity = currentProjectPage === 1 ? '0.5' : '1';
        }
        if (nextBtn) {
            nextBtn.disabled = currentProjectPage === totalProjectPages;
            nextBtn.style.opacity = currentProjectPage === totalProjectPages ? '0.5' : '1';
        }
    }
    
    if (totalProjectPages > 0) {
        totalPagesEl.textContent = totalProjectPages;
        showProjectsPage(1);
        if (prevBtn) prevBtn.addEventListener('click', () => { if (currentProjectPage > 1) showProjectsPage(currentProjectPage - 1); });
        if (nextBtn) nextBtn.addEventListener('click', () => { if (currentProjectPage < totalProjectPages) showProjectsPage(currentProjectPage + 1); });
    }
    
    // ===== Terminal Typing Effect =====
    const terminalOutput = document.querySelector('.terminal-output:nth-child(4)');
    if (terminalOutput) {
        const originalText = terminalOutput.textContent;
        terminalOutput.textContent = '';
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                terminalOutput.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        const terminalObserver = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                setTimeout(typeWriter, 1000);
                terminalObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.5 });
        terminalObserver.observe(document.querySelector('.hero-terminal'));
    }
    
    // ===== Skill Tags Hover Effect =====
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-5px) scale(1.05)'; });
        tag.addEventListener('mouseleave', function() { this.style.transform = 'translateY(0) scale(1)'; });
    });
    
    // ===== Create Bubbles =====
    function createBubbles() {
        const bubblesContainer = document.getElementById('bubblesContainer');
        if (!bubblesContainer) return;
        bubblesContainer.innerHTML = '';
        const bubbleCount = 12;
        const sizes = ['small', 'medium', 'large'];
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            bubble.className = `bubble bubble-${size}`;
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = `${Math.random() * 100}%`;
            bubble.style.animationDelay = `${Math.random() * 5}s`;
            bubble.style.animationDuration = `${20 + Math.random() * 10}s`;
            if (document.documentElement.getAttribute('data-theme') === 'light') {
                const opacity = Math.random() * 0.2 + 0.1;
                bubble.style.background = `rgba(255, 255, 255, ${opacity})`;
            }
            bubble.addEventListener('mouseenter', function() { this.style.opacity = '0.6'; this.style.transform = 'scale(1.2)'; });
            bubble.addEventListener('mouseleave', function() { this.style.opacity = '0.3'; this.style.transform = 'scale(1)'; });
            bubble.addEventListener('click', function() {
                this.style.transform = `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.3)`;
                this.style.opacity = '0.8';
                setTimeout(() => { this.style.transform = ''; this.style.opacity = '0.3'; }, 500);
            });
            bubblesContainer.appendChild(bubble);
        }
    }
    
    function updateBubblesTheme() {
        const bubbles = document.querySelectorAll('.bubble');
        const theme = document.documentElement.getAttribute('data-theme');
        bubbles.forEach(bubble => {
            if (theme === 'dark') {
                bubble.style.background = 'rgba(255, 255, 255, 0.05)';
                bubble.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 255, 0.05), 0 0 30px rgba(255, 255, 255, 0.05)';
            } else {
                const opacity = Math.random() * 0.2 + 0.1;
                bubble.style.background = `rgba(255, 255, 255, ${opacity})`;
                bubble.style.boxShadow = `inset 0 0 20px rgba(255, 255, 255, ${opacity}), 0 0 30px rgba(255, 255, 255, ${opacity})`;
            }
        });
    }
    
    function preloadBackgroundImage() {
        const imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80';
        const img = new Image();
        img.src = imageUrl;
        img.onload = function() {
            const bgImage = document.querySelector('.hero-bg-image');
            if (bgImage) {
                bgImage.style.opacity = '0';
                setTimeout(() => {
                    bgImage.style.transition = 'opacity 1s ease';
                    bgImage.style.opacity = '0.4';
                    if (document.documentElement.getAttribute('data-theme') === 'dark') bgImage.style.opacity = '0.3';
                }, 100);
            }
        };
    }
    
    createBubbles();
    preloadBackgroundImage();
    preloadLogoImages();
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createBubbles, 250);
    });
    
    console.log('All JavaScript features initialized successfully!');
});