/**
 * TrafficCar - AI-controlled traffic vehicles
 */
class TrafficCar {
    static nextId = 0;

    constructor(scene, x, y, trafficType, laneIndex) {
        this.scene = scene;
        this.id = TrafficCar.nextId++;
        this.trafficType = trafficType;
        this.laneIndex = laneIndex;

        // Speed relative to road scroll
        this.relativeSpeed = trafficType.speedMod * (0.7 + Math.random() * 0.3);

        // Create sprite
        this.sprite = scene.add.sprite(x, y, `traffic_${trafficType.type}`);
        this.sprite.setDepth(5);

        // Add physics body
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setSize(trafficType.width - 4, trafficType.height - 4);

        // Mark as not passed yet
        this.passed = false;
        this.counted = false;
    }

    /**
     * Update each frame
     */
    update(scrollSpeed) {
        // Traffic moves slower than scroll speed (appears to move down relative to player)
        const effectiveSpeed = scrollSpeed * (1 - this.relativeSpeed);
        this.sprite.y += effectiveSpeed * (1 / 60); // Approximate delta
    }

    /**
     * Mark this car as having been passed by the player
     */
    markPassed() {
        this.passed = true;
    }

    /**
     * Mark this car as counted for scoring
     */
    markCounted() {
        this.counted = true;
    }

    /**
     * Check if already counted
     */
    isCounted() {
        return this.counted;
    }

    /**
     * Get position
     */
    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    /**
     * Get bounding box
     */
    getBounds() {
        return this.sprite.getBounds();
    }

    /**
     * Clean up
     */
    destroy() {
        this.sprite.destroy();
    }
}
