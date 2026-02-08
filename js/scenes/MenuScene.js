/**
 * MenuScene - Enhanced main menu with premium UI
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Premium background
        this.createBackground(width, height);

        // Title with glow animation
        this.createTitle(width, height);

        // Menu buttons with hover effects
        this.createMenuButtons(width, height);

        // Stats display panel
        this.createStatsDisplay(width, height);

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard.on('keydown-G', () => this.openGarage());
    }

    createBackground(width, height) {
        // Overlay gradient
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x0a0a12, 0x0a0a12, 0x1a0a2e, 0x1a0a2e, 0.9, 0.9, 0.7, 0.7);
        overlay.fillRect(0, 0, width, height);

        // Animated particles
        this.createParticles(width, height);

        // Animated road center line
        this.roadLines = [];
        for (let i = 0; i < 10; i++) {
            const line = this.add.rectangle(
                width / 2,
                i * 100 - 50,
                6,
                50,
                0xffcc00,
                0.6
            );
            this.roadLines.push(line);
        }

        this.tweens.add({
            targets: this.roadLines,
            y: '+=100',
            duration: 400,
            repeat: -1,
            onRepeat: () => {
                this.roadLines.forEach(line => {
                    if (line.y > height + 50) {
                        line.y -= height + 100;
                    }
                });
            }
        });

        // Side glow strips
        const leftGlow = this.add.graphics();
        leftGlow.fillStyle(0xff00e5, 0.3);
        leftGlow.fillRect(0, 0, 4, height);

        const rightGlow = this.add.graphics();
        rightGlow.fillStyle(0x00f5ff, 0.3);
        rightGlow.fillRect(width - 4, 0, 4, height);

        // Pulse animation
        this.tweens.add({
            targets: [leftGlow, rightGlow],
            alpha: { from: 0.3, to: 0.7 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }

    createParticles(width, height) {
        // Floating particles for depth
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 1 + Math.random() * 2;
            const particle = this.add.circle(x, y, size, 0x00f5ff, 0.3);

            this.tweens.add({
                targets: particle,
                y: y - 100 - Math.random() * 100,
                alpha: 0,
                duration: 3000 + Math.random() * 2000,
                repeat: -1,
                onRepeat: () => {
                    particle.x = Math.random() * width;
                    particle.y = height + 20;
                    particle.alpha = 0.3;
                }
            });
        }
    }

    createTitle(width, height) {
        // Main title with shadow
        const titleShadow = this.add.text(width / 2 + 3, 103, 'TRAFFIC', {
            fontFamily: 'Orbitron',
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5).setAlpha(0.3);

        const title = this.add.text(width / 2, 100, 'TRAFFIC', {
            fontFamily: 'Orbitron',
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#00f5ff'
        }).setOrigin(0.5);

        const subtitleShadow = this.add.text(width / 2 + 2, 157, 'CUT-UP TYCOON', {
            fontFamily: 'Orbitron',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5).setAlpha(0.3);

        const subtitle = this.add.text(width / 2, 155, 'CUT-UP TYCOON', {
            fontFamily: 'Orbitron',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ff00e5'
        }).setOrigin(0.5);

        // Glow pulse animation
        this.tweens.add({
            targets: [title, subtitle],
            alpha: { from: 0.85, to: 1 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Tagline
        this.add.text(width / 2, 200, 'Weave through traffic. Stack your cash.', {
            fontFamily: 'Rajdhani',
            fontSize: '16px',
            color: '#7a7a8a'
        }).setOrigin(0.5);
    }

    createMenuButtons(width, height) {
        const buttonY = height / 2 + 40;

        // Start Run button (primary action)
        this.createPremiumButton(width / 2, buttonY, 'START RUN', 0x00f5ff, 0x006677, () => this.startGame(), true);

        // Garage button
        this.createPremiumButton(width / 2, buttonY + 85, 'GARAGE', 0xff00e5, 0x660066, () => this.openGarage(), false);
    }

    createPremiumButton(x, y, text, color, darkColor, callback, isPrimary) {
        const button = this.add.container(x, y);

        // Button dimensions
        const btnWidth = isPrimary ? 260 : 220;
        const btnHeight = isPrimary ? 60 : 50;

        // Outer glow
        const glow = this.add.graphics();
        glow.fillStyle(color, 0.2);
        glow.fillRoundedRect(-btnWidth / 2 - 4, -btnHeight / 2 - 4, btnWidth + 8, btnHeight + 8, 16);
        button.add(glow);

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.95);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
        bg.lineStyle(3, color, 1);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
        button.add(bg);

        // Inner accent line
        const accent = this.add.graphics();
        accent.fillStyle(color, 0.3);
        accent.fillRoundedRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth - 8, 4, 2);
        button.add(accent);

        // Play icon for primary button
        if (isPrimary) {
            const icon = this.add.text(-btnWidth / 2 + 30, 0, '▶', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: Phaser.Display.Color.IntegerToColor(color).rgba
            }).setOrigin(0.5);
            button.add(icon);
        }

        // Button text
        const btnText = this.add.text(isPrimary ? 15 : 0, 0, text, {
            fontFamily: 'Orbitron',
            fontSize: isPrimary ? '24px' : '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        button.add(btnText);

        // Hit area
        const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        button.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        // Hover effects
        hitArea.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
            glow.clear();
            glow.fillStyle(color, 0.4);
            glow.fillRoundedRect(-btnWidth / 2 - 6, -btnHeight / 2 - 6, btnWidth + 12, btnHeight + 12, 18);
        });

        hitArea.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
            glow.clear();
            glow.fillStyle(color, 0.2);
            glow.fillRoundedRect(-btnWidth / 2 - 4, -btnHeight / 2 - 4, btnWidth + 8, btnHeight + 8, 16);
        });

        hitArea.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });

        return button;
    }

    createStatsDisplay(width, height) {
        const saveData = window.gameState.saveData;

        // Stats panel
        const panelY = height - 160;
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.85);
        panel.fillRoundedRect(width / 2 - 140, panelY, 280, 100, 12);
        panel.lineStyle(1, 0x3d3d5c, 0.8);
        panel.strokeRoundedRect(width / 2 - 140, panelY, 280, 100, 12);

        // Money display with icon
        this.add.text(width / 2, panelY + 25, `💰  $${saveData.money.toLocaleString()}`, {
            fontFamily: 'Orbitron',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#00ff88'
        }).setOrigin(0.5);

        // High score
        this.add.text(width / 2, panelY + 55, `🏆 Best Run: $${saveData.highScore.toLocaleString()}`, {
            fontFamily: 'Rajdhani',
            fontSize: '16px',
            color: '#ffcc00'
        }).setOrigin(0.5);

        // Current vehicle with icon
        const vehicle = VEHICLES[saveData.selectedVehicle];
        this.add.text(width / 2, panelY + 80, `🚗 ${vehicle.name}`, {
            fontFamily: 'Rajdhani',
            fontSize: '14px',
            color: '#a0a0b0'
        }).setOrigin(0.5);

        // Controls hint
        this.add.text(width / 2, height - 30, 'SPACE to play  •  G for garage', {
            fontFamily: 'Rajdhani',
            fontSize: '12px',
            color: '#4a4a5a'
        }).setOrigin(0.5);
    }

    startGame() {
        window.gameState.currentRun = {
            money: 0,
            distance: 0,
            closePasses: 0,
            maxCombo: 0
        };

        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
            this.scene.start('GameScene');
        });
    }

    openGarage() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('GarageScene');
        });
    }
}
