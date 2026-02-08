/**
 * GarageScene - Enhanced vehicle selection and upgrade shop with premium UI
 */
class GarageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GarageScene' });
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.upgradeManager = new UpgradeManager();
        this.vehicleIds = Object.keys(VEHICLES);
        this.currentIndex = this.vehicleIds.indexOf(window.gameState.saveData.selectedVehicle);
        if (this.currentIndex === -1) this.currentIndex = 0;

        // Premium background
        this.createBackground(width, height);

        // Title section
        this.createTitle(width);

        // Money display
        this.createMoneyDisplay(width);

        // Vehicle display area
        this.createVehicleDisplay(width, height);

        // Upgrade panel
        this.createUpgradePanel(width, height);

        // Navigation
        this.createNavigation(width, height);

        // Back button
        this.createBackButton(width, height);

        // Initial update
        this.updateDisplay();

        // Keyboard controls
        this.input.keyboard.on('keydown-LEFT', () => this.prevVehicle());
        this.input.keyboard.on('keydown-RIGHT', () => this.nextVehicle());
        this.input.keyboard.on('keydown-ESC', () => this.goBack());
        this.input.keyboard.on('keydown-ENTER', () => this.selectVehicle());
    }

    createBackground(width, height) {
        // Grid pattern overlay
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x2a2a3e, 0.3);
        for (let x = 0; x < width; x += 40) {
            grid.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 40) {
            grid.lineBetween(0, y, width, y);
        }

        // Gradient overlay
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x0a0a12, 0x0a0a12, 0x1a102e, 0x1a102e, 0.9, 0.9, 0.8, 0.8);
        overlay.fillRect(0, 0, width, height);
    }

    createTitle(width) {
        this.add.text(width / 2, 40, 'GARAGE', {
            fontFamily: 'monospace',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ff00e5'
        }).setOrigin(0.5);

        this.add.text(width / 2, 70, 'Vehicles & Upgrades', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#7a7a8a'
        }).setOrigin(0.5);
    }

    createMoneyDisplay(width) {
        // Money panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.9);
        panel.fillRoundedRect(width - 140, 15, 125, 40, 8);
        panel.lineStyle(1, 0x00ff88, 0.6);
        panel.strokeRoundedRect(width - 140, 15, 125, 40, 8);

        this.moneyText = this.add.text(width - 78, 35, `$${window.gameState.saveData.money.toLocaleString()}`, {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#00ff88'
        }).setOrigin(0.5);
    }

    createVehicleDisplay(width, height) {
        const displayY = 200;

        // Vehicle container with glow effect
        this.vehicleContainer = this.add.container(width / 2, displayY);

        // Platform/pedestal glow
        const platformGlow = this.add.graphics();
        platformGlow.fillStyle(0xff00e5, 0.1);
        platformGlow.fillEllipse(0, 60, 180, 40);
        this.vehicleContainer.add(platformGlow);

        // Animated rings
        for (let i = 0; i < 3; i++) {
            const ring = this.add.graphics();
            ring.lineStyle(1, 0xff00e5, 0.3 - i * 0.1);
            ring.strokeEllipse(0, 60, 120 + i * 30, 25 + i * 8);
            this.vehicleContainer.add(ring);

            this.tweens.add({
                targets: ring,
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.05 },
                alpha: { from: 0.3 - i * 0.1, to: 0 },
                duration: 1500,
                delay: i * 400,
                repeat: -1
            });
        }

        // Vehicle sprite placeholder
        this.vehicleSprite = this.add.sprite(0, 0, 'compact_sedan');
        this.vehicleSprite.setScale(1.8);
        this.vehicleContainer.add(this.vehicleSprite);

        // Floating animation
        this.tweens.add({
            targets: this.vehicleSprite,
            y: -8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Vehicle name with background - create a clickable container
        const namePanelY = displayY + 90;
        this.namePanelContainer = this.add.container(width / 2, namePanelY);

        const namePanel = this.add.graphics();
        namePanel.fillStyle(0x1a1a2e, 0.9);
        namePanel.fillRoundedRect(-100, -15, 200, 60, 8);
        namePanel.lineStyle(2, 0x00f5ff, 0.8);
        namePanel.strokeRoundedRect(-100, -15, 200, 60, 8);
        this.namePanelContainer.add(namePanel);

        this.vehicleNameText = this.add.text(0, 0, 'Vehicle Name', {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.namePanelContainer.add(this.vehicleNameText);

        // Lock/Price indicator
        this.vehicleStatusText = this.add.text(0, 25, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0.5);
        this.namePanelContainer.add(this.vehicleStatusText);

        // Hit area for the entire name panel
        this.namePanelHitArea = this.add.rectangle(0, 15, 200, 60, 0x000000, 0);
        this.namePanelContainer.add(this.namePanelHitArea);
        this.namePanelHitArea.setInteractive({ useHandCursor: true });
    }

    createUpgradePanel(width, height) {
        const panelX = width / 2;
        const panelY = 400;
        const panelWidth = 320;
        const panelHeight = 220;

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.9);
        panel.fillRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 12);
        panel.lineStyle(1, 0x3d3d5c, 0.8);
        panel.strokeRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 12);

        // Panel title
        this.add.text(panelX, panelY + 20, 'UPGRADES', {
            fontFamily: 'monospace',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ff00e5'
        }).setOrigin(0.5);

        // Upgrade rows
        this.upgradeRows = {};
        const upgradeTypes = ['engine', 'transmission', 'handling', 'nitro'];
        const upgradeLabels = {
            engine: { label: 'ENGINE', icon: '🔧', color: 0xff6600 },
            transmission: { label: 'TRANS', icon: '⚙️', color: 0xffcc00 },
            handling: { label: 'HANDLING', icon: '🎯', color: 0x00f5ff },
            nitro: { label: 'NITRO', icon: '⚡', color: 0xff00e5 }
        };

        upgradeTypes.forEach((type, i) => {
            const rowY = panelY + 55 + i * 42;
            this.createUpgradeRow(panelX, rowY, type, upgradeLabels[type]);
        });
    }

    createUpgradeRow(x, y, type, config) {
        const row = this.add.container(x, y);

        // Label with icon
        const label = this.add.text(-130, 0, `${config.icon} ${config.label}`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#a0a0b0'
        }).setOrigin(0, 0.5);
        row.add(label);

        // Level pips
        const pips = [];
        for (let i = 0; i < 5; i++) {
            const pip = this.add.rectangle(-20 + i * 22, 0, 18, 12, 0x2a2a3e);
            pip.setStrokeStyle(1, 0x3d3d5c);
            row.add(pip);
            pips.push(pip);
        }

        // Upgrade button
        const btn = this.add.container(120, 0);

        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x2a2a3e, 1);
        btnBg.fillRoundedRect(-35, -14, 70, 28, 6);
        btnBg.lineStyle(1, config.color, 0.8);
        btnBg.strokeRoundedRect(-35, -14, 70, 28, 6);
        btn.add(btnBg);

        const btnText = this.add.text(0, 0, '$0', {
            fontFamily: 'monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#00ff88'
        }).setOrigin(0.5);
        btn.add(btnText);

        const hitArea = this.add.rectangle(0, 0, 70, 28, 0x000000, 0);
        btn.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(config.color, 0.3);
            btnBg.fillRoundedRect(-35, -14, 70, 28, 6);
            btnBg.lineStyle(2, config.color, 1);
            btnBg.strokeRoundedRect(-35, -14, 70, 28, 6);
        });

        hitArea.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x2a2a3e, 1);
            btnBg.fillRoundedRect(-35, -14, 70, 28, 6);
            btnBg.lineStyle(1, config.color, 0.8);
            btnBg.strokeRoundedRect(-35, -14, 70, 28, 6);
        });

        hitArea.on('pointerdown', () => this.purchaseUpgrade(type));

        row.add(btn);

        this.upgradeRows[type] = { pips, btnText, btn, config };
    }

    createNavigation(width, height) {
        const navY = 200;

        // Left arrow
        const leftArrow = this.createArrowButton(50, navY, '<', () => this.prevVehicle());

        // Right arrow
        const rightArrow = this.createArrowButton(width - 50, navY, '>', () => this.nextVehicle());

        // Vehicle indicators - moved up to avoid overlap with name panel
        this.indicators = [];
        const indicatorY = 365;
        this.vehicleIds.forEach((id, i) => {
            const dot = this.add.circle(
                width / 2 + (i - (this.vehicleIds.length - 1) / 2) * 20,
                indicatorY,
                5,
                0x3d3d5c
            );
            this.indicators.push(dot);
        });
    }

    createArrowButton(x, y, text, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillCircle(0, 0, 25);
        bg.lineStyle(2, 0x00f5ff, 0.8);
        bg.strokeCircle(0, 0, 25);
        container.add(bg);

        const arrow = this.add.text(0, 0, text, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#00f5ff'
        }).setOrigin(0.5);
        container.add(arrow);

        const hitArea = this.add.circle(0, 0, 25, 0x000000, 0);
        container.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            container.setScale(1.1);
        });

        hitArea.on('pointerout', () => {
            container.setScale(1);
        });

        hitArea.on('pointerdown', callback);

        return container;
    }

    createBackButton(width, height) {
        const btn = this.add.container(width / 2, height - 45);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRoundedRect(-80, -20, 160, 40, 10);
        bg.lineStyle(2, 0x5a5a6a, 0.8);
        bg.strokeRoundedRect(-80, -20, 160, 40, 10);
        btn.add(bg);

        const text = this.add.text(0, 0, '← BACK', {
            fontFamily: 'monospace',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        btn.add(text);

        const hitArea = this.add.rectangle(0, 0, 160, 40, 0x000000, 0);
        btn.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => btn.setScale(1.05));
        hitArea.on('pointerout', () => btn.setScale(1));
        hitArea.on('pointerdown', () => this.goBack());
    }

    updateDisplay() {
        const vehicleId = this.vehicleIds[this.currentIndex];
        const vehicle = VEHICLES[vehicleId];
        const saveData = window.gameState.saveData;
        const isOwned = saveData.vehicles[vehicleId]?.owned || false;

        // Update vehicle sprite
        if (this.textures.exists(vehicleId)) {
            this.vehicleSprite.setTexture(vehicleId);
        }

        // Update name
        this.vehicleNameText.setText(vehicle.name);

        // Update status/price
        if (isOwned) {
            if (saveData.selectedVehicle === vehicleId) {
                this.vehicleStatusText.setText('✓ SELECTED');
                this.vehicleStatusText.setColor('#00ff88');
            } else {
                this.vehicleStatusText.setText('Click to select');
                this.vehicleStatusText.setColor('#a0a0b0');
            }
        } else {
            this.vehicleStatusText.setText(`🔒 $${vehicle.unlockCost.toLocaleString()}`);
            this.vehicleStatusText.setColor('#ffcc00');
        }

        // Make vehicle sprite clickable for selection/purchase
        this.vehicleSprite.setInteractive({ useHandCursor: true });
        this.vehicleSprite.off('pointerdown');
        this.vehicleSprite.on('pointerdown', () => {
            if (isOwned) {
                this.selectVehicle();
            } else {
                this.purchaseVehicle();
            }
        });

        // Also make the name panel clickable
        this.namePanelHitArea.off('pointerdown');
        this.namePanelHitArea.on('pointerdown', () => {
            if (isOwned) {
                this.selectVehicle();
            } else {
                this.purchaseVehicle();
            }
        });

        // Update indicators
        this.indicators.forEach((dot, i) => {
            dot.fillColor = i === this.currentIndex ? 0x00f5ff : 0x3d3d5c;
        });

        // Update upgrade panel
        this.updateUpgrades(vehicleId, isOwned);

        // Update money display
        this.moneyText.setText(`$${saveData.money.toLocaleString()}`);
    }

    updateUpgrades(vehicleId, isOwned) {
        const saveData = window.gameState.saveData;
        const vehicleUpgrades = saveData.vehicles[vehicleId]?.upgrades || {};

        Object.keys(this.upgradeRows).forEach(type => {
            const row = this.upgradeRows[type];
            const level = vehicleUpgrades[type] || 0;

            // Update pips
            row.pips.forEach((pip, i) => {
                if (i < level) {
                    pip.fillColor = row.config.color;
                    pip.setStrokeStyle(1, row.config.color);
                } else {
                    pip.fillColor = 0x2a2a3e;
                    pip.setStrokeStyle(1, 0x3d3d5c);
                }
            });

            // Update button
            if (!isOwned) {
                row.btnText.setText('LOCKED');
                row.btnText.setColor('#5a5a5a');
            } else if (level >= 5) {
                row.btnText.setText('MAX');
                row.btnText.setColor('#ffcc00');
            } else {
                const cost = this.upgradeManager.getUpgradeCost(type, level);
                row.btnText.setText(`$${cost}`);
                row.btnText.setColor(saveData.money >= cost ? '#00ff88' : '#ff5555');
            }
        });
    }

    prevVehicle() {
        this.currentIndex = (this.currentIndex - 1 + this.vehicleIds.length) % this.vehicleIds.length;
        this.animateVehicleChange(-1);
    }

    nextVehicle() {
        this.currentIndex = (this.currentIndex + 1) % this.vehicleIds.length;
        this.animateVehicleChange(1);
    }

    animateVehicleChange(direction) {
        this.tweens.add({
            targets: this.vehicleSprite,
            x: direction * 50,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                this.vehicleSprite.x = -direction * 50;
                this.updateDisplay();
                this.tweens.add({
                    targets: this.vehicleSprite,
                    x: 0,
                    alpha: 1,
                    duration: 100
                });
            }
        });
    }

    selectVehicle() {
        const vehicleId = this.vehicleIds[this.currentIndex];
        const saveData = window.gameState.saveData;

        if (saveData.vehicles[vehicleId]?.owned) {
            saveData.selectedVehicle = vehicleId;
            this.saveGame();
            this.updateDisplay();

            // Selection confirmation effect
            this.cameras.main.flash(100, 0, 255, 136, false);
        }
    }

    purchaseVehicle() {
        const vehicleId = this.vehicleIds[this.currentIndex];
        const vehicle = VEHICLES[vehicleId];
        const saveData = window.gameState.saveData;

        if (saveData.money >= vehicle.unlockCost && !saveData.vehicles[vehicleId]?.owned) {
            saveData.money -= vehicle.unlockCost;
            if (!saveData.vehicles[vehicleId]) {
                saveData.vehicles[vehicleId] = { owned: true, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } };
            } else {
                saveData.vehicles[vehicleId].owned = true;
            }
            saveData.selectedVehicle = vehicleId;
            this.saveGame();
            this.updateDisplay();

            // Purchase celebration
            this.cameras.main.flash(200, 0, 255, 136, false);
        } else {
            // Not enough money - shake effect
            this.cameras.main.shake(100, 0.005);
        }
    }

    purchaseUpgrade(type) {
        const vehicleId = this.vehicleIds[this.currentIndex];
        const saveData = window.gameState.saveData;

        if (!saveData.vehicles[vehicleId]?.owned) return;

        if (!saveData.vehicles[vehicleId].upgrades) {
            saveData.vehicles[vehicleId].upgrades = { engine: 0, transmission: 0, handling: 0, nitro: 0 };
        }

        const currentLevel = saveData.vehicles[vehicleId].upgrades[type] || 0;
        if (currentLevel >= 5) return;

        const cost = this.upgradeManager.getUpgradeCost(type, currentLevel + 1);

        if (saveData.money >= cost) {
            saveData.money -= cost;
            saveData.vehicles[vehicleId].upgrades[type] = currentLevel + 1;
            this.saveGame();
            this.updateDisplay();

            // Upgrade effect
            this.cameras.main.flash(100, 255, 204, 0, false);
        } else {
            this.cameras.main.shake(100, 0.005);
        }
    }

    saveGame() {
        try {
            localStorage.setItem('trafficCutUp_save', JSON.stringify(window.gameState.saveData));
        } catch (e) {
            console.warn('Failed to save game:', e);
        }
    }

    goBack() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('MenuScene');
        });
    }
}
