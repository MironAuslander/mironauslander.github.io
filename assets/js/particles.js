/**
 * Particle Network Animation for Hero Section
 * Creates an animated constellation-style background with connected particles
 */

class ParticleNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationFrame = null;
        this.glassBoxRect = null;

        // Configuration
        this.config = {
            particleCount: 150,
            particleSize: 2.5,
            connectionDistance: 120,
            mouseConnectionDistance: 200,
            particleSpeed: 0.3,
            particleColor: 'rgba(102, 126, 234, 0.8)',
            lineColor: 'rgba(102, 126, 234, 0.2)',
            mouseLineColor: 'rgba(102, 126, 234, 0.4)',
            refractionOffset: { x: 3, y: 3 } // Offset for refraction effect
        };

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.updateGlassBoxRect();
        this.animate();
    }

    updateGlassBoxRect() {
        const glassBox = document.querySelector('.hero-content');
        if (glassBox) {
            const rect = glassBox.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            this.glassBoxRect = {
                x: rect.left - canvasRect.left,
                y: rect.top - canvasRect.top,
                width: rect.width,
                height: rect.height
            };
        }
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    createParticles() {
        this.particles = [];
        const colors = ['#764ba2', '#667eea']; // Deep Purple and Soft Blue Purple
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                size: Math.random() * this.config.particleSize + 1,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
            this.updateGlassBoxRect();
        });

        // Mouse events for desktop
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0]; // Track first touch only
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0]; // Track first touch only
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        this.canvas.addEventListener('touchcancel', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }

            // Mouse interaction - attract particles
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    particle.vx += (dx / distance) * force * 0.02;
                    particle.vy += (dy / distance) * force * 0.02;
                }
            }

            // Apply velocity damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Maintain minimum speed
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed < this.config.particleSpeed * 0.5) {
                const angle = Math.random() * Math.PI * 2;
                particle.vx += Math.cos(angle) * 0.01;
                particle.vy += Math.sin(angle) * 0.01;
            }
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            // Check if particle is behind glass box and draw refracted version
            if (this.glassBoxRect && this.isParticleBehindGlass(this.particles[i])) {
                this.drawRefractedParticle(this.particles[i]);
            }

            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    const opacity = 1 - (distance / this.config.connectionDistance);
                    this.ctx.strokeStyle = this.config.lineColor.replace('0.2', (0.2 * opacity).toFixed(2));
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }

            // Draw mouse connections
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.particles[i].x - this.mouse.x;
                const dy = this.particles[i].y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.mouseConnectionDistance) {
                    const opacity = 1 - (distance / this.config.mouseConnectionDistance);
                    this.ctx.strokeStyle = this.config.mouseLineColor.replace('0.4', (0.4 * opacity).toFixed(2));
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles with glow effect
        this.particles.forEach(particle => {
            // Convert hex to RGB
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const rgb = hexToRgb(particle.color);
            const colorString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

            // Outer glow (4x particle size)
            const outerSize = particle.size * 4;
            const outerGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, outerSize
            );
            outerGradient.addColorStop(0, `rgba(${colorString}, 0.4)`);
            outerGradient.addColorStop(0.2, `rgba(${colorString}, 0.25)`);
            outerGradient.addColorStop(0.5, `rgba(${colorString}, 0.1)`);
            outerGradient.addColorStop(1, `rgba(${colorString}, 0)`);

            this.ctx.fillStyle = outerGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, outerSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Blurred middle part
            const middleGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2.5
            );
            middleGradient.addColorStop(0, `rgba(${colorString}, 0.7)`);
            middleGradient.addColorStop(0.5, `rgba(${colorString}, 0.5)`);
            middleGradient.addColorStop(1, `rgba(${colorString}, 0)`);

            this.ctx.fillStyle = middleGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * .5, 0, Math.PI * 2);
            this.ctx.fill();

            // Dark/transparent core with soft edges
            const coreGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 0.8
            );
            coreGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
            coreGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
            coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = coreGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw mouse indicator with glow
        if (this.mouse.x !== null && this.mouse.y !== null) {
            const mouseGradient = this.ctx.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, 12
            );
            mouseGradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)');
            mouseGradient.addColorStop(0.5, 'rgba(102, 126, 234, 0.3)');
            mouseGradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

            this.ctx.fillStyle = mouseGradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 12, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    isParticleBehindGlass(particle) {
        if (!this.glassBoxRect) return false;
        return particle.x >= this.glassBoxRect.x &&
               particle.x <= this.glassBoxRect.x + this.glassBoxRect.width &&
               particle.y >= this.glassBoxRect.y &&
               particle.y <= this.glassBoxRect.y + this.glassBoxRect.height;
    }

    drawRefractedParticle(particle) {
        // Draw a slightly offset, more transparent version to simulate refraction
        const offsetX = particle.x + this.config.refractionOffset.x;
        const offsetY = particle.y + this.config.refractionOffset.y;

        // Convert hex to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const rgb = hexToRgb(particle.color);
        const colorString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

        // Draw refracted particle with reduced opacity
        const refractedGradient = this.ctx.createRadialGradient(
            offsetX, offsetY, 0,
            offsetX, offsetY, particle.size * 3
        );
        refractedGradient.addColorStop(0, `rgba(${colorString}, 0.15)`);
        refractedGradient.addColorStop(0.5, `rgba(${colorString}, 0.08)`);
        refractedGradient.addColorStop(1, `rgba(${colorString}, 0)`);

        this.ctx.fillStyle = refractedGradient;
        this.ctx.beginPath();
        this.ctx.arc(offsetX, offsetY, particle.size * 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        window.removeEventListener('resize', this.resize);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        new ParticleNetwork(canvas);
    }
});
