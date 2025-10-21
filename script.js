document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section');
    
    // --- 1. THEME TOGGLE LOGIC (Dark/Light/Night) ---
    // 0: Dark (default), 1: Light, 2: Night
    let currentThemeIndex = 0; 
    const themes = ['theme-dark', 'theme-light', 'theme-night'];
    const themeIcons = ['fas fa-sun', 'fas fa-moon', 'fas fa-cloud-moon'];

    // Load saved theme or default to 0
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme !== null) {
        currentThemeIndex = parseInt(savedTheme);
        body.classList.add(themes[currentThemeIndex]);
        themeToggle.querySelector('i').className = themeIcons[currentThemeIndex];
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
        navMenu.classList.remove('open');
        menuToggle.querySelector('i').className = 'fas fa-bars'; 
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

    // Smooth scrolling for navigation links
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                const navbarHeight = document.querySelector('.navbar').offsetHeight;

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - navbarHeight - 20; 
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Intersection Observer for highlighting active section in navbar
    const observerOptions = {
        root: null, 
        rootMargin: '-30% 0px -70% 0px', 
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
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

    // Set initial active link for 'Home'
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

            projectCards.forEach(card => {
                const techs = card.dataset.tech.split(' ');
                
                if (filter === 'all' || techs.includes(filter)) {
                    card.classList.remove('hidden');
                    card.style.opacity = 1; 
                } else {
                    card.classList.add('hidden');
                    card.style.opacity = 0;
                }
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
                    formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
                    form.reset();
                } else {
                    formStatus.textContent = 'Oops! There was an issue sending your message.';
                }
            } catch (error) {
                formStatus.textContent = 'Oops! Network error or server issue.';
            } finally {
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            }
        });
    }
});