/**
 * Traffic Cut-Up Tycoon - Game Data Configuration
 * Contains all game constants, vehicle stats, and upgrade definitions
 */

const GAME_CONFIG = {
    // Game dimensions
    GAME_WIDTH: 450,
    GAME_HEIGHT: 800,

    // Lane configuration
    LANES: 5,
    LANE_WIDTH: 70,
    ROAD_MARGIN: 40,

    // Speed settings (pixels per second)
    BASE_SCROLL_SPEED: 150,
    MAX_SCROLL_SPEED: 900,

    // Gameplay
    CLOSE_PASS_DISTANCE: 60,
    COMBO_TIMEOUT: 2000, // ms before combo resets
    BOOST_DURATION: 2000,
    BOOST_COOLDOWN: 5000,
    BOOST_MULTIPLIER: 1.8,

    // Scoring
    CLOSE_PASS_REWARD: 50,
    SPEED_BONUS_THRESHOLD: 500, // scroll speed to start earning speed bonus
    SPEED_BONUS_RATE: 0.1, // $ per pixel/s above threshold per second

    // Combo multipliers
    COMBO_LEVELS: [1, 1.5, 2, 3, 5],

    // Traffic
    TRAFFIC_SPAWN_INTERVAL: 800, // ms
    TRAFFIC_SPEED_VARIANCE: 0.3, // ±30% of base speed

    // Colors
    COLORS: {
        ROAD: 0x1a1a2e,
        LANE_MARKER: 0x3d3d5c,
        LANE_MARKER_CENTER: 0xffcc00,
        ROAD_EDGE: 0xff3366,
        GRASS: 0x0d1b0d
    }
};

// Vehicle definitions
const VEHICLES = {
    compact_sedan: {
        id: 'compact_sedan',
        name: 'Compact Sedan',
        description: 'Reliable and balanced. Perfect for beginners.',
        color: 0x3498db,
        baseStats: {
            topSpeed: 55,      // Slow starter car - ~495 max speed
            acceleration: 50,
            handling: 85,
            boost: 100,        // Boost power (base 100%)
            durability: 100,
            earnings: 1.0
        },
        unlockCost: 0,
        unlocked: true
    },
    economy_hatch: {
        id: 'economy_hatch',
        name: 'Economy Hatchback',
        description: 'Nimble and quick. Great handling for tight squeezes.',
        color: 0x2ecc71,
        baseStats: {
            topSpeed: 60,      // Slightly faster - ~540 max speed
            acceleration: 55,
            handling: 100,
            boost: 100,
            durability: 75,
            earnings: 1.1
        },
        unlockCost: 0,
        unlocked: true
    },
    sports_coupe: {
        id: 'sports_coupe',
        name: 'Sports Coupe',
        description: 'Fast and flashy. Higher risk, higher reward.',
        color: 0xe74c3c,
        baseStats: {
            topSpeed: 70,      // Faster - ~630 max speed
            acceleration: 65,
            handling: 80,
            boost: 100,
            durability: 65,
            earnings: 1.3
        },
        unlockCost: 5000,
        unlocked: false
    },
    muscle_car: {
        id: 'muscle_car',
        name: 'Muscle Car',
        description: 'Raw American power. Fast but harder to handle.',
        color: 0xff6600,
        baseStats: {
            topSpeed: 80,      // Fast - ~720 max speed
            acceleration: 75,
            handling: 65,
            boost: 100,
            durability: 80,
            earnings: 1.5
        },
        unlockCost: 15000,
        unlocked: false
    },
    supercar: {
        id: 'supercar',
        name: 'Supercar',
        description: 'European precision. Blazing speed with great control.',
        color: 0xffcc00,
        baseStats: {
            topSpeed: 90,      // Very fast - ~810 max speed
            acceleration: 85,
            handling: 85,
            boost: 100,
            durability: 50,
            earnings: 2.0
        },
        unlockCost: 50000,
        unlocked: false
    },
    hypercar: {
        id: 'hypercar',
        name: 'Hypercar',
        description: 'Ultimate speed machine. For true masters only.',
        color: 0x9900ff,
        baseStats: {
            topSpeed: 100,     // Max speed - 900 max speed
            acceleration: 95,
            handling: 90,
            boost: 100,
            durability: 40,
            earnings: 3.0
        },
        unlockCost: 150000,
        unlocked: false
    }
};

// Upgrade definitions
const UPGRADES = {
    engine: {
        id: 'engine',
        name: 'Engine',
        icon: '⚡',
        description: 'Increases top speed',
        stat: 'topSpeed',
        maxLevel: 5,
        baseCost: 500,
        costMultiplier: 1.8,
        bonusPerLevel: 0.1 // +10% per level
    },
    transmission: {
        id: 'transmission',
        name: 'Transmission',
        icon: '🔧',
        description: 'Faster acceleration',
        stat: 'acceleration',
        maxLevel: 5,
        baseCost: 400,
        costMultiplier: 1.7,
        bonusPerLevel: 0.12
    },
    handling: {
        id: 'handling',
        name: 'Handling',
        icon: '🎯',
        description: 'Quicker lane changes',
        stat: 'handling',
        maxLevel: 5,
        baseCost: 300,
        costMultiplier: 1.6,
        bonusPerLevel: 0.15
    },
    nitro: {
        id: 'nitro',
        name: 'Nitro',
        icon: '🔥',
        description: 'Better boost performance',
        stat: 'boost',
        maxLevel: 5,
        baseCost: 600,
        costMultiplier: 1.9,
        bonusPerLevel: 0.1
    }
};

// Traffic vehicle types
const TRAFFIC_TYPES = [
    { type: 'sedan', color: 0x95a5a6, width: 35, height: 60, speedMod: 1.0 },
    { type: 'suv', color: 0x7f8c8d, width: 40, height: 70, speedMod: 0.9 },
    { type: 'truck', color: 0x34495e, width: 45, height: 90, speedMod: 0.7 },
    { type: 'sports', color: 0x9b59b6, width: 32, height: 55, speedMod: 1.2 },
    { type: 'taxi', color: 0xf1c40f, width: 35, height: 60, speedMod: 0.95 }
];

// Save data structure
const DEFAULT_SAVE = {
    money: 0,
    highScore: 0,
    totalRuns: 0,
    totalEarnings: 0,
    selectedVehicle: 'compact_sedan',
    vehicles: {
        compact_sedan: { owned: true, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } },
        economy_hatch: { owned: true, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } },
        sports_coupe: { owned: false, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } },
        muscle_car: { owned: false, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } },
        supercar: { owned: false, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } },
        hypercar: { owned: false, upgrades: { engine: 0, transmission: 0, handling: 0, nitro: 0 } }
    }
};
