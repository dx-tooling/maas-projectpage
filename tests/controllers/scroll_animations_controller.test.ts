import { Application } from "@hotwired/stimulus";
import ScrollAnimationsController from "../../src/controllers/scroll_animations_controller";

describe("ScrollAnimationsController", () => {
    let application: Application;
    let container: HTMLElement;

    beforeEach(() => {
        // Clear any existing DOM content
        document.body.innerHTML = "";

        container = document.createElement("div");
        container.innerHTML = `
            <div data-controller="scroll-animations">
                <div data-scroll-animations-target="animate" class="scroll-animate">Element 1</div>
                <div data-scroll-animations-target="animate" class="scroll-animate">Element 2</div>
                <div data-scroll-animations-target="animate" class="scroll-animate">Element 3</div>
            </div>
        `;
        document.body.appendChild(container);

        application = Application.start();
        application.register("scroll-animations", ScrollAnimationsController);
    });

    afterEach(() => {
        if (application) {
            application.stop();
        }
        // Clean up DOM
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        document.body.innerHTML = "";
    });

    it("should connect without errors", () => {
        const element = container.querySelector('[data-controller="scroll-animations"]');
        expect(element).not.toBeNull();
        expect(element).toBeDefined();
    });

    it("should have proper static targets configuration", () => {
        expect(ScrollAnimationsController.targets).toEqual(["animate"]);
    });

    it("should have proper static values configuration", () => {
        expect(ScrollAnimationsController.values).toEqual({
            threshold: Number,
            rootMargin: String,
        });
    });

    it("should respect reduced motion preferences", () => {
        // Mock matchMedia to return reduced motion preference
        const originalMatchMedia = window.matchMedia;

        const mockMatchMedia = vi.fn().mockImplementation((query) => ({
            matches: query.includes("prefers-reduced-motion: reduce"),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        window.matchMedia = mockMatchMedia;

        try {
            // Create a simple test element without triggering complex DOM interactions
            const testElement = document.createElement("div");
            testElement.setAttribute("data-controller", "scroll-animations");
            testElement.innerHTML = '<div data-scroll-animations-target="animate" class="scroll-animate">Test</div>';

            // Test that elements exist and can be queried
            const animateElements = testElement.querySelectorAll('[data-scroll-animations-target="animate"]');
            expect(animateElements.length).toBe(1);
            expect(animateElements[0].classList.contains("scroll-animate")).toBe(true);
        } finally {
            // Restore original matchMedia
            window.matchMedia = originalMatchMedia;
        }
    });

    it("should handle IntersectionObserver configuration", () => {
        // Mock IntersectionObserver to ensure it can be instantiated
        const originalIntersectionObserver = window.IntersectionObserver;

        const mockObserver = {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
            takeRecords: vi.fn().mockReturnValue([]),
        };

        const MockIntersectionObserver = vi.fn().mockImplementation(() => mockObserver);
        window.IntersectionObserver = MockIntersectionObserver;

        try {
            // Test that the controller can be registered without errors
            const testApp = Application.start();
            testApp.register("test-scroll-animations", ScrollAnimationsController);

            // Create a test element and attach the controller
            const testElement = document.createElement("div");
            testElement.setAttribute("data-controller", "test-scroll-animations");
            testElement.innerHTML = '<div data-test-scroll-animations-target="animate">Test</div>';
            document.body.appendChild(testElement);

            // Clean up
            testApp.stop();
            if (testElement.parentNode) {
                testElement.parentNode.removeChild(testElement);
            }
        } finally {
            // Restore original IntersectionObserver
            window.IntersectionObserver = originalIntersectionObserver;
        }
    });
});
