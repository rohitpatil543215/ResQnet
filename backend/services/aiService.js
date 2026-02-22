/**
 * AI Service — simulated ML for hackathon demo.
 * In production, replace these with real ML model calls.
 */

/**
 * Classify emergency severity from description and type.
 * Simulates AI-based severity classification.
 */
export function classifySeverity(type, description = '') {
    const desc = description.toLowerCase();

    // Critical keywords
    const criticalKeywords = ['unconscious', 'not breathing', 'heavy bleeding', 'trapped', 'fire', 'explosion', 'multiple', 'fatal', 'critical', 'dying', 'cardiac', 'heart attack', 'stroke'];
    // Moderate keywords
    const moderateKeywords = ['broken', 'fracture', 'bleeding', 'pain', 'injury', 'accident', 'crash', 'impact', 'burn'];

    if (criticalKeywords.some((k) => desc.includes(k))) return 'critical';
    if (type === 'fire' || type === 'natural_disaster') return 'critical';
    if (moderateKeywords.some((k) => desc.includes(k))) return 'moderate';
    if (type === 'road_accident') return 'moderate';
    return 'minor';
}

/**
 * Simulated voice panic detection.
 * In production, use audio analysis ML model.
 */
export function detectPanic(audioFeatures = {}) {
    // Simulation: high pitch + high volume = panic
    const { pitch = 0, volume = 0, speechRate = 0 } = audioFeatures;
    if (pitch > 0.7 && volume > 0.8) return { isPanic: true, confidence: 0.85 };
    if (volume > 0.9) return { isPanic: true, confidence: 0.7 };
    return { isPanic: false, confidence: 0.3 };
}

/**
 * Simulated image damage detection.
 * Returns estimated damage level.
 */
export function analyzeImage(imageUrl) {
    // Simulation for hackathon
    return {
        damageLevel: 'moderate',
        confidence: 0.72,
        detectedObjects: ['vehicle', 'debris', 'road'],
        recommendation: 'Send medical assistance and traffic control',
    };
}

/**
 * Get first-aid instructions based on emergency type.
 */
export function getFirstAidInstructions(type) {
    const instructions = {
        road_accident: [
            { step: 1, title: 'Ensure Safety', description: 'Do not move the victim unless there is immediate danger (fire, traffic). Turn on hazard lights and set up warning signs.' },
            { step: 2, title: 'Call Emergency', description: 'Call 112 immediately. Provide exact location and number of victims.' },
            { step: 3, title: 'Check Responsiveness', description: 'Gently tap the person and ask "Are you okay?" Check for breathing.' },
            { step: 4, title: 'Control Bleeding', description: 'Apply direct pressure on wounds with clean cloth. Elevate injured limbs if possible.' },
            { step: 5, title: 'Keep Victim Warm', description: 'Cover with blanket or jacket. Do not give food or water.' },
            { step: 6, title: 'Monitor', description: 'Stay with the victim until help arrives. Keep them calm and still.' },
        ],
        medical: [
            { step: 1, title: 'Assess Situation', description: 'Check if the person is conscious, breathing, and has a pulse.' },
            { step: 2, title: 'Call for Help', description: 'Call 112 or local emergency services immediately.' },
            { step: 3, title: 'CPR if Needed', description: 'If not breathing: 30 chest compressions, 2 rescue breaths. Repeat.' },
            { step: 4, title: 'Recovery Position', description: 'If breathing but unconscious, place in recovery position (on their side).' },
            { step: 5, title: 'Note Symptoms', description: 'Record symptoms, time of onset, and any medications taken.' },
        ],
        fire: [
            { step: 1, title: 'Evacuate', description: 'Get everyone out. Do not use elevators. Stay low to avoid smoke.' },
            { step: 2, title: 'Call Fire Service', description: 'Call 101 or 112. Report exact location and fire size.' },
            { step: 3, title: 'Stop, Drop, Roll', description: 'If clothes catch fire: stop moving, drop to ground, roll to extinguish.' },
            { step: 4, title: 'Cool Burns', description: 'Run cool (not cold) water over burns for 10+ minutes. Do not apply ice.' },
            { step: 5, title: 'Do Not Re-enter', description: 'Never go back inside a burning building.' },
        ],
        natural_disaster: [
            { step: 1, title: 'Take Cover', description: 'Move to a safe location. Stay away from windows and heavy objects.' },
            { step: 2, title: 'Emergency Kit', description: 'Grab emergency supplies: water, phone, first-aid kit, flashlight.' },
            { step: 3, title: 'Stay Informed', description: 'Listen to official radio/news for updates and instructions.' },
            { step: 4, title: 'Help Others', description: 'Check on neighbors, especially elderly and children.' },
        ],
        violence: [
            { step: 1, title: 'Ensure Safety', description: 'Move to a safe location. Do not confront the attacker.' },
            { step: 2, title: 'Call Police', description: 'Call 100 or 112 immediately. Give details and location.' },
            { step: 3, title: 'First Aid', description: 'If someone is injured, apply pressure to wounds. Keep them calm.' },
            { step: 4, title: 'Document', description: 'Note details: descriptions, vehicle plates, direction of escape.' },
        ],
        other: [
            { step: 1, title: 'Stay Calm', description: 'Assess the situation before acting.' },
            { step: 2, title: 'Call for Help', description: 'Call 112 for any emergency assistance.' },
            { step: 3, title: 'Provide Aid', description: 'Help if safe to do so. Do not put yourself at risk.' },
        ],
    };
    return instructions[type] || instructions.other;
}
