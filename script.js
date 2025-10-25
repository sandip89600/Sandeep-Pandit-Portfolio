document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section');
    const navbar = document.querySelector('.navbar'); // Added for dynamic height calculation

    // --- 1. THEME TOGGLE LOGIC (Dark/Light/Night) ---
    const themes = ['theme-dark', 'theme-light', 'theme-night'];
    const themeIcons = ['fas fa-sun', 'fas fa-moon', 'fas fa-cloud-moon'];
    let currentThemeIndex = 0; 
    
    // Load saved theme or default to the first theme
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme !== null) {
        currentThemeIndex = parseInt(savedTheme) % themes.length; // Ensure index is valid
        body.classList.add(themes[currentThemeIndex]);
        // Update icon to match the loaded theme
        if (themeToggle) {
            themeToggle.querySelector('i').className = themeIcons[currentThemeIndex];
        }
    } else {
        body.classList.add(themes[0]);
    }

    const switchTheme = () => {
        body.classList.remove(themes[currentThemeIndex]);
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        body.classList.add(themes[currentThemeIndex]);
        themeToggle.querySelector('i').className = themeIcons[currentThemeIndex];
        localStorage.setItem('portfolioTheme', currentThemeIndex);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', switchTheme);
    }


    // --- 2. HAMBURGER MENU LOGIC ---
    const closeMenu = () => {
        if (navMenu) {
            navMenu.classList.remove('open');
        }
        if (menuToggle) {
            menuToggle.querySelector('i').className = 'fas fa-bars'; 
        }
    };
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isMenuOpen = navMenu.classList.toggle('open');
            menuToggle.querySelector('i').className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }


    // --- 3. SMOOTH SCROLLING AND ACTIVE NAV LINK LOGIC ---

    // Smooth scrolling function
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                // Get navbar height dynamically for precise offset
                const navbarHeight = navbar ? navbar.offsetHeight : 0; 
                const paddingOffset = 20; // Extra padding for visual comfort

                if (targetElement) {
                    // Corrected calculation: target position minus navbar height and padding
                    const offsetTop = targetElement.offsetTop - navbarHeight - paddingOffset; 
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Intersection Observer for highlighting active section in navbar
    // FIX: Using a dynamic rootMargin to accurately track when a section hits the bottom of the sticky navbar.
    const updateObserverMargin = () => {
        const navbarHeight = navbar ? navbar.offsetHeight : 80; // Default to 80px if not found
        // Only observe intersection when the section is at the top of the viewport, just below the sticky header.
        const margin = `-${navbarHeight}px 0px 0px 0px`;
        return margin;
    };

    // Re-instantiate the observer after DOM load and window resize events
    const setupSectionObserver = () => {
        if (sections.length === 0) return;
        
        // Disconnect any existing observer before creating a new one (important on resize)
        if (window.sectionObserverInstance) {
            window.sectionObserverInstance.disconnect();
        }

        const observerOptions = {
            root: null, 
            rootMargin: updateObserverMargin(), 
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    const currentId = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
        window.sectionObserverInstance = sectionObserver; // Save instance
    };

    setupSectionObserver();
    window.addEventListener('resize', setupSectionObserver); // Recalculate on resize

    // Set initial active link for 'Home' if no scrolling has occurred
    if (navLinks.length > 0) {
        navLinks[0].classList.add('active'); 
    }
    
    // --- 4. PROJECT FILTERING LOGIC ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;

            // Use requestAnimationFrame for smoother visual updates
            requestAnimationFrame(() => {
                projectCards.forEach(card => {
                    const techs = card.dataset.tech.split(' ');
                    
                    if (filter === 'all' || techs.includes(filter)) {
                        card.style.opacity = 1;
                        // Delayed removal of 'hidden' to allow opacity transition
                        setTimeout(() => card.classList.remove('hidden'), 50); 
                    } else {
                        card.style.opacity = 0;
                        // Immediate addition of 'hidden' after transition time 
                        setTimeout(() => card.classList.add('hidden'), 500); 
                    }
                });
            });
        });
    });
    
    // --- 5. SKILL BAR ANIMATION LOGIC ---
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillsSection = document.getElementById('technical-skills');

    const animateBars = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillBars.forEach(bar => {
                    const level = bar.dataset.level;
                    bar.style.width = level;
                });
                observer.unobserve(skillsSection); 
            }
        });
    };

    const skillObserver = new IntersectionObserver(animateBars, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 
    });

    if (skillsSection) {
        skillObserver.observe(skillsSection);
    }
    
    // --- 6. ASYNCHRONOUS FORM SUBMISSION LOGIC ---
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending...';

            const formData = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Message sent successfully! I will get back to you soon. 😊';
                    form.reset();
                } else {
                    formStatus.textContent = 'Oops! There was an issue sending your message. Please try again. 😟';
                }
            } catch (error) {
                formStatus.textContent = 'Oops! Network error or server issue. 😥';
            } finally {
                // Clear the status message after 5 seconds
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            }
        });
    }
});