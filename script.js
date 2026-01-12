/**
 * System Administrator Portfolio - Updated Version
 * Features: Theme toggle, scroll animations, bubbles, form validation
 * Added: Projects pagination with navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio JavaScript loaded successfully!');
    
    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Theme toggle event
    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('portfolio-theme', currentTheme);
        updateThemeIcon(currentTheme);
        
        // Update bubbles theme
        setTimeout(() => {
            updateBubblesTheme();
        }, 300);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeIcon.setAttribute('aria-label', 'Switch to light mode');
        } else {
            themeIcon.className = 'fas fa-moon';
            themeIcon.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
    
    // ===== Mobile Menu Toggle =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        
        // Change icon based on menu state
        const icon = this.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });
    
    // ===== Scroll Progress Bar =====
    const progressBar = document.getElementById('progressBar');
    
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // ===== Back to Top Button =====
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ===== Active Navigation Link on Scroll =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
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
    
    // ===== Certification Logo Color Effect =====
    const certificateCards = document.querySelectorAll('.certificate-card');
    
    certificateCards.forEach(card => {
        const icon = card.querySelector('.certificate-icon i');
        const originalColor = icon ? getComputedStyle(icon).color : null;
        const logoColor = card.getAttribute('data-logo-color');
        
        // Store original color as data attribute
        if (originalColor) {
            card.setAttribute('data-original-color', originalColor);
        }
        
        // Hover effect
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
        
        // Click effect
        card.addEventListener('click', function() {
            const icon = this.querySelector('.certificate-icon i, .certificate-icon .bnsp-logo');
            const logoColor = this.getAttribute('data-logo-color');
            
            if (icon && logoColor) {
                // Temporarily change to logo color
                icon.style.color = logoColor;
                icon.style.filter = 'brightness(1.3) drop-shadow(0 0 8px rgba(0,0,0,0.3))';
                
                // Reset after animation
                setTimeout(() => {
                    icon.style.color = '';
                    icon.style.filter = '';
                }, 1000);
            }
        });
    });
    
    // ===== Animate Timeline Items on Scroll =====
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                timelineObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Set initial state for animation
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
    
    // Initialize projects pagination
    function initProjectsPagination() {
        if (projectsPages.length === 0) return;
        
        // Set total pages indicator
        totalPagesEl.textContent = totalProjectPages;
        
        // Show first page by default
        showProjectsPage(currentProjectPage);
        
        // Previous button event
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentProjectPage > 1) {
                    showProjectsPage(currentProjectPage - 1);
                }
            });
        }
        
        // Next button event
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentProjectPage < totalProjectPages) {
                    showProjectsPage(currentProjectPage + 1);
                }
            });
        }
        
        // Update button states initially
        updateNavButtons();
    }
    
    // Show specific projects page
    function showProjectsPage(pageNumber) {
        // Hide all pages
        projectsPages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.querySelector(`.projects-page:nth-child(${pageNumber})`);
        if (targetPage) {
            targetPage.classList.add('active');
            currentProjectPage = pageNumber;
            
            // Update page indicator
            if (currentPageEl) {
                currentPageEl.textContent = currentProjectPage;
            }
            
            // Update button states
            updateNavButtons();
            
            // Smooth scroll to top of projects section if not first page
            if (pageNumber > 1) {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    setTimeout(() => {
                        projectsSection.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }, 100);
                }
            }
        }
    }
    
    // Update navigation button states
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
        
        // Start typing effect when terminal is in view
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
            
            // Random animation delay and duration
            const delay = Math.random() * 5;
            const duration = 20 + Math.random() * 10;
            
            bubble.style.animationDelay = `${delay}s`;
            bubble.style.animationDuration = `${duration}s`;
            
            // Random subtle color variation for light mode
            if (document.documentElement.getAttribute('data-theme') === 'light') {
                const opacity = Math.random() * 0.2 + 0.1; // 0.1-0.3
                bubble.style.background = `rgba(255, 255, 255, ${opacity})`;
            }
            
            // Add hover effect
            bubble.addEventListener('mouseenter', function() {
                this.style.opacity = '0.6';
                this.style.transform = 'scale(1.2)';
            });
            
            bubble.addEventListener('mouseleave', function() {
                this.style.opacity = '0.3';
                this.style.transform = 'scale(1)';
            });
            
            // Make bubbles interactive
            bubble.addEventListener('click', function() {
                const randomX = Math.random() * 50 - 25;
                const randomY = Math.random() * 50 - 25;
                
                this.style.transform = `translate(${randomX}px, ${randomY}px) scale(1.3)`;
                this.style.opacity = '0.8';
                
                // Reset after animation
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.opacity = '0.3';
                }, 500);
            });
            
            bubblesContainer.appendChild(bubble);
        }
    }
    
    // ===== Update bubbles on theme change =====
    function updateBubblesTheme() {
        const bubbles = document.querySelectorAll('.bubble');
        const theme = document.documentElement.getAttribute('data-theme');
        
        bubbles.forEach(bubble => {
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
        });
    }
    
    // ===== Background Image Preloader =====
    function preloadBackgroundImage() {
        const imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80';
        
        const img = new Image();
        img.src = imageUrl;
        
        img.onload = function() {
            console.log('Background image loaded successfully');
            // Add smooth fade-in effect
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
            console.log('Failed to load background image, using fallback gradient');
            // Fallback gradient background
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
    
    // ===== Initialize Everything =====
    createBubbles();
    preloadBackgroundImage();
    initProjectsPagination();
    
    // Recreate bubbles on window resize for better positioning
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createBubbles();
        }, 250);
    });
    
    console.log('All JavaScript features initialized successfully!');
});