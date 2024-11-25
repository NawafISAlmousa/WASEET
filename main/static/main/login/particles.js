class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = this.canvas.height + Math.random() * 100;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Bounce off walls
        if (this.x < 0 || this.x > this.canvas.width) {
            this.speedX *= -1;
        }

        if (this.y < -10) {
            this.reset();
        }
    }
}

class ParticleAnimation {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isProvider = false;
        this.customerColor = { r: 0, g: 121, b: 107 }; // #00796b
        this.providerColor = { r: 41, g: 104, b: 121 }; // #296879
        this.currentColor = { ...this.customerColor };
        this.targetColor = { ...this.customerColor };
        this.maxDistance = 150; // Maximum distance for particle connections

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // Create particles
        const particleCount = Math.min(100, (this.canvas.width * this.canvas.height) / 20000);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    setMode(isProvider) {
        this.isProvider = isProvider;
        this.targetColor = isProvider ? this.providerColor : this.customerColor;
    }

    updateColors() {
        // Smooth color transition
        this.currentColor.r += (this.targetColor.r - this.currentColor.r) * 0.05;
        this.currentColor.g += (this.targetColor.g - this.currentColor.g) * 0.05;
        this.currentColor.b += (this.targetColor.b - this.currentColor.b) * 0.05;
    }

    drawLinks(particle1, particle2, distance) {
        const opacity = 1 - (distance / this.maxDistance);
        this.ctx.beginPath();
        this.ctx.moveTo(particle1.x, particle1.y);
        this.ctx.lineTo(particle2.x, particle2.y);
        this.ctx.strokeStyle = `rgba(${Math.round(this.currentColor.r)}, 
                                    ${Math.round(this.currentColor.g)}, 
                                    ${Math.round(this.currentColor.b)}, 
                                    ${opacity * 0.2})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateColors();

        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            particle.update();

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${Math.round(this.currentColor.r)}, 
                                      ${Math.round(this.currentColor.g)}, 
                                      ${Math.round(this.currentColor.b)}, 0.6)`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle2 = this.particles[j];
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.maxDistance) {
                    this.drawLinks(particle, particle2, distance);
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the animation
let particleAnimation;
document.addEventListener('DOMContentLoaded', () => {
    particleAnimation = new ParticleAnimation();
});

// Update the color changing function
function updateParticleColors(isProvider) {
    if (particleAnimation) {
        particleAnimation.setMode(isProvider);
    }
} 