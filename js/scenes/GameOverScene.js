/**
 * GameOverScene - Enhanced results screen with premium UI
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const runData = window.gameState.currentRun;
        const saveData = window.gameState.saveData;

        // Check for new high score
        const isNewHighScore = runData.money > saveData.highScore;
        if (isNewHighScore) {
            saveData.highScore = runData.money;
        }

        // Create premium background
        this.createBackground(width, height);

        // Title with animation
        this.createTitle(width, height, isNewHighScore);

        // Stats panel
        this.createStatsPanel(width, height, runData, saveData, isNewHighScore);

        // Action buttons
        this.createButtons(width, height);

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => this.playAgain());
        this.input.keyboard.on('keydown-G', () => this.openGarage());
        this.input.keyboard.on('keydown-M', () => this.goToMenu());
    }

    createBackground(width, height) {
        // Dark overlay gradient
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x0a0512, 0x0a0512, 0x1a0a2e, 0x1a0a2e, 0.95, 0.95, 0.85, 0.85);
        overlay.fillRect(0, 0, width, height);

        // Subtle particle effects
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const particle = this.add.circle(x, y, 1 + Math.random() * 2, 0xff00e5, 0.2);

            this.tweens.add({
                targets: particle,
                y: y - 80,
                alpha: 0,
                duration: 2500 + Math.random() * 1500,
                repeat: -1,
                onRepeat: () => {
                    particle.x = Math.random() * width;
                    particle.y = height + 10;
                    particle.alpha = 0.2;
                }
            });
        }
    }

    createTitle(width, height, isNewHighScore) {
        // "RUN COMPLETE" title with glow
        const titleShadow = this.add.text(width / 2 + 3, 83, 'RUN COMPLETE', {
            fontFamily: 'Orbitron',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5).setAlpha(0.4);

        const title = this.add.text(width / 2, 80, 'RUN COMPLETE', {
            fontFamily: 'Orbitron',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ff00e5'
        }).setOrigin(0.5);

        // Pulse animation
        this.tweens.add({
            targets: title,
            alpha: { from: 0.8, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // High score celebration
        if (isNewHighScore) {
            const highScoreText = this.add.text(width / 2, 125, '🏆 NEW HIGH SCORE! 🏆', {
                fontFamily: 'Orbitron',
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffcc00'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: highScoreText,
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.1 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });

            // Celebration particles
            this.createCelebrationParticles(width, height);
        }
    }

    createCelebrationParticles(width, height) {
        const colors = [0xffcc00, 0xff00e5, 0x00f5ff, 0x00ff88];

        for (let i = 0; i < 30; i++) {
            this.time.delayedCall(i * 50, () => {
                const x = width / 2 + (Math.random() - 0.5) * 200;
                const y = 130;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = 3 + Math.random() * 4;

                const particle = this.add.circle(x, y, size, color, 0.8);

                this.tweens.add({
                    targets: particle,
                    x: x + (Math.random() - 0.5) * 150,
                    y: y + Math.random() * 150,
                    alpha: 0,
                    scale: 0,
                    duration: 1000 + Math.random() * 500,
                    ease: 'Cubic.easeOut',
                    onComplete: () => particle.destroy()
                });
            });
        }
    }

    createStatsPanel(width, height, runData, saveData, isNewHighScore) {
        const panelX = width / 2;
        const panelY = isNewHighScore ? 280 : 240;
        const panelWidth = 300;
        const panelHeight = 180;

        // Panel background with glassmorphism effect
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.9);
        panel.fillRoundedRect(panelX - panelWidth / 2, panelY - 20, panelWidth, panelHeight, 16);
        panel.lineStyle(2, 0xff00e5, 0.6);
        panel.strokeRoundedRect(panelX - panelWidth / 2, panelY - 20, panelWidth, panelHeight, 16);

        // Inner glow line
        const innerGlow = this.add.graphics();
        innerGlow.fillStyle(0xff00e5, 0.2);
        innerGlow.fillRoundedRect(panelX - panelWidth / 2 + 4, panelY - 16, panelWidth - 8, 4, 2);

        // Stats rows
        const statsY = panelY + 10;
        const rowHeight = 35;

        // Money earned
        this.createStatRow(panelX, statsY, '💰 Money Earned', `$${runData.money.toLocaleString()}`, '#00ff88');

        // Close passes
        this.createStatRow(panelX, statsY + rowHeight, '🚗 Close Passes', runData.closePasses.toString(), '#00f5ff');

        // Best combo
        this.createStatRow(panelX, statsY + rowHeight * 2, '⚡ Best Combo', `x${runData.maxCombo}`, '#ffcc00');

        // Divider line
        const dividerY = statsY + rowHeight * 3 + 10;
        const divider = this.add.graphics();
        divider.lineStyle(1, 0x3d3d5c, 0.6);
        divider.lineBetween(panelX - 100, dividerY, panelX + 100, dividerY);

        // Total bank display (prominent)
        const totalY = dividerY + 30;
        this.add.text(panelX, totalY, 'TOTAL BANK', {
            fontFamily: 'Rajdhani',
            fontSize: '14px',
            color: '#7a7a8a'
        }).setOrigin(0.5);

        const totalMoney = this.add.text(panelX, totalY + 30, `$${saveData.money.toLocaleString()}`, {
            fontFamily: 'Orbitron',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#00ff88'
        }).setOrigin(0.5);

        // Money count-up animation
        this.tweens.addCounter({
            from: saveData.money - runData.money,
            to: saveData.money,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                totalMoney.setText(`$${Math.floor(tween.getValue()).toLocaleString()}`);
            }
        });
    }

    createStatRow(x, y, label, value, valueColor) {
        this.add.text(x - 100, y, label, {
            fontFamily: 'Rajdhani',
            fontSize: '16px',
            color: '#a0a0b0'
        }).setOrigin(0, 0.5);

        this.add.text(x + 100, y, value, {
            fontFamily: 'Orbitron',
            fontSize: '20px',
            fontStyle: 'bold',
            color: valueColor
        }).setOrigin(1, 0.5);
    }

    createButtons(width, height) {
        const buttonY = height - 180;

        // Play Again (primary)
        this.createButton(width / 2, buttonY, 'PLAY AGAIN', 0x00f5ff, () => this.playAgain(), true);

        // Garage
        this.createButton(width / 2, buttonY + 60, 'GARAGE', 0xff00e5, () => this.openGarage(), false);

        // Menu
        this.createButton(width / 2, buttonY + 115, 'MENU', 0x5a5a6a, () => this.goToMenu(), false);

        // Control hints
        this.add.text(width / 2, height - 25, 'SPACE Retry • G Garage • M Menu', {
            fontFamily: 'Rajdhani',
            fontSize: '11px',
            color: '#4a4a5a'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, color, callback, isPrimary) {
        const btnWidth = isPrimary ? 220 : 180;
        const btnHeight = isPrimary ? 50 : 40;

        const container = this.add.container(x, y);

        // Glow
        const glow = this.add.graphics();
        glow.fillStyle(color, 0.15);
        glow.fillRoundedRect(-btnWidth / 2 - 3, -btnHeight / 2 - 3, btnWidth + 6, btnHeight + 6, 14);
        container.add(glow);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.95);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
        bg.lineStyle(2, color, 1);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
        container.add(bg);

        // Text
        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Orbitron',
            fontSize: isPrimary ? '20px' : '16px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(btnText);

        // Hit area
        const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        container.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 80 });
            glow.clear();
            glow.fillStyle(color, 0.35);
            glow.fillRoundedRect(-btnWidth / 2 - 5, -btnHeight / 2 - 5, btnWidth + 10, btnHeight + 10, 16);
        });

        hitArea.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
            glow.clear();
            glow.fillStyle(color, 0.15);
            glow.fillRoundedRect(-btnWidth / 2 - 3, -btnHeight / 2 - 3, btnWidth + 6, btnHeight + 6, 14);
        });

        hitArea.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });

        return container;
    }

    playAgain() {
        window.gameState.currentRun = {
            money: 0,
            distance: 0,
            closePasses: 0,
            maxCombo: 0
        };

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('GameScene');
        });
    }

    openGarage() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('GarageScene');
        });
    }

    goToMenu() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('MenuScene');
        });
    }
}
