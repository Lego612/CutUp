/**
 * GameScene - Core gameplay scene
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        // Initialize systems
        this.scoreManager = new ScoreManager(this);
        this.trafficSpawner = new TrafficSpawner(this);

        // Game state
        this.isGameOver = false;
        this.runTime = 0;
        this.difficultyTimer = 0;

        // Create game elements
        this.createRoad();
        this.createPlayer();
        this.createTrafficGroup();
        this.createHUD();
        this.setupControls();

        // Start traffic spawning
        this.trafficSpawner.init(this.trafficGroup);
        this.trafficSpawner.start();

        // Collision detection
        this.physics.add.overlap(
            this.player.sprite,
            this.trafficGroup,
            this.handleCollision,
            null,
            this
        );
    }

    createRoad() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const roadWidth = GAME_CONFIG.LANES * GAME_CONFIG.LANE_WIDTH;
        const roadX = GAME_CONFIG.ROAD_MARGIN;

        // Outer glow effects (behind everything)
        this.roadGlow = this.add.graphics();
        this.roadGlow.fillStyle(0xff0066, 0.15);
        this.roadGlow.fillRect(roadX - 12, 0, 12, height);
        this.roadGlow.fillStyle(0xff0066, 0.08);
        this.roadGlow.fillRect(roadX - 20, 0, 8, height);

        this.roadGlow.fillStyle(0xff0066, 0.15);
        this.roadGlow.fillRect(roadX + roadWidth, 0, 12, height);
        this.roadGlow.fillStyle(0xff0066, 0.08);
        this.roadGlow.fillRect(roadX + roadWidth + 12, 0, 8, height);

        // Shoulder/grass areas with gradient
        this.roadBg = this.add.graphics();
        this.roadBg.fillGradientStyle(0x0a0a14, 0x0a0a14, 0x1a0a2e, 0x1a0a2e, 1);
        this.roadBg.fillRect(0, 0, roadX - 8, height);
        this.roadBg.fillRect(roadX + roadWidth + 8, 0, width - (roadX + roadWidth + 8), height);

        // Road surface with subtle texture feel
        this.roadBg.fillStyle(0x181828, 1);
        this.roadBg.fillRect(roadX, 0, roadWidth, height);

        // Road edge details
        this.roadBg.fillStyle(0x222235, 1);
        this.roadBg.fillRect(roadX, 0, 3, height);
        this.roadBg.fillRect(roadX + roadWidth - 3, 0, 3, height);

        // Neon side strips (road edges)
        this.roadBg.fillStyle(0xff3366, 1);
        this.roadBg.fillRect(roadX - 4, 0, 4, height);
        this.roadBg.fillRect(roadX + roadWidth, 0, 4, height);

        // Inner glow on edges
        this.roadBg.fillStyle(0xff6699, 0.4);
        this.roadBg.fillRect(roadX, 0, 2, height);
        this.roadBg.fillRect(roadX + roadWidth - 2, 0, 2, height);

        // Lane markers - animated with glow
        this.laneMarkers = [];
        for (let lane = 1; lane < GAME_CONFIG.LANES; lane++) {
            const laneX = roadX + (lane * GAME_CONFIG.LANE_WIDTH);
            const isCenter = lane === Math.floor(GAME_CONFIG.LANES / 2);

            for (let i = 0; i < 12; i++) {
                // Glow behind center lane marker
                if (isCenter) {
                    const glow = this.add.rectangle(
                        laneX,
                        i * 80 - 40,
                        8,
                        44,
                        0xffcc00,
                        0.2
                    );
                    glow.setDepth(0);
                    this.laneMarkers.push(glow);
                }

                const marker = this.add.rectangle(
                    laneX,
                    i * 80 - 40,
                    isCenter ? 5 : 3,
                    isCenter ? 45 : 35,
                    isCenter ? 0xffcc00 : 0x4a4a6a
                );
                marker.setDepth(1);
                this.laneMarkers.push(marker);
            }
        }
    }

    createPlayer() {
        const saveData = window.gameState.saveData;
        const vehicleId = saveData.selectedVehicle;

        // Calculate starting position (middle lane)
        const middleLane = Math.floor(GAME_CONFIG.LANES / 2);
        const laneWidth = GAME_CONFIG.LANE_WIDTH;
        const roadMargin = GAME_CONFIG.ROAD_MARGIN;
        const startX = roadMargin + (middleLane * laneWidth) + (laneWidth / 2);
        const startY = this.cameras.main.height - 150;

        this.player = new PlayerCar(this, startX, startY, vehicleId);
    }

    createTrafficGroup() {
        this.trafficGroup = this.physics.add.group();
    }

    createHUD() {
        const width = this.cameras.main.width;

        // HUD container
        this.hudContainer = this.add.container(0, 0);
        this.hudContainer.setDepth(100);

        // Top bar background
        const topBar = this.add.graphics();
        topBar.fillStyle(0x0a0a18, 0.9);
        topBar.fillRect(0, 0, width, 60);
        topBar.fillStyle(0xff00e5, 0.8);
        topBar.fillRect(0, 58, width, 2);
        this.hudContainer.add(topBar);

        // Money display
        this.moneyText = this.add.text(20, 18, '$0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        this.hudContainer.add(this.moneyText);

        // Combo display
        this.comboContainer = this.add.container(width / 2, 30);
        this.comboText = this.add.text(0, 0, '', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0.5);
        this.comboContainer.add(this.comboText);
        this.hudContainer.add(this.comboContainer);

        // Speed display
        this.speedText = this.add.text(width - 20, 18, '0 MPH', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#00f5ff'
        }).setOrigin(1, 0);
        this.hudContainer.add(this.speedText);

        // Boost meter
        this.createBoostMeter(width - 75, 48);

        // Floating text pool for rewards
        this.floatingTexts = [];
    }

    createBoostMeter(x, y) {
        // Background bar
        this.boostMeterBg = this.add.graphics();
        this.boostMeterBg.fillStyle(0x222233, 1);
        this.boostMeterBg.fillRoundedRect(x, y - 4, 60, 8, 4);
        this.boostMeterBg.lineStyle(1, 0x444466, 1);
        this.boostMeterBg.strokeRoundedRect(x, y - 4, 60, 8, 4);
        this.hudContainer.add(this.boostMeterBg);

        // Fill bar
        this.boostMeterFill = this.add.rectangle(x + 2, y, 0, 4, 0xffcc00);
        this.boostMeterFill.setOrigin(0, 0.5);
        this.hudContainer.add(this.boostMeterFill);
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Track key states for responsive lane changes
        this.leftPressed = false;
        this.rightPressed = false;
        this.braking = false;

        // Lane change cooldown (allows rapid but not instant double-taps)
        this.laneChangeCooldown = 0;

        // Mobile touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        const width = this.cameras.main.width;

        // Simple tap detection - check which side of screen was tapped
        this.input.on('pointerdown', (pointer) => {
            if (this.isGameOver) return;
            if (this.laneChangeCooldown > 0) return;

            // Tap on left half = move left, tap on right half = move right
            if (pointer.x < width / 2) {
                this.player.changeLane(-1);
            } else {
                this.player.changeLane(1);
            }
            this.laneChangeCooldown = 100;
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        this.runTime += delta;
        this.difficultyTimer += delta;

        // Handle input
        this.handleInput();

        // Update player
        this.player.update(delta);

        // Get current scroll speed
        const scrollSpeed = this.player.getSpeed();

        // Update road animation
        this.updateRoad(scrollSpeed, delta);

        // Update traffic
        this.trafficSpawner.update(scrollSpeed);

        // Check for close passes
        this.checkClosePasses();

        // Add speed bonus
        const speedBonus = this.scoreManager.addSpeedBonus(scrollSpeed, delta / 1000);

        // Increase difficulty over time
        if (this.difficultyTimer > 10000) {
            this.trafficSpawner.increaseDifficulty(0.1);
            this.difficultyTimer = 0;
        }

        // Update HUD
        this.updateHUD();
    }

    handleInput() {
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        // Decrease cooldown
        if (this.laneChangeCooldown > 0) {
            this.laneChangeCooldown -= 16; // Approximate frame time
        }

        // Lane change on key press with short cooldown for rapid changes
        if (left && !this.leftPressed && this.laneChangeCooldown <= 0) {
            this.player.moveLeft();
            this.laneChangeCooldown = 100; // 100ms cooldown between lane changes
        }
        if (right && !this.rightPressed && this.laneChangeCooldown <= 0) {
            this.player.moveRight();
            this.laneChangeCooldown = 100;
        }

        this.leftPressed = left;
        this.rightPressed = right;

        // Boost on up press
        if (up && !this.braking) {
            this.player.boost();
        }

        // Brake on down hold
        if (down) {
            if (!this.braking) {
                this.player.brake();
                this.braking = true;
            }
        } else if (this.braking) {
            this.player.releaseBrake();
            this.braking = false;
        }
    }

    updateRoad(scrollSpeed, delta) {
        const moveAmount = scrollSpeed * (delta / 1000);

        this.laneMarkers.forEach(marker => {
            marker.y += moveAmount;
            if (marker.y > this.cameras.main.height + 40) {
                marker.y -= (12 * 80);
            }
        });
    }

    checkClosePasses() {
        const playerBounds = this.player.sprite.getBounds();
        const playerCenterY = playerBounds.centerY;

        this.trafficGroup.getChildren().forEach(sprite => {
            if (!sprite.trafficCar || sprite.trafficCar.isCounted()) return;

            const trafficBounds = sprite.getBounds();
            const trafficCenterY = trafficBounds.centerY;

            // Check if traffic car has passed player (is now below)
            if (trafficCenterY > playerCenterY + 40) {
                const horizontalDist = Math.abs(trafficBounds.centerX - playerBounds.centerX);

                // Check if it was a close pass
                if (horizontalDist < GAME_CONFIG.CLOSE_PASS_DISTANCE) {
                    sprite.trafficCar.markCounted();

                    const result = this.scoreManager.registerClosePass(horizontalDist);
                    this.showRewardPopup(result.reward, trafficBounds.centerX, trafficBounds.centerY);

                    // Update combo display
                    this.updateComboDisplay(result.combo, result.multiplier);
                }
            }
        });
    }

    showRewardPopup(amount, x, y) {
        const text = this.add.text(x, y, `+$${amount}`, {
            fontFamily: 'Orbitron',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#00ff88'
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => text.destroy()
        });
    }

    updateComboDisplay(combo, multiplier) {
        if (combo > 1) {
            this.comboText.setText(`x${multiplier} COMBO!`);

            // Pop animation
            this.tweens.add({
                targets: this.comboContainer,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 100,
                yoyo: true
            });
        } else {
            this.comboText.setText('');
        }
    }

    updateHUD() {
        // Money
        this.moneyText.setText(`$${this.scoreManager.runMoney.toLocaleString()}`);

        // Speed (convert to fake MPH)
        const speed = Math.floor(this.player.getSpeed() * 0.3);
        this.speedText.setText(`${speed} MPH`);

        // Boost meter
        const boostProgress = this.player.getBoostProgress();
        this.boostMeterFill.width = 56 * boostProgress;

        if (this.player.boostActive) {
            this.boostMeterFill.fillColor = 0xff6600;
        } else if (this.player.boostCooldown) {
            this.boostMeterFill.fillColor = 0x666666;
        } else {
            this.boostMeterFill.fillColor = 0xffff00;
        }

        // Combo fade if no recent passes
        if (this.scoreManager.combo === 0 && this.comboText.text !== '') {
            this.tweens.add({
                targets: this.comboText,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.comboText.setText('');
                    this.comboText.alpha = 1;
                }
            });
        }
    }

    handleCollision(playerSprite, trafficSprite) {
        if (this.isGameOver) return;

        this.gameOver();
    }

    gameOver() {
        this.isGameOver = true;

        // Stop traffic spawning
        this.trafficSpawner.stop();

        // Finalize score
        this.scoreManager.finalizeRun();

        // Crash effect
        this.cameras.main.shake(300, 0.02);
        this.cameras.main.flash(200, 255, 50, 50);

        // Slow motion effect
        this.tweens.add({
            targets: this.player.sprite,
            alpha: 0.5,
            angle: 15,
            duration: 500
        });

        // Transition to game over
        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('GameOverScene');
            });
        });
    }

    shutdown() {
        // Clean up
        this.trafficSpawner.destroy();
        if (this.player) this.player.destroy();
    }
}
