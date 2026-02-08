/**
 * UpgradeManager - Handles vehicle upgrades and stat calculations
 */
class UpgradeManager {
    constructor() {
        // No initialization needed, works with global save data
    }

    /**
     * Get the cost of an upgrade at a specific level
     */
    getUpgradeCost(upgradeId, currentLevel) {
        const upgrade = UPGRADES[upgradeId];
        if (!upgrade || currentLevel >= upgrade.maxLevel) {
            return null;
        }
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }

    /**
     * Purchase an upgrade for the selected vehicle
     */
    purchaseUpgrade(upgradeId) {
        const saveData = window.gameState.saveData;
        const vehicleId = saveData.selectedVehicle;
        const vehicleSave = saveData.vehicles[vehicleId];
        const currentLevel = vehicleSave.upgrades[upgradeId] || 0;

        const cost = this.getUpgradeCost(upgradeId, currentLevel);

        // Check if purchase is possible
        if (cost === null) {
            return { success: false, reason: 'max_level' };
        }
        if (saveData.money < cost) {
            return { success: false, reason: 'not_enough_money' };
        }

        // Purchase successful
        saveData.money -= cost;
        vehicleSave.upgrades[upgradeId] = currentLevel + 1;

        // Save to localStorage
        this.saveToStorage();

        return {
            success: true,
            newLevel: currentLevel + 1,
            cost,
            newMoney: saveData.money
        };
    }

    /**
     * Get the computed stats for a vehicle including upgrades
     */
    getVehicleStats(vehicleId) {
        const vehicle = VEHICLES[vehicleId];
        const saveData = window.gameState.saveData;
        const vehicleSave = saveData.vehicles[vehicleId];

        if (!vehicle || !vehicleSave) {
            return null;
        }

        // Start with base stats
        const stats = { ...vehicle.baseStats };

        // Apply upgrades
        Object.keys(UPGRADES).forEach(upgradeId => {
            const upgrade = UPGRADES[upgradeId];
            const level = vehicleSave.upgrades[upgradeId] || 0;

            if (level > 0 && upgrade.stat in stats) {
                const bonus = 1 + (upgrade.bonusPerLevel * level);
                stats[upgrade.stat] = Math.floor(stats[upgrade.stat] * bonus);
            }
        });

        return stats;
    }

    /**
     * Get current upgrade levels for a vehicle
     */
    getUpgradeLevels(vehicleId) {
        const saveData = window.gameState.saveData;
        const vehicleSave = saveData.vehicles[vehicleId];
        return vehicleSave ? { ...vehicleSave.upgrades } : {};
    }

    /**
     * Check if a vehicle is owned
     */
    isVehicleOwned(vehicleId) {
        const saveData = window.gameState.saveData;
        return saveData.vehicles[vehicleId]?.owned || false;
    }

    /**
     * Purchase a vehicle
     */
    purchaseVehicle(vehicleId) {
        const vehicle = VEHICLES[vehicleId];
        const saveData = window.gameState.saveData;

        if (!vehicle) {
            return { success: false, reason: 'invalid_vehicle' };
        }

        if (this.isVehicleOwned(vehicleId)) {
            return { success: false, reason: 'already_owned' };
        }

        if (saveData.money < vehicle.unlockCost) {
            return { success: false, reason: 'not_enough_money' };
        }

        // Purchase successful
        saveData.money -= vehicle.unlockCost;
        saveData.vehicles[vehicleId].owned = true;

        this.saveToStorage();

        return {
            success: true,
            cost: vehicle.unlockCost,
            newMoney: saveData.money
        };
    }

    /**
     * Select a vehicle as the current vehicle
     */
    selectVehicle(vehicleId) {
        if (!this.isVehicleOwned(vehicleId)) {
            return false;
        }

        window.gameState.saveData.selectedVehicle = vehicleId;
        this.saveToStorage();
        return true;
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('trafficCutUp_save', JSON.stringify(window.gameState.saveData));
        } catch (e) {
            console.warn('Failed to save game data:', e);
        }
    }
}
