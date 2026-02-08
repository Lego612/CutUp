/**
 * BootScene - Handles asset loading and initialization
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Animated loading background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a12, 0x0a0a12, 0x1a0a2e, 0x1a0a2e, 1);
        bg.fillRect(0, 0, width, height);

        // Loading text with glow effect
        const loadingText = this.add.text(width / 2, height / 2 - 80, 'TRAFFIC CUT-UP', {
            fontFamily: 'Orbitron',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#00f5ff'
        }).setOrigin(0.5);

        const loadingSubtext = this.add.text(width / 2, height / 2 - 40, 'TYCOON', {
            fontFamily: 'Orbitron',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ff00e5'
        }).setOrigin(0.5);

        const statusText = this.add.text(width / 2, height / 2 + 20, 'LOADING...', {
            fontFamily: 'Rajdhani',
            fontSize: '20px',
            color: '#a0a0b0'
        }).setOrigin(0.5);

        // Progress bar background with glow
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x1a1a2e, 1);
        progressBg.fillRoundedRect(width / 2 - 150, height / 2 + 60, 300, 16, 8);
        progressBg.lineStyle(2, 0x3d3d5c, 1);
        progressBg.strokeRoundedRect(width / 2 - 150, height / 2 + 60, 300, 16, 8);

        // Progress bar fill
        const progressBar = this.add.graphics();

        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00f5ff, 1);
            progressBar.fillRoundedRect(width / 2 - 148, height / 2 + 62, 296 * value, 12, 6);
        });

        // Load assets
        this.load.on('complete', () => {
            statusText.setText('READY!');
            statusText.setColor('#00ff88');
        });

        // No external assets needed - all graphics are procedurally generated
    }

    create() {
        // Generate player car textures procedurally
        this.generatePlayerCarTextures();

        // Generate traffic car textures
        this.generateTrafficTextures();

        // Load save data
        this.loadSaveData();

        // Transition to menu after a short delay
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }

    generateTrafficTextures() {
        const graphics = this.add.graphics();

        // Generate traffic car textures
        TRAFFIC_TYPES.forEach(traffic => {
            this.createCarTexture(graphics, `traffic_${traffic.type}`, traffic.color, traffic.width, traffic.height);
        });

        graphics.destroy();
    }

    createCarTexture(graphics, key, color, width, height) {
        graphics.clear();

        // Car body with gradient effect
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(2, 2, width - 4, height - 4, 4);

        // Darker shade for depth
        const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(30).color;
        graphics.fillStyle(darkerColor, 1);
        graphics.fillRect(4, height * 0.3, width - 8, 4);

        // Windshield
        graphics.fillStyle(0x2c3e50, 0.8);
        graphics.fillRoundedRect(5, 6, width - 10, height * 0.2, 2);

        // Rear window
        graphics.fillStyle(0x2c3e50, 0.6);
        graphics.fillRoundedRect(5, height - 6 - height * 0.12, width - 10, height * 0.12, 2);

        // Taillights
        graphics.fillStyle(0xff3333, 1);
        graphics.fillRect(3, height - 5, 5, 3);
        graphics.fillRect(width - 8, height - 5, 5, 3);

        graphics.generateTexture(key, width, height);
    }

    generatePlayerCarTextures() {
        const graphics = this.add.graphics();

        // Generate textures for each vehicle type
        Object.keys(VEHICLES).forEach(vehicleId => {
            const vehicle = VEHICLES[vehicleId];
            this.createPlayerCarTexture(graphics, vehicleId, vehicle.color, 40, 70);
        });

        graphics.destroy();
    }

    createPlayerCarTexture(graphics, key, color, width, height) {
        graphics.clear();

        // Shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(width / 2 + 2, height / 2 + 3, width - 4, height - 4);

        // Car body
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(2, 2, width - 4, height - 4, 6);

        // Body highlight
        const lighterColor = Phaser.Display.Color.ValueToColor(color).lighten(20).color;
        graphics.fillStyle(lighterColor, 0.5);
        graphics.fillRoundedRect(4, 4, width - 12, height * 0.4, 4);

        // Darker stripe for depth
        const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(30).color;
        graphics.fillStyle(darkerColor, 1);
        graphics.fillRect(4, height * 0.45, width - 8, 3);

        // Windshield (front)
        graphics.fillStyle(0x1a2a3a, 0.9);
        graphics.fillRoundedRect(6, 8, width - 12, height * 0.22, 3);

        // Windshield reflection
        graphics.fillStyle(0x4a9eff, 0.3);
        graphics.fillRoundedRect(8, 10, width - 16, height * 0.08, 2);

        // Rear window
        graphics.fillStyle(0x1a2a3a, 0.8);
        graphics.fillRoundedRect(6, height - 10 - height * 0.15, width - 12, height * 0.15, 3);

        // Headlights
        graphics.fillStyle(0xffffee, 1);
        graphics.fillRect(5, 3, 6, 3);
        graphics.fillRect(width - 11, 3, 6, 3);

        // Taillights
        graphics.fillStyle(0xff3333, 1);
        graphics.fillRect(4, height - 5, 7, 3);
        graphics.fillRect(width - 11, height - 5, 7, 3);

        // Side mirrors
        graphics.fillStyle(darkerColor, 1);
        graphics.fillRect(0, height * 0.25, 3, 6);
        graphics.fillRect(width - 3, height * 0.25, 3, 6);

        graphics.generateTexture(key, width, height);
    }

    loadSaveData() {
        try {
            const saved = localStorage.getItem('trafficCutUp_save');
            if (saved) {
                window.gameState.saveData = JSON.parse(saved);
                // Merge with defaults for any missing fields
                window.gameState.saveData = { ...DEFAULT_SAVE, ...window.gameState.saveData };
            } else {
                window.gameState.saveData = { ...DEFAULT_SAVE };
            }
        } catch (e) {
            console.warn('Failed to load save data:', e);
            window.gameState.saveData = { ...DEFAULT_SAVE };
        }
    }
}
