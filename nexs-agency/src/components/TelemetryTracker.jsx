import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackTelemetry, trackClick } from "../services/telemetry";

/**
 * Global component that tracks page views across the entire application.
 * Listens to location changes to trigger telemetry pings.
 */
export default function TelemetryTracker() {
    const location = useLocation();

    useEffect(() => {
        // Build full path including query params
        const fullPath = location.pathname + location.search;

        // Async fire-and-forget ping
        trackTelemetry(fullPath, "view");
    }, [location]);

    // Track Global Clicks (Heatmap data)
    useEffect(() => {
        window.addEventListener("click", trackClick);
        return () => window.removeEventListener("click", trackClick);
    }, []);

    return null;
}
