export class GestureRecognizer {
    constructor() {
        this.state = 'IDLE'; // IDLE, HOLD, RISING
        this.startPoint = null;
        this.lastPoint = null;
        this.startTime = 0;

        // Tuning
        this.riseThresholdY = 0.1; // Amount of UP movement required to enter RISING state
    }

    /**
     * Analyze frame for gesturs.
     * @param {Object} point Current pointer position (smoothed)
     * @param {Boolean} isPinching Current pinch status
     * @param {Number} now Current timestamp
     */
    analyze(point, isPinching, now) {
        let result = { type: 'IDLE' };

        if (!point) {
            this.state = 'IDLE';
            this.startPoint = null;
            return result;
        }

        // State Machine
        switch (this.state) {
            case 'IDLE':
                if (isPinching) {
                    this.state = 'HOLD';
                    this.startPoint = point;
                    this.lastPoint = point;
                    result = { type: 'HOLD_START', x: point.x, y: point.y };
                } else {
                    // Check for WAND (Stars) if moving
                    if (this.lastPoint) {
                        const dist = Math.hypot(point.x - this.lastPoint.x, point.y - this.lastPoint.y);
                        if (dist > 0.002) {
                            result = { type: 'STAR_WAND', x: point.x, y: point.y, dx: point.x - this.lastPoint.x, dy: point.y - this.lastPoint.y };
                        }
                    }
                    this.lastPoint = point;
                }
                break;

            case 'HOLD':
                if (!isPinching) {
                    // Released too early -> IDLE or maybe small poof?
                    this.state = 'IDLE';
                } else {
                    // Check if moving UP
                    const dy = point.y - this.startPoint.y; // +y is down. -y is up.
                    // If moved UP significantly
                    if (dy < -this.riseThresholdY / 2) {
                        // Start RISING logic
                        this.state = 'RISING';
                    }
                    result = { type: 'HOLDING', x: point.x, y: point.y };
                }
                break;

            case 'RISING':
                if (!isPinching) {
                    // RELEASED! -> FIREWORK
                    this.state = 'IDLE';
                    result = { type: 'FIREWORK_TRIGGER', x: point.x, y: point.y };
                } else {
                    // Still rising... provide ROCKET feedback
                    result = { type: 'ROCKET_RISING', x: point.x, y: point.y };
                }
                break;
        }

        this.lastPoint = point;
        return result;
    }

    setSensitivity(val) {
        // Todo: Map sensitivity to thresholds if needed
    }
}
