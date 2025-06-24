import { Controller } from "@hotwired/stimulus";

export default class ScrollAnimationsController extends Controller {
    static targets = ["animate"];
    static values = { threshold: Number, rootMargin: String };

    declare readonly animateTargets: HTMLElement[];
    declare readonly thresholdValue: number;
    declare readonly rootMarginValue: string;

    private observer: IntersectionObserver | null = null;

    connect() {
        // Respect user's motion preferences
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            // If user prefers reduced motion, just show all elements immediately
            this.animateTargets.forEach((target) => {
                target.classList.add("animate-in");
            });
            return;
        }

        this.setupIntersectionObserver();
    }

    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    private setupIntersectionObserver() {
        // Moderately faster triggering - start animation when element is about 50% from viewport
        const threshold = this.thresholdValue || 0.1; // Good threshold for reliable detection
        const rootMargin = this.rootMarginValue || "0px 0px 50% 0px"; // Trigger when element is 50% away from viewport

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target as HTMLElement;

                        // Check for custom delay on the element, otherwise use index-based delay
                        const customDelay = target.dataset.animationDelay;
                        let delay: number;

                        if (customDelay) {
                            delay = parseInt(customDelay, 10);
                        } else {
                            // Slightly faster stagger for more responsive feel
                            delay = Array.from(this.animateTargets).indexOf(target) * 60; // Reduced from 75ms to 60ms
                        }

                        setTimeout(() => {
                            target.classList.add("animate-in");
                        }, delay);

                        // Stop observing this element once it's animated
                        this.observer?.unobserve(target);
                    }
                });
            },
            {
                threshold,
                rootMargin,
            },
        );

        // Start observing all animation targets
        this.animateTargets.forEach((target) => {
            this.observer?.observe(target);
        });
    }
}
