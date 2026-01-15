import '@mediapipe/hands';

export class Tracker {
    constructor() {
        this.results = null;
        this.history = [];
        this.historySize = 5; // Configurable smoothing window

        const HandsConstructor = globalThis.Hands;
        if (!HandsConstructor) {
            throw new Error('MediaPipe Hands failed to load.');
        }

        this.hands = new HandsConstructor({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));
    }

    onResults(results) {
        this.results = results;
    }

    /**
     * Processes a video frame.
     * @param {HTMLVideoElement} input Video element
     */
    async process(input) {
        if (!input || input.readyState < 2) return;
        await this.hands.send({ image: input });
    }

    /**
     * Returns the normalized coordinates of the index finger tip.
     * @returns {Object|null} { x, y } or null if not detected
     */
    getPrimaryPointer() {
        if (!this.results || !this.results.multiHandLandmarks || this.results.multiHandLandmarks.length === 0) {
            // Reset history on tracking loss to avoid "dragging" the point from old position
            this.history = [];
            return null;
        }

        const landmarks = this.results.multiHandLandmarks[0];
        // Index finger tip is landmark 8
        const indexTip = landmarks[8];

        // Add to history
        this.history.push({ x: indexTip.x, y: indexTip.y });
        if (this.history.length > this.historySize) {
            this.history.shift();
        }

        // Calculate average
        let sumX = 0;
        let sumY = 0;
        for (const pt of this.history) {
            sumX += pt.x;
            sumY += pt.y;
        }

        return {
            x: sumX / this.history.length,
            y: sumY / this.history.length
        };
    }

    /**
     * Checks if the user is pinching (Index Tip close to Thumb Tip).
     * @returns {Object} { isPinching: boolean, x: number, y: number }
     */
    getPinchStatus() {
        if (!this.results || !this.results.multiHandLandmarks || this.results.multiHandLandmarks.length === 0) {
            return { isPinching: false, x: 0, y: 0 };
        }

        const landmarks = this.results.multiHandLandmarks[0];
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Calculate distance (simple euclidean in normalized coords)
        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Threshold for pinch. Normalized coords (0..1).
        // Tune this value. 0.05 is usually safe for close contact.
        const PINCH_THRESHOLD = 0.05;

        // Midpoint for interaction
        const midX = (indexTip.x + thumbTip.x) / 2;
        const midY = (indexTip.y + thumbTip.y) / 2;

        return {
            isPinching: dist < PINCH_THRESHOLD,
            x: midX,
            y: midY,
            dist: dist
        };
    }
}
