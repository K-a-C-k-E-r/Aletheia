'use client';

import { useEffect, useRef, useState } from 'react';

export default function TorchCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [isOverInteractive, setIsOverInteractive] = useState(false);
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Check if device supports hover (not mobile)
        const isMobile = window.matchMedia('(hover: none)').matches;
        if (isMobile) return;

        const handleMouseMove = (e: MouseEvent) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
            if (!isVisible) setIsVisible(true);

            // Check if over interactive element
            const target = e.target as HTMLElement;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') !== null ||
                target.closest('a') !== null ||
                target.classList.contains('glass-hover');

            setIsOverInteractive(isInteractive);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        // Smooth easing animation with luxury delay (100ms lag)
        const animate = () => {
            const dx = targetRef.current.x - currentRef.current.x;
            const dy = targetRef.current.y - currentRef.current.y;

            // Luxury easing: slower, smoother
            currentRef.current.x += dx * 0.12;
            currentRef.current.y += dy * 0.12;

            setPosition({
                x: currentRef.current.x,
                y: currentRef.current.y,
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.body.addEventListener('mouseleave', handleMouseLeave);

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const intensityMultiplier = isOverInteractive ? 1.3 : 1;

    return (
        <div
            className="fixed pointer-events-none transition-opacity duration-300"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                opacity: isVisible ? 1 : 0,
            }}
        >
            {/* Outer glow - larger, softer */}
            <div
                className="absolute"
                style={{
                    width: '800px',
                    height: '800px',
                    background: `radial-gradient(circle, rgba(79, 209, 255, ${0.06 * intensityMultiplier}) 0%, rgba(79, 209, 255, ${0.02 * intensityMultiplier}) 40%, transparent 70%)`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(50px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            />
            {/* Inner glow */}
            <div
                className="absolute"
                style={{
                    width: '400px',
                    height: '400px',
                    background: `radial-gradient(circle, rgba(28, 181, 163, ${0.08 * intensityMultiplier}) 0%, rgba(28, 181, 163, ${0.03 * intensityMultiplier}) 50%, transparent 80%)`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(30px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            />
            {/* Core light - very subtle */}
            <div
                className="absolute"
                style={{
                    width: '150px',
                    height: '150px',
                    background: `radial-gradient(circle, rgba(255, 255, 255, ${0.04 * intensityMultiplier}) 0%, transparent 70%)`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(15px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            />
        </div>
    );
}
