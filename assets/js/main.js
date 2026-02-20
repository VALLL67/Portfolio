/*
 * Script principal pour les interactions du portfolio.
 * - Révèle les sections lors du défilement grâce à IntersectionObserver.
 * - Affiche un bouton de retour en haut quand l’utilisateur scrolle.
 * - Gère le thème clair/sombre.
 * - Anime le titre de présentation en plusieurs langues.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Effet spotlight qui suit la souris dans le hero
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Conserve la dernière position de la souris pour pouvoir la réutiliser au scroll
        let lastMouseX = null;
        let lastMouseY = null;

        /**
         * Calcule la position du spot en pourcentage par rapport à la section hero
         * et met à jour les variables CSS correspondantes.
         *
         * @param {Object} event - Objet contenant les propriétés clientX et clientY
         */
        const updateSpot = (event) => {
            const rect = heroSection.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            heroSection.style.setProperty('--hero-spot-x', `${x}%`);
            heroSection.style.setProperty('--hero-spot-y', `${y}%`);
        };

        // Met à jour la position du spot à chaque mouvement de souris
        heroSection.addEventListener('mousemove', (event) => {
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            updateSpot(event);
            heroSection.classList.add('hero-spot-active');
        });

        // Retire l'effet lorsque la souris quitte la section
        heroSection.addEventListener('mouseleave', () => {
            heroSection.classList.remove('hero-spot-active');
        });

        // Réajuste la position du spot lorsque l'utilisateur fait défiler la page sans déplacer la souris.
        // Cela permet au halo lumineux de rester calé sous le curseur même après un scroll.
        window.addEventListener('scroll', () => {
            // Si la souris est déjà passée sur le hero et qu'elle est toujours active,
            // on recalcule la position relative en fonction du nouveau scrolling.
            if (lastMouseX !== null && lastMouseY !== null && heroSection.classList.contains('hero-spot-active')) {
                updateSpot({ clientX: lastMouseX, clientY: lastMouseY });
            }
        });
    }

    // Intersection Observer pour l’apparition des sections
    const revealSections = document.querySelectorAll('.section-reveal');
    const observerOptions = {
        threshold: 0.1
    };
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    revealSections.forEach(section => revealOnScroll.observe(section));

    // Création et gestion du bouton de retour en haut
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.setAttribute('aria-label', 'Retour en haut');
    scrollTopBtn.innerHTML = '↑';
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 40) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    // Gestion du basculement de thème (clair/sombre)
    const themeToggleBtn = document.querySelector('.theme-toggle');
    if (themeToggleBtn) {
        // Détermine le thème préféré : stockage local ou préférence système
        const getPreferredTheme = () => {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) return storedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };
        let currentTheme = getPreferredTheme();
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            currentTheme = theme;
            // Met à jour l'état aria-pressed pour indiquer le thème actif aux lecteurs d'écran
            if (themeToggleBtn) {
                const isDark = theme === 'dark';
                themeToggleBtn.setAttribute('aria-pressed', String(isDark));
            }
        };
        const updateToggleIcon = () => {
            if (currentTheme === 'dark') {
                themeToggleBtn.textContent = '☀️';
                themeToggleBtn.setAttribute('aria-label', 'Activer le mode clair');
            } else {
                themeToggleBtn.textContent = '🌙';
                themeToggleBtn.setAttribute('aria-label', 'Activer le mode sombre');
            }
            // l'attribut aria-pressed est déjà mis à jour dans applyTheme
        };
        // Initialiser le thème
        applyTheme(currentTheme);
        updateToggleIcon();
        // Écouteur de clic pour basculer le thème
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon();
        });
    }

    // Animation du titre en plusieurs langues
    const greetings = [
        "Bonjour, je suis Valentin",
        "你好，我是 瓦伦廷",
        "Hello, I'm Valentin",
        "مرحباً، أنا فالنتين",
        "Ciao, sono Valentino",
        "Привет, я Валентин",
        "Hallo, ich bin Valentin",
        "שלום אני ולנטיין",
        "Hola, soy Valentin",
        "こんにちは、ヴァレンティンです",
        "Merhaba, ben Valentin",
    ];
    const greetingElement = document.getElementById('multi-greeting');
    if (greetingElement) {
        let greetingIndex = 0;
        const switchGreeting = () => {
            // Lancer la fade‑out du texte
            greetingElement.classList.add('fade');
            setTimeout(() => {
                // Mettre à jour le texte une fois l’animation de disparition terminée
                greetingIndex = (greetingIndex + 1) % greetings.length;
                greetingElement.textContent = greetings[greetingIndex];
                greetingElement.classList.remove('fade');
            }, 800);
        };
        // Changer de langue toutes les 4 secondes
        setInterval(switchGreeting, 4000);
    }
    // --- Chargement dynamique du parcours (JSON) ---
    // --- Chargement dynamique du parcours (JSON) ---
    fetch('./data.json')
        .then(response => {
            if (!response.ok) throw new Error("Fichier JSON introuvable");
            return response.json();
        })
        .then(data => {
            const createCardHTML = (item) => {
                const tagsHTML = item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
                return `
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title-group">
                                <h4>${item.poste || item.titre}</h4>
                                <p class="entreprise-nom">${item.entreprise || item.ecole}</p>
                            </div>
                            <span class="date-badge">${item.date}</span>
                        </div>
                        
                        <div class="tags-container">
                            ${tagsHTML}
                        </div>
                    </div>
                `;
            };

            const expContainer = document.getElementById('experiences-container');
            if (expContainer && data.experiences) {
                expContainer.innerHTML = ''; 
                data.experiences.forEach(exp => expContainer.insertAdjacentHTML('beforeend', createCardHTML(exp)));
            }

            const formContainer = document.getElementById('formations-container');
            if (formContainer && data.formations) {
                formContainer.innerHTML = '';
                data.formations.forEach(formation => formContainer.insertAdjacentHTML('beforeend', createCardHTML(formation)));
            }

            // --- NOUVEAU : Synchronisation du survol (Timeline interactive) ---
            // On attend que le DOM soit mis à jour avec les nouvelles cartes
            setTimeout(() => {
                const expCards = document.querySelectorAll('#experiences-container .card');
                const formCards = document.querySelectorAll('#formations-container .card');

                // Pour chaque carte de formation...
                formCards.forEach((formCard, index) => {
                    // Si une carte expérience correspondante existe au même index
                    if (expCards[index]) {
                        // Quand on entre avec la souris sur la formation
                        formCard.addEventListener('mouseenter', () => {
                            // On active le point sur l'expérience correspondante
                            expCards[index].classList.add('dot-active');
                        });

                        // Quand on sort avec la souris
                        formCard.addEventListener('mouseleave', () => {
                            // On désactive le point
                            expCards[index].classList.remove('dot-active');
                        });
                    }
                });
            }, 100); // Petit délai de sécurité pour s'assurer que le HTML est injecté
        })
        .catch(error => console.error("Erreur de chargement du JSON :", error));
});
