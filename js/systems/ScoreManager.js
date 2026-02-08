/**
 * ScoreManager - Handles scoring, combos, and money calculations
 */
class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.runMoney = 0;
        this.combo = 0;
        this.comboTimer = null;
        this.closePasses = 0;
        this.maxCombo = 0;
        this.speedBonusAccumulator = 0;
    }

    /**
     * Register a close pass and award money
     */
    registerClosePass(distance) {
        // Calculate base reward (closer = more money)
        const maxDistance = GAME_CONFIG.CLOSE_PASS_DISTANCE;
        const closeness = 1 - (distance / maxDistance);
        const baseReward = Math.floor(GAME_CONFIG.CLOSE_PASS_REWARD * (0.5 + closeness * 0.5));

        // Increment combo
        this.combo++;
        this.closePasses++;

        // Track max combo
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        // Get multiplier based on combo
        const multiplierIndex = Math.min(this.combo - 1, GAME_CONFIG.COMBO_LEVELS.length - 1);
        const multiplier = GAME_CONFIG.COMBO_LEVELS[multiplierIndex];

        // Get vehicle earnings bonus
        const saveData = window.gameState.saveData;
        const vehicle = VEHICLES[saveData.selectedVehicle];
        const earningsBonus = vehicle.baseStats.earnings;

        // Calculate final reward
        const reward = Math.floor(baseReward * multiplier * earningsBonus);
        this.runMoney += reward;

        // Reset combo timer
        this.resetComboTimer();

        // Return info for visual feedback
        return {
            reward,
            combo: this.combo,
            multiplier,
            isNewMax: this.combo === this.maxCombo && this.combo > 1
        };
    }

    /**
     * Add speed bonus over time
     */
    addSpeedBonus(currentSpeed, deltaSeconds) {
        if (currentSpeed > GAME_CONFIG.SPEED_BONUS_THRESHOLD) {
            const bonus = (currentSpeed - GAME_CONFIG.SPEED_BONUS_THRESHOLD) *
                GAME_CONFIG.SPEED_BONUS_RATE * deltaSeconds;
            this.speedBonusAccumulator += bonus;

            // Add to run money in chunks
            if (this.speedBonusAccumulator >= 1) {
                const toAdd = Math.floor(this.speedBonusAccumulator);
                this.runMoney += toAdd;
                this.speedBonusAccumulator -= toAdd;
                return toAdd;
            }
        }
        return 0;
    }

    /**
     * Reset combo timer
     */
    resetComboTimer() {
        if (this.comboTimer) {
            this.comboTimer.remove();
        }

        this.comboTimer = this.scene.time.delayedCall(GAME_CONFIG.COMBO_TIMEOUT, () => {
            this.combo = 0;
        });
    }

    /**
     * Get current combo multiplier
     */
    getMultiplier() {
        if (this.combo === 0) return 1;
        const index = Math.min(this.combo - 1, GAME_CONFIG.COMBO_LEVELS.length - 1);
        return GAME_CONFIG.COMBO_LEVELS[index];
    }

    /**
     * Get run summary for game over
     */
    getRunSummary() {
        return {
            money: this.runMoney,
            closePasses: this.closePasses,
            maxCombo: this.maxCombo,
            multiplier: this.getMultiplier()
        };
    }

    /**
     * Finalize run and add to save data
     */
    finalizeRun() {
        const saveData = window.gameState.saveData;

        // Add money to wallet
        saveData.money += this.runMoney;
        saveData.totalEarnings += this.runMoney;
        saveData.totalRuns++;

        // Check for new high score
        const isNewHighScore = this.runMoney > saveData.highScore;
        if (isNewHighScore) {
            saveData.highScore = this.runMoney;
        }

        // Update current run stats
        window.gameState.currentRun = {
            money: this.runMoney,
            closePasses: this.closePasses,
            maxCombo: this.maxCombo,
            isNewHighScore
        };

        // Save to localStorage
        this.saveToStorage();

        return isNewHighScore;
    }

    /**
     * Save data to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('trafficCutUp_save', JSON.stringify(window.gameState.saveData));
        } catch (e) {
            console.warn('Failed to save game data:', e);
        }
    }
}
