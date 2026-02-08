/**
 * GameOverScene - Pixel Art Results Screen
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const runData = window.gameState.currentRun;
        const saveData = window.gameState.saveData;

        // Check for new high score
        const isNewHighScore = runData.money > saveData.highScore;
        if (isNewHighScore) {
            saveData.highScore = runData.money;
        }

        // Pixel background
        this.createPixelBackground(width, height);

        // Title
        this.createPixelTitle(width, height, isNewHighScore);

        // Stats panel
        this.createPixelStats(width, height, runData, saveData, isNewHighScore);

        // Buttons
        this.createPixelButtons(width, height);

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => this.playAgain());
        this.input.keyboard.on('keydown-G', () => this.openGarage());
        this.input.keyboard.on('keydown-M', () => this.goToMenu());
    }

    createPixelBackground(width, height) {
        // Dark background
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a12, 1);
        bg.fillRect(0, 0, width, height);

        // Scanlines
        const scanlines = this.add.graphics();
        scanlines.lineStyle(1, 0x000000, 0.15);
        for (let y = 0; y < height; y += 4) {
            scanlines.lineBetween(0, y, width, y);
        }
        scanlines.setDepth(100);

        // Pixel grid effect (subtle)
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x1a1a2e, 0.2);
        for (let y = 0; y < height; y += 32) {
            grid.lineBetween(0, y, width, y);
        }
        for (let x = 0; x < width; x += 32) {
            grid.lineBetween(x, 0, x, height);
        }
    }

    createPixelTitle(width, height, isNewHighScore) {
        // Shadow
        this.add.text(width / 2 + 3, 68, 'RUN COMPLETE', {
            fontFamily: 'monospace',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        // Main title
        const title = this.add.text(width / 2, 65, 'RUN COMPLETE', {
            fontFamily: 'monospace',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ff00ff'
        }).setOrigin(0.5);

        // Flashing
        this.tweens.add({
            targets: title,
            alpha: { from: 1, to: 0.6 },
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        // High score celebration
        if (isNewHighScore) {
            const hsText = this.add.text(width / 2, 105, '*** NEW HIGH SCORE ***', {
                fontFamily: 'monospace',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#ffcc00'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: hsText,
                alpha: { from: 1, to: 0.3 },
                duration: 300,
                yoyo: true,
                repeat: -1
            });

            // Pixel confetti
            this.createPixelConfetti(width, height);
        }
    }

    createPixelConfetti(width, height) {
        const colors = [0xffcc00, 0xff00ff, 0x00ffff, 0x00ff00];

        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(i * 30, () => {
                const x = width / 2 + (Math.random() - 0.5) * 200;
                const y = 100;
                const color = colors[Math.floor(Math.random() * colors.length)];

                // Pixel squares instead of circles
                const particle = this.add.rectangle(x, y, 4, 4, color, 0.9);

                this.tweens.add({
                    targets: particle,
                    x: x + (Math.random() - 0.5) * 150,
                    y: y + 100 + Math.random() * 80,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => particle.destroy()
                });
            });
        }
    }

    createPixelStats(width, height, runData, saveData, isNewHighScore) {
        const panelY = isNewHighScore ? 160 : 140;
        const panelWidth = 280;
        const panelHeight = 200;

        // Panel border (pixel style)
        const panel = this.add.graphics();
        panel.lineStyle(3, 0x00ffff, 0.8);
        panel.strokeRect(width / 2 - panelWidth / 2, panelY, panelWidth, panelHeight);
        panel.fillStyle(0x0a0a12, 0.9);
        panel.fillRect(width / 2 - panelWidth / 2 + 3, panelY + 3, panelWidth - 6, panelHeight - 6);

        // Inner border
        panel.lineStyle(1, 0x00ffff, 0.3);
        panel.strokeRect(width / 2 - panelWidth / 2 + 6, panelY + 6, panelWidth - 12, panelHeight - 12);

        // Stats
        const statsX = width / 2;
        let statY = panelY + 35;
        const rowH = 38;

        // Money earned
        this.createPixelStatRow(statsX, statY, 'MONEY', `$${runData.money.toLocaleString()}`, '#00ff00');
        statY += rowH;

        // Close passes
        this.createPixelStatRow(statsX, statY, 'PASSES', runData.closePasses.toString(), '#00ffff');
        statY += rowH;

        // Best combo
        this.createPixelStatRow(statsX, statY, 'COMBO', `x${runData.maxCombo}`, '#ffcc00');
        statY += rowH + 10;

        // Divider
        const divider = this.add.graphics();
        divider.lineStyle(2, 0x333344, 1);
        divider.lineBetween(statsX - 100, statY, statsX + 100, statY);

        // Total bank
        statY += 20;
        this.add.text(statsX, statY, 'TOTAL BANK', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#666688'
        }).setOrigin(0.5);

        const totalText = this.add.text(statsX, statY + 28, `$${saveData.money.toLocaleString()}`, {
            fontFamily: 'monospace',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#00ff00'
        }).setOrigin(0.5);

        // Count-up animation
        this.tweens.addCounter({
            from: saveData.money - runData.money,
            to: saveData.money,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                totalText.setText(`$${Math.floor(tween.getValue()).toLocaleString()}`);
            }
        });
    }

    createPixelStatRow(x, y, label, value, color) {
        this.add.text(x - 90, y, label, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#888899'
        }).setOrigin(0, 0.5);

        this.add.text(x + 90, y, value, {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: color
        }).setOrigin(1, 0.5);
    }

    createPixelButtons(width, height) {
        const startY = height - 190;

        // Play Again
        this.createPixelButton(width / 2, startY, 'PLAY AGAIN', 0x00ff00, () => this.playAgain(), true);

        // Garage
        this.createPixelButton(width / 2, startY + 55, 'GARAGE', 0xff00ff, () => this.openGarage(), false);

        // Menu
        this.createPixelButton(width / 2, startY + 105, 'MENU', 0x666688, () => this.goToMenu(), false);

        // Hints
        this.add.text(width / 2, height - 25, 'SPACE=RETRY  G=GARAGE  M=MENU', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#444466'
        }).setOrigin(0.5);
    }

    createPixelButton(x, y, text, color, callback, isPrimary) {
        const btnWidth = isPrimary ? 180 : 140;
        const btnHeight = isPrimary ? 42 : 34;

        const container = this.add.container(x, y);

        // Border
        const border = this.add.graphics();
        border.lineStyle(3, color, 1);
        border.strokeRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight);
        border.lineStyle(1, 0xffffff, 0.2);
        border.strokeRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, btnHeight - 6);
        container.add(border);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, btnHeight - 6);
        container.add(bg);

        // Text
        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'monospace',
            fontSize: isPrimary ? '18px' : '14px',
            fontStyle: 'bold',
            color: Phaser.Display.Color.IntegerToColor(color).rgba
        }).setOrigin(0.5);
        container.add(btnText);

        // Selection arrow
        const arrow = this.add.text(-btnWidth / 2 - 16, 0, '>', {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: Phaser.Display.Color.IntegerToColor(color).rgba
        }).setOrigin(0.5).setAlpha(0);
        container.add(arrow);

        // Hit area
        const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        container.add(hitArea);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(color, 0.2);
            bg.fillRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, btnHeight - 6);
            arrow.setAlpha(1);
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x1a1a2e, 0.9);
            bg.fillRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, btnHeight - 6);
            arrow.setAlpha(0);
        });

        hitArea.on('pointerdown', () => {
            this.cameras.main.flash(50, 255, 255, 255);
            this.time.delayedCall(100, callback);
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

        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
            this.scene.start('GameScene');
        });
    }

    openGarage() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
            this.scene.start('GarageScene');
        });
    }

    goToMenu() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
            this.scene.start('MenuScene');
        });
    }
}
