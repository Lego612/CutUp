/**
 * Traffic Cut-Up Tycoon - Main Game Configuration
 */

// Wait for DOM to be ready
window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.GAME_WIDTH,
        height: GAME_CONFIG.GAME_HEIGHT,
        parent: 'game-container',
        backgroundColor: '#0a0a12',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            min: {
                width: 320,
                height: 480
            },
            max: {
                width: 600,
                height: 1000
            }
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
                gravity: { y: 0 }
            }
        },
        scene: [BootScene, MenuScene, GameScene, GarageScene, GameOverScene],
        render: {
            pixelArt: false,
            antialias: true
        }
    };

    // Create the game instance
    window.game = new Phaser.Game(config);

    // Global game state
    window.gameState = {
        saveData: null,
        currentRun: {
            money: 0,
            distance: 0,
            closePasses: 0,
            maxCombo: 0
        }
    };
});
