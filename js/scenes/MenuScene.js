/**
 * MenuScene - Pixel Art Retro Arcade Style
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Pixel art background
        this.createPixelBackground(width, height);

        // Animated road
        this.createScrollingRoad(width, height);

        // Pixel title
        this.createPixelTitle(width, height);

        // Pixel menu buttons
        this.createPixelButtons(width, height);

        // Stats panel
        this.createStatsPanel(width, height);

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard.on('keydown-G', () => this.openGarage());
    }

    createPixelBackground(width, height) {
        // Dark gradient background
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a12, 1);
        bg.fillRect(0, 0, width, height);

        // Pixel grid overlay (subtle)
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x1a1a2e, 0.3);

        // Horizontal lines
        for (let y = 0; y < height; y += 16) {
            grid.lineBetween(0, y, width, y);
        }

        // Vertical lines
        for (let x = 0; x < width; x += 16) {
            grid.lineBetween(x, 0, x, height);
        }

        // Scanline effect (CRT style)
        const scanlines = this.add.graphics();
        scanlines.lineStyle(1, 0x000000, 0.1);
        for (let y = 0; y < height; y += 4) {
            scanlines.lineBetween(0, y, width, y);
        }
        scanlines.setDepth(100);

        // Side neon strips (pixel style)
        this.createPixelStrip(0, 0, 8, height, 0xff00ff);
        this.createPixelStrip(width - 8, 0, 8, height, 0x00ffff);
    }

    createPixelStrip(x, y, w, h, color) {
        const strip = this.add.graphics();
        strip.fillStyle(color, 0.6);

        // Create pixel blocks instead of smooth rectangle
        for (let py = 0; py < h; py += 8) {
            const alpha = 0.4 + Math.sin(py * 0.05) * 0.3;
            strip.fillStyle(color, alpha);
            strip.fillRect(x, py, w, 6);
        }

        // Pulse animation
        this.tweens.add({
            targets: strip,
            alpha: { from: 0.6, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    createScrollingRoad(width, height) {
        // Road background
        const roadWidth = 200;
        const roadX = (width - roadWidth) / 2;

        const road = this.add.graphics();
        road.fillStyle(0x2a2a3a, 1);
        road.fillRect(roadX, 0, roadWidth, height);

        // Road edges (pixel style)
        road.fillStyle(0xffcc00, 0.8);
        road.fillRect(roadX, 0, 4, height);
        road.fillRect(roadX + roadWidth - 4, 0, 4, height);

        // Animated lane markers
        this.laneMarkers = [];
        for (let i = 0; i < 12; i++) {
            const marker = this.add.rectangle(
                width / 2,
                i * 80 - 40,
                8,
                32,
                0xffcc00,
                0.9
            );
            this.laneMarkers.push(marker);
        }

        // Scroll animation
        this.tweens.add({
            targets: this.laneMarkers,
            y: '+=80',
            duration: 300,
            repeat: -1,
            onRepeat: () => {
                this.laneMarkers.forEach(marker => {
                    if (marker.y > height + 40) {
                        marker.y -= height + 120;
                    }
                });
            }
        });
    }

    createPixelTitle(width, height) {
        // Shadow layer
        const shadowText = this.add.text(width / 2 + 4, 84, 'TRAFFIC', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        // Main title - TRAFFIC
        const titleText = this.add.text(width / 2, 80, 'TRAFFIC', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#00ffff'
        }).setOrigin(0.5);

        // Subtitle shadow
        const subShadow = this.add.text(width / 2 + 3, 133, 'CUT-UP TYCOON', {
            fontFamily: 'monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        // Subtitle - CUT-UP TYCOON
        const subText = this.add.text(width / 2, 130, 'CUT-UP TYCOON', {
            fontFamily: 'monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ff00ff'
        }).setOrigin(0.5);

        // Flashing effect
        this.tweens.add({
            targets: [titleText, subText],
            alpha: { from: 1, to: 0.7 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Tagline
        this.add.text(width / 2, 170, 'WEAVE • EARN • UPGRADE', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#666688'
        }).setOrigin(0.5);
    }

    createPixelButtons(width, height) {
        const startY = height / 2 + 30;

        // START button
        this.createPixelButton(width / 2, startY, 'START', 0x00ff00, () => this.startGame(), true);

        // GARAGE button
        this.createPixelButton(width / 2, startY + 70, 'GARAGE', 0xff00ff, () => this.openGarage(), false);

        // SETTINGS button (smaller)
        this.createPixelButton(width / 2, startY + 130, 'SETTINGS', 0x666688, () => { }, false);
    }

    createPixelButton(x, y, text, color, callback, isPrimary) {
        const btnWidth = isPrimary ? 200 : 160;
        const btnHeight = isPrimary ? 48 : 40;

        const container = this.add.container(x, y);

        // Button border (pixel style - double border)
        const border = this.add.graphics();
        border.lineStyle(4, color, 1);
        border.strokeRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight);
        border.lineStyle(2, 0xffffff, 0.3);
        border.strokeRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth - 8, btnHeight - 8);
        container.add(border);

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth - 8, btnHeight - 8);
        container.add(bg);

        // Button text
        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'monospace',
            fontSize: isPrimary ? '24px' : '18px',
            fontStyle: 'bold',
            color: Phaser.Display.Color.IntegerToColor(color).rgba
        }).setOrigin(0.5);
        container.add(btnText);

        // Selection indicator (arrow)
        const arrow = this.add.text(-btnWidth / 2 - 20, 0, '>', {
            fontFamily: 'monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            color: Phaser.Display.Color.IntegerToColor(color).rgba
        }).setOrigin(0.5).setAlpha(0);
        container.add(arrow);

        // Hit area
        const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        container.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        // Hover effects
        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(color, 0.2);
            bg.fillRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth - 8, btnHeight - 8);
            arrow.setAlpha(1);

            // Arrow bounce animation
            this.tweens.add({
                targets: arrow,
                x: -btnWidth / 2 - 15,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x1a1a2e, 0.9);
            bg.fillRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth - 8, btnHeight - 8);
            arrow.setAlpha(0);
            this.tweens.killTweensOf(arrow);
            arrow.x = -btnWidth / 2 - 20;
        });

        hitArea.on('pointerdown', () => {
            // Flash effect
            bg.clear();
            bg.fillStyle(color, 0.5);
            bg.fillRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth - 8, btnHeight - 8);

            this.time.delayedCall(100, callback);
        });

        return container;
    }

    createStatsPanel(width, height) {
        const saveData = window.gameState.saveData;
        const panelY = height - 140;

        // Panel background (pixel border)
        const panel = this.add.graphics();
        panel.lineStyle(2, 0x00ffff, 0.6);
        panel.strokeRect(width / 2 - 120, panelY, 240, 90);
        panel.fillStyle(0x0a0a12, 0.8);
        panel.fillRect(width / 2 - 118, panelY + 2, 236, 86);

        // Money display
        this.add.text(width / 2, panelY + 22, `$ ${saveData.money.toLocaleString()}`, {
            fontFamily: 'monospace',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#00ff00'
        }).setOrigin(0.5);

        // High score
        this.add.text(width / 2, panelY + 48, `BEST: $${saveData.highScore.toLocaleString()}`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffcc00'
        }).setOrigin(0.5);

        // Current vehicle
        const vehicle = VEHICLES[saveData.selectedVehicle];
        this.add.text(width / 2, panelY + 70, `[${vehicle.name.toUpperCase()}]`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5);

        // Controls hint at bottom
        this.add.text(width / 2, height - 20, 'SPACE=PLAY  G=GARAGE', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#444466'
        }).setOrigin(0.5);
    }

    startGame() {
        window.gameState.currentRun = {
            money: 0,
            distance: 0,
            closePasses: 0,
            maxCombo: 0
        };

        // Screen flash effect
        this.cameras.main.flash(100, 0, 255, 255);
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('GameScene');
        });
    }

    openGarage() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
            this.scene.start('GarageScene');
        });
    }
}
