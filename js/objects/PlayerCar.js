/**
 * PlayerCar - The player-controlled vehicle
 */
class PlayerCar {
    constructor(scene, x, y, vehicleId) {
        this.scene = scene;
        this.vehicleId = vehicleId;
        this.currentLane = Math.floor(GAME_CONFIG.LANES / 2); // Start in middle lane

        // Get vehicle data and computed stats
        this.vehicleData = VEHICLES[vehicleId];
        this.upgradeManager = new UpgradeManager();
        this.stats = this.upgradeManager.getVehicleStats(vehicleId);

        // Create sprite
        this.sprite = scene.add.sprite(x, y, vehicleId);
        this.sprite.setDepth(10);

        // Add physics body
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setSize(36, 65);
        this.sprite.body.setOffset(2, 2);

        // Movement state
        this.isMoving = false;
        this.targetX = x;
        this.laneChangeSpeed = 400 * (this.stats.handling / 100);

        // Boost state
        this.boostActive = false;
        this.boostCooldown = false;
        this.boostTimer = null;
        this.cooldownTimer = null;

        // Speed
        this.currentSpeed = GAME_CONFIG.BASE_SCROLL_SPEED;
        this.targetSpeed = GAME_CONFIG.BASE_SCROLL_SPEED;
        this.maxSpeed = GAME_CONFIG.MAX_SCROLL_SPEED * (this.stats.topSpeed / 100);
        this.accelerationRate = 50 * (this.stats.acceleration / 100);

        // Visual effects container
        this.effects = scene.add.container(x, y);
        this.effects.setDepth(9);

        // Create speed lines effect
        this.createSpeedLines();

        // Invincibility frames after close pass (prevents multi-counting)
        this.passedCars = new Set();
    }

    /**
     * Create speed line particles
     */
    createSpeedLines() {
        this.speedLines = [];
        for (let i = 0; i < 6; i++) {
            const line = this.scene.add.rectangle(
                (Math.random() - 0.5) * 60,
                30 + Math.random() * 40,
                2,
                15 + Math.random() * 15,
                0xffffff,
                0
            );
            this.effects.add(line);
            this.speedLines.push(line);
        }
    }

    /**
     * Update speed lines based on current speed
     */
    updateSpeedLines() {
        const speedRatio = (this.currentSpeed - GAME_CONFIG.BASE_SCROLL_SPEED) /
            (this.maxSpeed - GAME_CONFIG.BASE_SCROLL_SPEED);
        const alpha = Math.max(0, speedRatio * 0.5);

        this.speedLines.forEach((line, i) => {
            line.alpha = alpha;
            line.y += this.currentSpeed * 0.01;
            if (line.y > 70) {
                line.y = 30;
                line.x = (Math.random() - 0.5) * 60;
            }
        });
    }

    /**
     * Move to a specific lane
     */
    moveToLane(laneIndex) {
        // Clamp to valid lanes
        laneIndex = Math.max(0, Math.min(GAME_CONFIG.LANES - 1, laneIndex));

        if (laneIndex === this.currentLane) return;

        this.currentLane = laneIndex;

        // Calculate target X position
        const laneWidth = GAME_CONFIG.LANE_WIDTH;
        const roadMargin = GAME_CONFIG.ROAD_MARGIN;
        this.targetX = roadMargin + (laneIndex * laneWidth) + (laneWidth / 2);

        // Kill any existing movement tweens for instant response
        this.scene.tweens.killTweensOf(this.sprite);
        this.scene.tweens.killTweensOf(this.effects);

        // Very fast tween for snappy arcade feel (80ms max)
        const duration = Math.min(80, 100 * (100 / this.stats.handling));

        this.scene.tweens.add({
            targets: this.sprite,
            x: this.targetX,
            duration: duration,
            ease: 'Power2'
        });

        // Also move effects container
        this.scene.tweens.add({
            targets: this.effects,
            x: this.targetX,
            duration: duration,
            ease: 'Power2'
        });

        // Quick rotation during lane change
        const direction = this.targetX > this.sprite.x ? 1 : -1;
        this.scene.tweens.add({
            targets: this.sprite,
            angle: direction * 10,
            duration: 40,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Move left one lane
     */
    moveLeft() {
        this.moveToLane(this.currentLane - 1);
    }

    /**
     * Move right one lane
     */
    moveRight() {
        this.moveToLane(this.currentLane + 1);
    }

    /**
     * Activate boost
     */
    boost() {
        if (this.boostActive || this.boostCooldown) return false;

        this.boostActive = true;
        this.targetSpeed = this.maxSpeed * GAME_CONFIG.BOOST_MULTIPLIER;

        // Visual boost effect
        this.scene.tweens.add({
            targets: this.sprite,
            scaleY: 1.1,
            duration: 100
        });

        // End boost after duration
        this.boostTimer = this.scene.time.delayedCall(GAME_CONFIG.BOOST_DURATION, () => {
            this.endBoost();
        });

        return true;
    }

    /**
     * End boost and start cooldown
     */
    endBoost() {
        this.boostActive = false;
        this.boostCooldown = true;
        this.targetSpeed = this.maxSpeed;

        // Visual reset
        this.scene.tweens.add({
            targets: this.sprite,
            scaleY: 1,
            duration: 200
        });

        // Cooldown
        this.cooldownTimer = this.scene.time.delayedCall(GAME_CONFIG.BOOST_COOLDOWN, () => {
            this.boostCooldown = false;
        });
    }

    /**
     * Apply brakes
     */
    brake() {
        this.targetSpeed = GAME_CONFIG.BASE_SCROLL_SPEED * 0.6;
    }

    /**
     * Release brakes
     */
    releaseBrake() {
        this.targetSpeed = this.boostActive ?
            this.maxSpeed * GAME_CONFIG.BOOST_MULTIPLIER :
            this.maxSpeed;
    }

    /**
     * Check if a traffic car has already been counted as a pass
     */
    hasPassedCar(carId) {
        return this.passedCars.has(carId);
    }

    /**
     * Mark a car as passed
     */
    markCarPassed(carId) {
        this.passedCars.add(carId);

        // Clean up old entries after a delay
        this.scene.time.delayedCall(2000, () => {
            this.passedCars.delete(carId);
        });
    }

    /**
     * Get boost cooldown progress (0-1)
     */
    getBoostProgress() {
        if (this.boostActive) {
            return 1; // Full during boost
        }
        if (this.boostCooldown && this.cooldownTimer) {
            return 1 - (this.cooldownTimer.getProgress() || 0);
        }
        return 1; // Ready
    }

    /**
     * Update each frame
     */
    update(delta) {
        // Accelerate/decelerate towards target speed
        const speedDiff = this.targetSpeed - this.currentSpeed;
        const changeAmount = this.accelerationRate * (delta / 1000);

        if (Math.abs(speedDiff) < changeAmount) {
            this.currentSpeed = this.targetSpeed;
        } else {
            this.currentSpeed += Math.sign(speedDiff) * changeAmount;
        }

        // Update speed lines
        this.updateSpeedLines();

        // Update effects position to match sprite
        this.effects.y = this.sprite.y;
    }

    /**
     * Get current speed
     */
    getSpeed() {
        return this.currentSpeed;
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.boostTimer) this.boostTimer.remove();
        if (this.cooldownTimer) this.cooldownTimer.remove();
        this.effects.destroy();
        this.sprite.destroy();
    }
}
