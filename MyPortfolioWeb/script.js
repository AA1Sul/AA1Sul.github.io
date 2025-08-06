         class SpaceSlider {
            constructor(container) {
                this.container = container;
                this.currentSlide = 0;
                this.slides = [];
                this.totalSlides = 0;
                this.autoPlayInterval = null;
                
                this.init();
            }

            init() {
                // Get images data from data attribute
                const imagesData = JSON.parse(this.container.dataset.images);
                
                // Create slider HTML structure
                this.createSliderHTML(imagesData);
                
                // Get references to created elements
                this.sliderTrack = this.container.querySelector('.slider-track');
                this.progressFill = this.container.querySelector('.progress-fill');
                this.indicatorsContainer = this.container.querySelector('.slider-indicators');
                this.slides = this.container.querySelectorAll('.slide');
                this.totalSlides = this.slides.length;
                
                // Setup functionality
                this.createIndicators();
                this.setupEventListeners();
                this.updateSlider();
                this.startAutoPlay();
            }

            createSliderHTML(imagesData) {
                let slidesHTML = '';
                imagesData.forEach(image => {
                    slidesHTML += `
                        <div class="slide">
                            <img src="${image.src}" alt="${image.alt}">
                        </div>
                    `;
                });

                this.container.innerHTML = `
                    <div class="slider-container">
                            <button class="nav-button nav-prev">‹</button>
                            <button class="nav-button nav-next">›</button>
                        <div class="slider-wrapper">
                            <div class="slider-track">
                                ${slidesHTML}
                            </div>
                            
                        </div>
                        <div class="slider-indicators"></div>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                `;
            }

            createIndicators() {
                for (let i = 0; i < this.totalSlides; i++) {
                    const indicator = document.createElement('div');
                    indicator.className = 'indicator';
                    indicator.addEventListener('click', () => this.goToSlide(i));
                    this.indicatorsContainer.appendChild(indicator);
                }
            }

            setupEventListeners() {
                // Navigation buttons
                const prevBtn = this.container.querySelector('.nav-prev');
                const nextBtn = this.container.querySelector('.nav-next');
                
                prevBtn.addEventListener('click', () => this.prevSlide());
                nextBtn.addEventListener('click', () => this.nextSlide());

                // Image clicks for fullscreen
                this.slides.forEach(slide => {
                    const img = slide.querySelector('img');
                    img.addEventListener('click', () => this.openFullscreen(img));
                });

                // Hover pause/resume
                this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.container.addEventListener('mouseleave', () => this.startAutoPlay());

                // Touch/swipe support
                let startX = 0;
                let endX = 0;

                this.container.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });

                this.container.addEventListener('touchend', (e) => {
                    endX = e.changedTouches[0].clientX;
                    this.handleSwipe(startX, endX);
                });
            }

            updateSlider() {
                const translateX = -this.currentSlide * 100;
                this.sliderTrack.style.transform = `translateX(${translateX}%)`;
                
                // Update progress bar
                const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
                this.progressFill.style.width = `${progress}%`;
                
                // Update indicators
                const indicators = this.container.querySelectorAll('.indicator');
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === this.currentSlide);
                });
            }

            nextSlide() {
                this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                this.updateSlider();
            }

            prevSlide() {
                this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
                this.updateSlider();
            }

            goToSlide(slideIndex) {
                this.currentSlide = slideIndex;
                this.updateSlider();
            }

            startAutoPlay() {
                this.stopAutoPlay();
                this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
            }

            stopAutoPlay() {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                    this.autoPlayInterval = null;
                }
            }

            handleSwipe(startX, endX) {
                const diff = startX - endX;
                const threshold = 50;
                
                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            }

            openFullscreen(img) {
                const fullscreenModal = document.getElementById('fullscreenModal');
                const fullscreenImage = document.getElementById('fullscreenImage');

                const clickedSlide = img.closest('.slide');
                const slideIndex = Array.from(this.slides).indexOf(clickedSlide);
                
                fullscreenImage.src = img.src;
                fullscreenImage.alt = img.alt;
                fullscreenModal.classList.add('active');

                window.currentFullscreenSlider = this;
                window.currentFullscreenSlide = slideIndex;
                
                this.updateFullscreenNavigation();
                
                // Stop all sliders when in fullscreen
                SpaceSlider.stopAllSliders();
            }

            updateFullscreenNavigation() {
                const prevBtn = document.getElementById('fullscreenPrev');
                const nextBtn = document.getElementById('fullscreenNext');
                
                // Enable/disable buttons based on current position
                if (this.totalSlides <= 1) {
                    prevBtn.style.display = 'none';
                    nextBtn.style.display = 'none';
                } else {
                    prevBtn.style.display = 'block';
                    nextBtn.style.display = 'block';
                    prevBtn.disabled = false;
                    nextBtn.disabled = false;
                }
            }

            static navigateFullscreen(direction) {
                const slider = window.currentFullscreenSlider;
                const fullscreenImage = document.getElementById('fullscreenImage');
                
                if (!slider) return;
                
                if (direction === 'next') {
                    window.currentFullscreenSlide = (window.currentFullscreenSlide + 1) % slider.totalSlides;
                } else {
                    window.currentFullscreenSlide = (window.currentFullscreenSlide - 1 + slider.totalSlides) % slider.totalSlides;
                }
                
                const newSlide = slider.slides[window.currentFullscreenSlide];
                const newImg = newSlide.querySelector('img');
                
                fullscreenImage.src = newImg.src;
                fullscreenImage.alt = newImg.alt;
                
                // Also update the actual slider position
                slider.currentSlide = window.currentFullscreenSlide;
                slider.updateSlider();
            }

            static stopAllSliders() {
                SpaceSlider.instances.forEach(slider => slider.stopAutoPlay());
            }

            static startAllSliders() {
                SpaceSlider.instances.forEach(slider => slider.startAutoPlay());
            }
        }

        // Keep track of all slider instances
        SpaceSlider.instances = [];

        // Initialize all sliders on the page
        document.addEventListener('DOMContentLoaded', () => {
            const sliderElements = document.querySelectorAll('.space-slider');
            
            sliderElements.forEach(element => {
                const slider = new SpaceSlider(element);
                SpaceSlider.instances.push(slider);
            });

            // Setup shared fullscreen functionality
            setupFullscreenModal();
            setupKeyboardNavigation();
        });

        function setupFullscreenModal() {
            const fullscreenModal = document.getElementById('fullscreenModal');
            const fullscreenContent = document.getElementById('fullscreenContent');
            const fullscreenImage = document.getElementById('fullscreenImage');
            const fullscreenClose = document.getElementById('fullscreenClose');
            const fullscreenPrev = document.getElementById('fullscreenPrev');
            const fullscreenNext = document.getElementById('fullscreenNext');

            function closeFullscreen() {
                fullscreenModal.classList.remove('active');
                window.currentFullscreenSlider = null;
                window.currentFullscreenSlide = null;
                SpaceSlider.startAllSliders();
            }

            // Navigation in fullscreen
            fullscreenPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                SpaceSlider.navigateFullscreen('prev');
            });

            fullscreenNext.addEventListener('click', (e) => {
                e.stopPropagation();
                SpaceSlider.navigateFullscreen('next');
            });

            // Close fullscreen when clicking on the modal background (not the content)
            fullscreenModal.addEventListener('click', (e) => {
                if (e.target === fullscreenModal) {
                    closeFullscreen();
                }
            });
            
            // Close button
            fullscreenClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeFullscreen();
            });
            
            // Prevent closing when clicking on the content area
            fullscreenContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Keyboard navigation in fullscreen
            document.addEventListener('keydown', (e) => {
                if (fullscreenModal.classList.contains('active')) {
                    if (e.key === 'Escape') {
                        closeFullscreen();
                    } else if (e.key === 'ArrowLeft') {
                        SpaceSlider.navigateFullscreen('prev');
                    } else if (e.key === 'ArrowRight') {
                        SpaceSlider.navigateFullscreen('next');
                    }
                }
            });
        }        
        
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 6 + 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
                
                particlesContainer.appendChild(particle);
            }
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll animation to project cards
        function animateOnScroll() {
            const cards = document.querySelectorAll('.project-card');
            
            cards.forEach(card => {
                const cardTop = card.getBoundingClientRect().top;
                const cardVisible = 150;
                
                if (cardTop < window.innerHeight - cardVisible) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        }

        // Initialize particles and set up scroll animation
        window.addEventListener('load', () => {
            createParticles();
            
            // Set initial state for cards
            document.querySelectorAll('.project-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s ease';
            });
            
            animateOnScroll();
        });

        window.addEventListener('scroll', animateOnScroll);

        // Add interactive hover effects
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        //Functionalities for slides
        document.querySelectorAll('.slider').forEach((slider) => {
          const slidesEl = slider.querySelector('.slides');
          const slides = slider.querySelectorAll('.slide');
          let index = 0;

          const update = () => {
            slidesEl.style.transform = `translateX(-${index * 100}%)`;
          };

          slider.querySelector('.next').addEventListener('click', () => {
            index = (index + 1) % slides.length;
            update();
          });

          slider.querySelector('.prev').addEventListener('click', () => {
            index = (index - 1 + slides.length) % slides.length;
            update();
          });
  
});