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

        // Top bar background (pixel style) - taller to fit all elements
        const topBar = this.add.graphics();
        topBar.fillStyle(0x0a0a18, 0.95);
        topBar.fillRect(0, 0, width, 65);
        // Pixel border at bottom
        topBar.fillStyle(0x00ffff, 0.8);
        topBar.fillRect(0, 63, width, 2);
        this.hudContainer.add(topBar);

        // Money display (left side, top row)
        this.moneyText = this.add.text(16, 8, '$0', {
            fontFamily: 'monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#00ff00'
        });
        this.hudContainer.add(this.moneyText);

        // Combo display (left side, below money)
        this.comboContainer = this.add.container(16, 38);
        this.comboText = this.add.text(0, 0, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0, 0);
        this.comboContainer.add(this.comboText);
        this.hudContainer.add(this.comboContainer);

        // Speed display (right side, top row)
        this.speedText = this.add.text(width - 16, 8, '0 MPH', {
            fontFamily: 'monospace',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#00ffff'
        }).setOrigin(1, 0);
        this.hudContainer.add(this.speedText);

        // Boost meter label (right side, below speed)
        const boostLabel = this.add.text(width - 16, 35, 'BOOST', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#888899'
        }).setOrigin(1, 0);
        this.hudContainer.add(boostLabel);

        // Boost meter (right side, below label)
        this.createBoostMeter(width - 86, 52);

        // Floating text pool for rewards
        this.floatingTexts = [];
    }

    createBoostMeter(x, y) {
        // Pixel-style background bar
        this.boostMeterBg = this.add.graphics();
        this.boostMeterBg.fillStyle(0x333344, 1);
        this.boostMeterBg.fillRect(x, y - 4, 70, 10);
        this.boostMeterBg.lineStyle(2, 0x555566, 1);
        this.boostMeterBg.strokeRect(x, y - 4, 70, 10);
        this.hudContainer.add(this.boostMeterBg);

        // Fill bar (no rounded edges for pixel effect)
        this.boostMeterFill = this.add.rectangle(x + 2, y + 1, 0, 6, 0xffcc00);
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
        const height = this.cameras.main.height;
        const scene = this;

        // Create speed control buttons (boost and brake)
        this.createSpeedControlButtons();

        // Create invisible interactive zones for lane changes (upper portion of screen)
        const laneControlHeight = height - 120; // Leave space for speed buttons

        this.leftTouchZone = this.add.rectangle(width / 4, laneControlHeight / 2, width / 2, laneControlHeight, 0xff0000, 0);
        this.leftTouchZone.setInteractive({ useHandCursor: true });
        this.leftTouchZone.setDepth(999);
        this.leftTouchZone.on('pointerdown', () => {
            this.handleTouchInput('left-phaser');
        });

        this.rightTouchZone = this.add.rectangle(width * 3 / 4, laneControlHeight / 2, width / 2, laneControlHeight, 0x0000ff, 0);
        this.rightTouchZone.setInteractive({ useHandCursor: true });
        this.rightTouchZone.setDepth(999);
        this.rightTouchZone.on('pointerdown', () => {
            this.handleTouchInput('right-phaser');
        });

        // Also add global Phaser input as backup (excluding button area)
        this.input.on('pointerdown', (pointer) => {
            // Ignore if touching the speed control button area
            if (pointer.y > height - 100) return;

            if (pointer.x < width / 2) {
                this.handleTouchInput('left-global');
            } else {
                this.handleTouchInput('right-global');
            }
        });

        // DOM-level touch handler (most reliable for mobile)
        const canvas = this.game.canvas;

        const handleDOMTouch = (e) => {
            // Get touch position
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const rect = canvas.getBoundingClientRect();

            // Calculate relative position
            const relativeY = (clientY - rect.top) / rect.height * height;

            // Ignore if touching the speed control button area (let Phaser handle it)
            if (relativeY > height - 100) return;

            e.preventDefault();
            e.stopPropagation();

            const canvasMidpoint = rect.left + rect.width / 2;

            if (clientX < canvasMidpoint) {
                scene.handleTouchInput('left-dom');
            } else {
                scene.handleTouchInput('right-dom');
            }
        };

        canvas.addEventListener('touchstart', handleDOMTouch, { passive: false });
        canvas.addEventListener('click', handleDOMTouch, { passive: false });
    }

    createSpeedControlButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonSize = 70;
        const buttonY = height - 55;
        const buttonMargin = 20;

        // Container for speed control buttons
        this.speedButtonsContainer = this.add.container(0, 0);
        this.speedButtonsContainer.setDepth(1001);

        // BRAKE button (left side) - Red/Orange
        const brakeX = buttonMargin + buttonSize / 2;

        // Brake button background
        const brakeBg = this.add.graphics();
        brakeBg.fillStyle(0x331111, 0.9);
        brakeBg.fillRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
        brakeBg.lineStyle(3, 0xff3333, 1);
        brakeBg.strokeRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
        // Inner glow
        brakeBg.lineStyle(1, 0xff6666, 0.5);
        brakeBg.strokeRect(brakeX - buttonSize / 2 + 3, buttonY - buttonSize / 2 + 3, buttonSize - 6, buttonSize - 6);
        this.speedButtonsContainer.add(brakeBg);

        // Brake icon (down arrow)
        const brakeIcon = this.add.text(brakeX, buttonY - 5, '▼', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ff4444'
        }).setOrigin(0.5);
        this.speedButtonsContainer.add(brakeIcon);

        // Brake label
        const brakeLabel = this.add.text(brakeX, buttonY + 22, 'SLOW', {
            fontFamily: 'monospace',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#ff6666'
        }).setOrigin(0.5);
        this.speedButtonsContainer.add(brakeLabel);

        // Brake touch zone
        this.brakeTouchZone = this.add.rectangle(brakeX, buttonY, buttonSize + 10, buttonSize + 10, 0xff0000, 0);
        this.brakeTouchZone.setInteractive({ useHandCursor: true });
        this.brakeTouchZone.setDepth(1002);

        this.brakeTouchZone.on('pointerdown', () => {
            if (this.isGameOver) return;
            this.player.brake();
            this.touchBraking = true;
            // Visual feedback
            brakeIcon.setColor('#ffff00');
            brakeBg.clear();
            brakeBg.fillStyle(0x442211, 0.95);
            brakeBg.fillRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            brakeBg.lineStyle(3, 0xff6600, 1);
            brakeBg.strokeRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
        });

        this.brakeTouchZone.on('pointerup', () => {
            if (this.touchBraking) {
                this.player.releaseBrake();
                this.touchBraking = false;
            }
            // Reset visual
            brakeIcon.setColor('#ff4444');
            brakeBg.clear();
            brakeBg.fillStyle(0x331111, 0.9);
            brakeBg.fillRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            brakeBg.lineStyle(3, 0xff3333, 1);
            brakeBg.strokeRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            brakeBg.lineStyle(1, 0xff6666, 0.5);
            brakeBg.strokeRect(brakeX - buttonSize / 2 + 3, buttonY - buttonSize / 2 + 3, buttonSize - 6, buttonSize - 6);
        });

        this.brakeTouchZone.on('pointerout', () => {
            if (this.touchBraking) {
                this.player.releaseBrake();
                this.touchBraking = false;
            }
            // Reset visual
            brakeIcon.setColor('#ff4444');
            brakeBg.clear();
            brakeBg.fillStyle(0x331111, 0.9);
            brakeBg.fillRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            brakeBg.lineStyle(3, 0xff3333, 1);
            brakeBg.strokeRect(brakeX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            brakeBg.lineStyle(1, 0xff6666, 0.5);
            brakeBg.strokeRect(brakeX - buttonSize / 2 + 3, buttonY - buttonSize / 2 + 3, buttonSize - 6, buttonSize - 6);
        });

        // BOOST button (right side) - Cyan/Blue
        const boostX = width - buttonMargin - buttonSize / 2;

        // Boost button background
        const boostBg = this.add.graphics();
        boostBg.fillStyle(0x112233, 0.9);
        boostBg.fillRect(boostX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
        boostBg.lineStyle(3, 0x00ffff, 1);
        boostBg.strokeRect(boostX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
        // Inner glow
        boostBg.lineStyle(1, 0x66ffff, 0.5);
        boostBg.strokeRect(boostX - buttonSize / 2 + 3, buttonY - buttonSize / 2 + 3, buttonSize - 6, buttonSize - 6);
        this.speedButtonsContainer.add(boostBg);

        // Boost icon (up arrow)
        const boostIcon = this.add.text(boostX, buttonY - 5, '▲', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#00ffff'
        }).setOrigin(0.5);
        this.speedButtonsContainer.add(boostIcon);

        // Boost label
        const boostLabel = this.add.text(boostX, buttonY + 22, 'BOOST', {
            fontFamily: 'monospace',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#66ffff'
        }).setOrigin(0.5);
        this.speedButtonsContainer.add(boostLabel);

        // Boost touch zone
        this.boostTouchZone = this.add.rectangle(boostX, buttonY, buttonSize + 10, buttonSize + 10, 0x0000ff, 0);
        this.boostTouchZone.setInteractive({ useHandCursor: true });
        this.boostTouchZone.setDepth(1002);

        // Store references for visual feedback
        this.boostButtonElements = { bg: boostBg, icon: boostIcon, x: boostX, y: buttonY, size: buttonSize };

        this.boostTouchZone.on('pointerdown', () => {
            if (this.isGameOver) return;
            const boosted = this.player.boost();
            if (boosted) {
                // Visual feedback - active boost
                boostIcon.setColor('#ffff00');
                boostBg.clear();
                boostBg.fillStyle(0x224433, 0.95);
                boostBg.fillRect(boostX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
                boostBg.lineStyle(3, 0x00ff88, 1);
                boostBg.strokeRect(boostX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            }
        });

        this.boostTouchZone.on('pointerup', () => {
            // Reset visual
            boostIcon.setColor('#00ffff');
            boostBg.clear();
            boostBg.fillStyle(0x112233, 0.9);
            boostBg.fillRect(boostX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            boostBg.lineStyle(3, 0x00ffff, 1);
            boostBg.strokeRect(boostX - buttonSize / 2, buttonY - buttonSize / 2, buttonSize, buttonSize);
            boostBg.lineStyle(1, 0x66ffff, 0.5);
            boostBg.strokeRect(boostX - buttonSize / 2 + 3, buttonY - buttonSize / 2 + 3, buttonSize - 6, buttonSize - 6);
        });

        // Track touch braking state
        this.touchBraking = false;
    }

    handleTouchInput(direction) {
        if (this.isGameOver) return;
        if (this.laneChangeCooldown > 0) return;

        if (direction.startsWith('left')) {
            this.player.moveLeft();
        } else {
            this.player.moveRight();
        }
        this.laneChangeCooldown = 100;
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
