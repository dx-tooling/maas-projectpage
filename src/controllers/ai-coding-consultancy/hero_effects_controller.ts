import { Controller } from "@hotwired/stimulus";

export default class HeroEffectsController extends Controller {
    private observer: IntersectionObserver | null = null;
    private activateTimeout: number | null = null; // Keep for potential future use?
    private initTimeout: number | null = null; // Keep for potential future use?

    static intersectionOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
    };
    static activeClass = "effects-active";

    connect() {
        // Check if already activated (e.g., by previous navigation)
        if (this.element.classList.contains(HeroEffectsController.activeClass)) {
            return; // Don't re-initialize if already active
        }

        this.observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.activate();
                    // Stop observing once activated
                    observerInstance.unobserve(entry.target);
                }
                // No else block - don't deactivate
            });
        }, HeroEffectsController.intersectionOptions);

        // Check initial visibility - slight delay can sometimes help browser rendering
        this.initTimeout = window.setTimeout(() => {
            const rect = this.element.getBoundingClientRect();
            const isVisibleInitially = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisibleInitially) {
                this.activate();
                // Stop observing if activated initially
                this.observer?.unobserve(this.element);
            } else {
                // Only start observing if not visible initially
                this.observer?.observe(this.element);
            }
            this.initTimeout = null; // Clear timeout ID after execution
        }, 50); // Small delay (e.g., 50ms)
    }

    disconnect() {
        // Clear timeouts
        if (this.initTimeout) {
            window.clearTimeout(this.initTimeout);
            this.initTimeout = null;
        }
        if (this.activateTimeout) {
            // Although activateTimeout isn't used now, clear it just in case
            window.clearTimeout(this.activateTimeout);
            this.activateTimeout = null;
        }
        // Stop observing
        if (this.observer) {
            // Unobserve might have already happened, but calling it again is safe
            this.observer.unobserve(this.element);
            this.observer.disconnect();
            this.observer = null;
        }
        // No need to call deactivate()
    }

    activate() {
        // Add class if not already present
        if (!this.element.classList.contains(HeroEffectsController.activeClass)) {
            this.element.classList.add(HeroEffectsController.activeClass);
        }
    }

    // Deactivate method removed as the effect should persist
    // deactivate() { ... }
}
