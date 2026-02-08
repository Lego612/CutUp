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

        // Shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(width / 2 + 1, height / 2 + 2, width - 2, height - 2);

        // Car body base (darker outline)
        const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(40).color;
        graphics.fillStyle(darkerColor, 1);
        graphics.fillRoundedRect(2, 2, width - 4, height - 4, 5);

        // Car body main
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(3, 3, width - 6, height - 6, 4);

        // Highlight
        const lighterColor = Phaser.Display.Color.ValueToColor(color).lighten(25).color;
        graphics.fillStyle(lighterColor, 0.4);
        graphics.fillRoundedRect(5, 5, width - 12, height * 0.3, 3);

        // Body line
        graphics.fillStyle(darkerColor, 0.8);
        graphics.fillRect(5, height * 0.35, width - 10, 2);

        // Windshield
        graphics.fillStyle(0x1a2530, 0.9);
        graphics.fillRoundedRect(5, 7, width - 10, height * 0.18, 3);

        // Windshield reflection
        graphics.fillStyle(0x4a8eff, 0.25);
        graphics.fillRoundedRect(7, 9, 5, height * 0.10, 1);

        // Rear window
        graphics.fillStyle(0x1a2530, 0.8);
        graphics.fillRoundedRect(5, height - 7 - height * 0.12, width - 10, height * 0.12, 2);

        // Headlights
        graphics.fillStyle(0xffffcc, 0.8);
        graphics.fillRect(4, 3, 5, 3);
        graphics.fillRect(width - 9, 3, 5, 3);

        // Taillights
        graphics.fillStyle(0xff2222, 1);
        graphics.fillRect(4, height - 6, 6, 4);
        graphics.fillRect(width - 10, height - 6, 6, 4);

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

        // Neon underglow (outer glow)
        const glowColor = Phaser.Display.Color.ValueToColor(color).lighten(30).color;
        graphics.fillStyle(glowColor, 0.15);
        graphics.fillEllipse(width / 2, height / 2 + 5, width + 12, height + 8);
        graphics.fillStyle(glowColor, 0.25);
        graphics.fillEllipse(width / 2, height / 2 + 3, width + 6, height + 4);

        // Main shadow
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillEllipse(width / 2 + 2, height / 2 + 4, width - 2, height - 2);

        // Car body base
        const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(35).color;
        graphics.fillStyle(darkerColor, 1);
        graphics.fillRoundedRect(3, 3, width - 6, height - 6, 8);

        // Car body main
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(4, 4, width - 8, height - 8, 7);

        // Metallic highlight (top reflection)
        const lighterColor = Phaser.Display.Color.ValueToColor(color).lighten(40).color;
        graphics.fillStyle(lighterColor, 0.6);
        graphics.fillRoundedRect(6, 6, width - 14, height * 0.35, 5);

        // Secondary highlight
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillRoundedRect(8, 8, width - 18, height * 0.15, 3);

        // Body line accent
        graphics.fillStyle(darkerColor, 1);
        graphics.fillRect(6, height * 0.42, width - 12, 2);
        graphics.fillStyle(lighterColor, 0.3);
        graphics.fillRect(6, height * 0.44, width - 12, 1);

        // Windshield (front) with gradient effect
        graphics.fillStyle(0x0a1520, 0.95);
        graphics.fillRoundedRect(8, 10, width - 16, height * 0.20, 4);

        // Windshield reflection streaks
        graphics.fillStyle(0x4a9eff, 0.4);
        graphics.fillRoundedRect(10, 12, 6, height * 0.12, 2);
        graphics.fillStyle(0x4a9eff, 0.25);
        graphics.fillRoundedRect(18, 12, 4, height * 0.10, 1);

        // Rear window
        graphics.fillStyle(0x0a1520, 0.9);
        graphics.fillRoundedRect(8, height - 12 - height * 0.14, width - 16, height * 0.14, 4);

        // Headlights (bright with glow)
        graphics.fillStyle(0xffffaa, 0.5);
        graphics.fillRect(4, 2, 10, 6);
        graphics.fillRect(width - 14, 2, 10, 6);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(6, 3, 6, 4);
        graphics.fillRect(width - 12, 3, 6, 4);

        // Taillights (glowing red)
        graphics.fillStyle(0xff0000, 0.5);
        graphics.fillRect(4, height - 7, 10, 6);
        graphics.fillRect(width - 14, height - 7, 10, 6);
        graphics.fillStyle(0xff3333, 1);
        graphics.fillRect(6, height - 6, 6, 4);
        graphics.fillRect(width - 12, height - 6, 6, 4);

        // Side mirrors with chrome effect
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(-1, height * 0.28, 5, 8);
        graphics.fillRect(width - 4, height * 0.28, 5, 8);
        graphics.fillStyle(lighterColor, 0.6);
        graphics.fillRect(0, height * 0.29, 3, 5);
        graphics.fillRect(width - 3, height * 0.29, 3, 5);

        // Racing stripe (subtle)
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillRect(width / 2 - 2, 4, 4, height - 8);

        graphics.generateTexture(key, width, height);
    }

    loadSaveData() {
        try {
            const saved = localStorage.getItem('trafficCutUp_save');
            if (saved) {
                const loadedData = JSON.parse(saved);
                // Merge with defaults for any missing fields
                window.gameState.saveData = { ...DEFAULT_SAVE, ...loadedData };

                // Ensure all vehicles exist in save (handles new vehicles added in updates)
                Object.keys(DEFAULT_SAVE.vehicles).forEach(vehicleId => {
                    if (!window.gameState.saveData.vehicles[vehicleId]) {
                        window.gameState.saveData.vehicles[vehicleId] = { ...DEFAULT_SAVE.vehicles[vehicleId] };
                    }
                });
            } else {
                window.gameState.saveData = { ...DEFAULT_SAVE };
            }
        } catch (e) {
            console.warn('Failed to load save data:', e);
            window.gameState.saveData = { ...DEFAULT_SAVE };
        }
    }
}
