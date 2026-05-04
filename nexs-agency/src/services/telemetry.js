import { encryptPayload } from '../utils/telemetry-crypto';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SECRET = import.meta.env.VITE_PUBLIC_CRYPTO_SECRET || "";

// In-memory session ID (persists across navigations in the same tab)
const SESSION_ID = typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).substring(2);

/**
 * Capture client-side context that the server cannot see (screen size, language, document referrer)
 */
function getClientContext() {
    if (typeof window === "undefined") return {};

    return {
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || "unknown",
        referrer: document.referrer || "direct",
    };
}

/**
 * Sends a telemetry event to the backend.
 * Fire-and-forget: does not throw errors if tracking fails.
 */
export async function trackTelemetry(path, eventType = "view", metadata = {}) {
    try {
        const token = localStorage.getItem('token');
        const context = getClientContext();

        const payload = {
            path,
            session_id: SESSION_ID,
            event_type: eventType,
            referrer: context.referrer,
            screen_size: context.screenSize,
            language: context.language,
            metadata,
        };

        // Encrypt the payload before sending
        const encrypted = await encryptPayload(payload, SECRET);

        fetch(`${API_URL}/telemetry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ p: encrypted }),
        }).catch((err) => console.warn("Telemetry ping failed:", err));

    } catch (err) {
        console.warn("Telemetry tracking error:", err);
    }
}

/**
 * Generates a CSS selector path for an element to identify its unique location.
 */
function getSelector(el) {
    const path = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
        let name = current.nodeName.toLowerCase();
        if (current.id) {
            name += `#${current.id}`;
            path.unshift(name);
            break;
        } else {
            let sibling = current;
            let nth = 1;
            while (sibling.previousElementSibling) {
                sibling = sibling.previousElementSibling;
                if (sibling.nodeName.toLowerCase() === name) nth++;
            }
            if (nth > 1) name += `:nth-of-type(${nth})`;
        }
        path.unshift(name);
        current = current.parentElement;
    }
    return path.join(" > ");
}

/**
 * Capture click coordinates and target element info.
 */
export async function trackClick(e) {
    const target = e.target;

    // Filter: Only track clicks on interactive elements or elements with IDs
    const interactiveEl = target.closest('a, button, input, select, textarea');
    const isInteractive = interactiveEl || target.id || window.getComputedStyle(target).cursor === 'pointer';

    if (!isInteractive) return;

    // If we clicked a child of a link/button, use the link/button as the target
    const el = interactiveEl || target;

    const metadata = {
        x: e.clientX,
        y: e.clientY,
        element: el.tagName.toLowerCase(),
        text: el.innerText?.trim().substring(0, 50) || undefined,
        selector: getSelector(el),
        href: el.href || undefined,
        id: el.id || undefined,
    };

    await trackTelemetry(window.location.pathname, "click", metadata);
}
