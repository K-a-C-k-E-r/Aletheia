'use client';

import { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    angle: number; // Direction from center (radians)
    layer: number; // 0 = micro (slow), 1 = mid, 2 = small (medium)
}

export default function StarfieldBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const scrollYRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const centerRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Detect low-end devices
        const isLowEnd = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const performanceMultiplier = isLowEnd ? 0.6 : 1;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            centerRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
            initStars();
        };

        // Core emission radius (2-4% of viewport width)
        const getCoreRadius = () => canvas.width * 0.03;

        // Spawn a star from the central core
        const spawnStar = (): Star => {
            const layer = Math.random();
            const angle = Math.random() * Math.PI * 2;

            // Spawn within core radius with soft edge
            const spawnRadius = Math.random() * getCoreRadius();
            const center = centerRef.current;

            return {
                x: center.x + Math.cos(angle) * spawnRadius,
                y: center.y + Math.sin(angle) * spawnRadius,
                size: layer < 0.7 ? 0.5 + Math.random() * 0.5 : layer < 0.95 ? 1 : 1.2 + Math.random() * 0.8,
                opacity: layer < 0.7 ? 0.2 + Math.random() * 0.3 : 0.4 + Math.random() * 0.4,
                speed: layer < 0.7 ? 0.2 + Math.random() * 0.15 : layer < 0.95 ? 0.35 + Math.random() * 0.2 : 0.5 + Math.random() * 0.25,
                angle,
                layer: layer < 0.7 ? 0 : layer < 0.95 ? 1 : 2,
            };
        };

        // Initialize stars
        const initStars = () => {
            const stars: Star[] = [];
            const baseCount = Math.floor((canvas.width * canvas.height) / 4000);
            const starCount = Math.floor(baseCount * performanceMultiplier);

            for (let i = 0; i < starCount; i++) {
                const star = spawnStar();
                // Distribute stars across the viewport for initial state
                const distance = Math.random() * Math.max(canvas.width, canvas.height) * 0.6;
                star.x = centerRef.current.x + Math.cos(star.angle) * distance;
                star.y = centerRef.current.y + Math.sin(star.angle) * distance;
                stars.push(star);
            }

            starsRef.current = stars;
        };

        // Animation loop with radial emission
        const animate = () => {
            if (!ctx || !canvas) return;

            // Clear canvas with deep space black
            ctx.fillStyle = '#070709';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const center = centerRef.current;
            const maxDistance = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2;

            // Scroll influence (subtle acceleration/deceleration)
            const scrollInfluence = 1 + (scrollYRef.current * 0.00008);

            // Mouse influence (subtle angular bias ±3°)
            const mouseDx = (mouseRef.current.x - center.x) / canvas.width;
            const mouseDy = (mouseRef.current.y - center.y) / canvas.height;
            const mouseAngleBias = (mouseDx + mouseDy) * 0.05; // Max ±3° influence

            // Update and draw stars
            starsRef.current.forEach((star, index) => {
                // Apply mouse bias to angle (barely noticeable)
                const adjustedAngle = star.angle + mouseAngleBias;

                // Move star outward from center
                const distance = Math.sqrt(
                    (star.x - center.x) ** 2 + (star.y - center.y) ** 2
                );

                const newDistance = distance + star.speed * scrollInfluence;

                // Calculate new position
                star.x = center.x + Math.cos(adjustedAngle) * newDistance;
                star.y = center.y + Math.sin(adjustedAngle) * newDistance;

                // Check if star has exited viewport
                if (
                    newDistance > maxDistance ||
                    star.x < -50 ||
                    star.x > canvas.width + 50 ||
                    star.y < -50 ||
                    star.y > canvas.height + 50
                ) {
                    // Respawn from center core
                    const newStar = spawnStar();
                    starsRef.current[index] = newStar;
                    return;
                }

                // Subtle twinkle (very gentle)
                const twinkle = Math.sin(Date.now() * 0.0008 + star.x * 0.01) * 0.1;
                const currentOpacity = Math.max(0.15, Math.min(0.8, star.opacity + twinkle));

                // Draw star with cool white / slight blue tint
                ctx.fillStyle = `rgba(250, 252, 255, ${currentOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Handle scroll for subtle acceleration
        const handleScroll = () => {
            scrollYRef.current = window.scrollY;
        };

        // Handle mouse move for subtle angular bias
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', handleScroll, { passive: true });

        if (!isLowEnd) {
            window.addEventListener('mousemove', handleMouseMove, { passive: true });
        }

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
