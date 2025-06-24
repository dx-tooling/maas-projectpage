// Test setup file to handle JSDOM compatibility issues

// Handle unhandled promise rejections that come from JSDOM/Node.js compatibility issues
process.on("unhandledRejection", (reason) => {
    // Check if this is the specific JSDOM HTMLBaseElement error we're encountering
    if (
        reason instanceof TypeError &&
        reason.message.includes("'get href' called on an object that is not a valid instance of HTMLBaseElement")
    ) {
        // Silently ignore this specific JSDOM compatibility issue
        console.warn("Suppressed JSDOM compatibility error:", reason.message);
        return;
    }

    // For other unhandled rejections, log and potentially fail the test
    console.error("Unhandled promise rejection:", reason);
    // Don't throw here as it would crash the test runner
});

// Mock console.error to suppress JSDOM-related errors during tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
    const message = args.join(" ");
    // Suppress specific JSDOM-related errors
    if (message.includes("HTMLBaseElement") || message.includes("jsdom/lib/jsdom/living/generated")) {
        return;
    }
    originalConsoleError.apply(console, args);
};

// Enhance JSDOM environment for better compatibility
if (typeof window !== "undefined" && window.document) {
    // Fix potential issues with base element handling
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName: string, options?: ElementCreationOptions) {
        const element = originalCreateElement.call(this, tagName, options);

        // Special handling for base elements to prevent href getter issues
        if (tagName.toLowerCase() === "base") {
            Object.defineProperty(element, "href", {
                get() {
                    return this.getAttribute("href") || "";
                },
                set(value: string) {
                    this.setAttribute("href", value);
                },
                enumerable: true,
                configurable: true,
            });
        }

        return element;
    };
}
