/**
 * TrafficSpawner - Manages traffic generation and patterns
 */
class TrafficSpawner {
    constructor(scene) {
        this.scene = scene;
        this.trafficGroup = null;
        this.spawnTimer = null;
        this.difficulty = 1;
        this.baseSpawnInterval = GAME_CONFIG.TRAFFIC_SPAWN_INTERVAL;
    }

    /**
     * Initialize the spawner with a physics group
     */
    init(trafficGroup) {
        this.trafficGroup = trafficGroup;
        this.difficulty = 1;
    }

    /**
     * Start spawning traffic
     */
    start() {
        this.scheduleNextSpawn();
    }

    /**
     * Stop spawning traffic
     */
    stop() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
    }

    /**
     * Schedule the next spawn
     */
    scheduleNextSpawn() {
        const interval = this.baseSpawnInterval / this.difficulty;
        const variance = interval * 0.3;
        const delay = interval + (Math.random() * variance * 2 - variance);

        this.spawnTimer = this.scene.time.delayedCall(delay, () => {
            this.spawnTraffic();
            this.scheduleNextSpawn();
        });
    }

    /**
     * Spawn a traffic vehicle
     */
    spawnTraffic() {
        // Select random lane(s)
        const lanes = this.selectLanes();

        lanes.forEach(lane => {
            this.spawnInLane(lane);
        });
    }

    /**
     * Select which lanes to spawn in
     */
    selectLanes() {
        const numLanes = GAME_CONFIG.LANES;
        const lanes = [];

        // At higher difficulty, sometimes spawn in multiple lanes
        const numToSpawn = this.difficulty > 2 && Math.random() < 0.3 ? 2 : 1;

        for (let i = 0; i < numToSpawn; i++) {
            let lane;
            do {
                lane = Math.floor(Math.random() * numLanes);
            } while (lanes.includes(lane));
            lanes.push(lane);
        }

        return lanes;
    }

    /**
     * Spawn a traffic car in a specific lane
     */
    spawnInLane(laneIndex) {
        // Select random traffic type
        const trafficType = TRAFFIC_TYPES[Math.floor(Math.random() * TRAFFIC_TYPES.length)];

        // Calculate lane position
        const laneWidth = GAME_CONFIG.LANE_WIDTH;
        const roadMargin = GAME_CONFIG.ROAD_MARGIN;
        const laneX = roadMargin + (laneIndex * laneWidth) + (laneWidth / 2);

        // Spawn above the screen
        const spawnY = -100;

        // Create traffic car
        const car = new TrafficCar(
            this.scene,
            laneX,
            spawnY,
            trafficType,
            laneIndex
        );

        // Add to group
        this.trafficGroup.add(car.sprite);

        // Store reference to the TrafficCar instance
        car.sprite.trafficCar = car;

        return car;
    }

    /**
     * Increase difficulty over time
     */
    increaseDifficulty(amount = 0.1) {
        this.difficulty = Math.min(this.difficulty + amount, 3);
    }

    /**
     * Update all traffic (called each frame)
     */
    update(scrollSpeed) {
        if (!this.trafficGroup) return;

        this.trafficGroup.getChildren().forEach(sprite => {
            if (sprite.trafficCar) {
                sprite.trafficCar.update(scrollSpeed);

                // Remove if off screen
                if (sprite.y > this.scene.cameras.main.height + 100) {
                    sprite.trafficCar.destroy();
                }
            }
        });
    }

    /**
     * Clean up
     */
    destroy() {
        this.stop();
        if (this.trafficGroup) {
            this.trafficGroup.clear(true, true);
        }
    }
}
