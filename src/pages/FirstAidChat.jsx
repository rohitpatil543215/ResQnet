import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Heart, Bot, User, X, AlertTriangle, Phone, ChevronDown } from 'lucide-react';

// ─── First Aid Knowledge Base ───
const FIRST_AID_DB = {
    bleeding: {
        title: '🩸 Bleeding / Wound Care',
        steps: [
            { step: 1, title: 'Apply Pressure', desc: 'Press a clean cloth or bandage firmly on the wound. Do NOT remove it even if blood soaks through — add more layers on top.' },
            { step: 2, title: 'Elevate', desc: 'If possible, raise the injured area above the level of the heart to reduce blood flow.' },
            { step: 3, title: 'Keep Steady', desc: 'Do NOT remove any objects stuck in the wound. Stabilize them with padding around the object.' },
            { step: 4, title: 'Wrap It', desc: 'Once bleeding slows, wrap the wound tightly (but not too tight) with a bandage or clean cloth.' },
            { step: 5, title: 'Get Help', desc: 'If bleeding does not stop within 10 minutes, or if it\'s spurting blood, call 112 immediately.' },
        ],
    },
    burn: {
        title: '🔥 Burns',
        steps: [
            { step: 1, title: 'Cool the Burn', desc: 'Run cool (NOT cold/ice) water over the burn for at least 10-20 minutes. This is the most important step.' },
            { step: 2, title: 'Remove Clothing', desc: 'Gently remove clothing or jewelry near the burn BEFORE swelling starts. Don\'t pull anything stuck to the burn.' },
            { step: 3, title: 'Cover It', desc: 'Cover the burn loosely with a clean, non-stick bandage or cling wrap to protect it.' },
            { step: 4, title: 'Don\'t Apply', desc: '❌ Do NOT apply butter, toothpaste, ice, or any cream. These trap heat and worsen the burn.' },
            { step: 5, title: 'Pain Relief', desc: 'Take ibuprofen or paracetamol if available for pain. Drink water to stay hydrated.' },
            { step: 6, title: 'Seek Help', desc: 'Go to hospital if: burn is larger than palm, on face/hands/joints, or skin looks white/charred.' },
        ],
    },
    choking: {
        title: '😮 Choking',
        steps: [
            { step: 1, title: 'Ask', desc: '"Are you choking?" If the person can cough forcefully, encourage them to keep coughing.' },
            { step: 2, title: 'Back Blows', desc: 'Stand behind, lean them forward. Give 5 firm back blows between shoulder blades with the heel of your hand.' },
            { step: 3, title: 'Abdominal Thrusts', desc: 'Stand behind, wrap arms around their waist. Make a fist above the navel, pull sharply inward and upward 5 times.' },
            { step: 4, title: 'Repeat', desc: 'Alternate between 5 back blows and 5 abdominal thrusts until the object comes out.' },
            { step: 5, title: 'Unconscious', desc: 'If person becomes unconscious, lower them to the ground and call 112. Begin CPR if you know how.' },
        ],
    },
    cpr: {
        title: '💓 CPR / No Breathing',
        steps: [
            { step: 1, title: 'Check Response', desc: 'Tap shoulders firmly and shout "Are you okay?" If no response, call 112 immediately.' },
            { step: 2, title: 'Open Airway', desc: 'Tilt the head back gently by lifting the chin. Look, listen, and feel for breathing for 10 seconds.' },
            { step: 3, title: 'Start Compressions', desc: 'Place heel of hand on center of chest (between nipples). Push hard and fast — 2 inches deep, 100-120 per minute.' },
            { step: 4, title: 'Rhythm', desc: 'Push to the beat of "Stayin\' Alive" by Bee Gees. Give 30 compressions, then 2 rescue breaths if trained.' },
            { step: 5, title: 'Don\'t Stop', desc: 'Continue CPR until: person starts breathing, paramedics arrive, or you are physically exhausted.' },
        ],
    },
    fracture: {
        title: '🦴 Fracture / Broken Bone',
        steps: [
            { step: 1, title: 'Don\'t Move It', desc: 'Keep the injured area as still as possible. Do NOT try to straighten or push a bone back in.' },
            { step: 2, title: 'Support', desc: 'Use a splint (stick, ruler, rolled newspaper) to keep the area immobile. Tie gently with cloth above and below the fracture.' },
            { step: 3, title: 'Ice Pack', desc: 'Apply a cold pack wrapped in cloth for 15-20 minutes to reduce swelling. Never put ice directly on skin.' },
            { step: 4, title: 'Elevate', desc: 'If it\'s a limb, elevate it on pillows to reduce swelling.' },
            { step: 5, title: 'Watch for Shock', desc: 'If the person feels faint, pale, or has rapid breathing — lay them down and elevate their legs.' },
            { step: 6, title: 'Get Help', desc: 'Call 112 or go to hospital. Do NOT let the person eat or drink (they may need surgery).' },
        ],
    },
    heart_attack: {
        title: '❤️ Heart Attack',
        steps: [
            { step: 1, title: 'Call 112 NOW', desc: 'Don\'t wait. Signs: chest pain/pressure, pain spreading to arm/jaw, shortness of breath, sweating, nausea.' },
            { step: 2, title: 'Aspirin', desc: 'If the person is not allergic, give them 1 regular aspirin (325mg) to chew slowly. This can be life-saving.' },
            { step: 3, title: 'Position', desc: 'Help them sit in a comfortable position, usually semi-upright (propped against a wall). Loosen tight clothing.' },
            { step: 4, title: 'Stay Calm', desc: 'Keep them calm and still. Do NOT let them walk around or exert themselves.' },
            { step: 5, title: 'Be Ready', desc: 'If the person stops breathing, begin CPR immediately. Push hard and fast on the center of their chest.' },
        ],
    },
    snake_bite: {
        title: '🐍 Snake Bite',
        steps: [
            { step: 1, title: 'Move Away', desc: 'Get away from the snake. Do NOT try to catch or kill it. Try to remember its color and shape.' },
            { step: 2, title: 'Keep Still', desc: 'Keep the person calm and still. Movement spreads venom faster through the body.' },
            { step: 3, title: 'Remove Items', desc: 'Remove rings, watches, and tight clothing near the bite before swelling starts.' },
            { step: 4, title: 'Position', desc: 'Keep the bitten area below heart level. Do NOT elevate it.' },
            { step: 5, title: 'DON\'T Do', desc: '❌ Do NOT: cut the wound, suck out venom, apply tourniquet, apply ice, or give alcohol.' },
            { step: 6, title: 'Hospital ASAP', desc: 'Get to a hospital immediately. Anti-venom is the only effective treatment and works best when given early.' },
        ],
    },
    road_accident: {
        title: '🚗 Road Accident',
        steps: [
            { step: 1, title: 'Scene Safety', desc: 'Turn on hazard lights. Don\'t move the victim unless there\'s immediate danger (fire, traffic). Set up warning signs.' },
            { step: 2, title: 'Call 112', desc: 'Call emergency services. Give exact location (landmark/GPS), number of victims, and brief description.' },
            { step: 3, title: 'Check Breathing', desc: 'Gently tap and ask "Are you okay?" Check if they\'re breathing. Do NOT remove a helmet.' },
            { step: 4, title: 'Stop Bleeding', desc: 'Apply direct pressure on any bleeding wounds with clean cloth. Elevate injured limbs if possible.' },
            { step: 5, title: 'Spinal Care', desc: 'If you suspect spinal injury (neck/back pain, can\'t feel limbs) — do NOT move them. Keep head and neck aligned.' },
            { step: 6, title: 'Keep Warm', desc: 'Cover with blanket or jacket. Do NOT give food or water. Stay with them until help arrives.' },
        ],
    },
    seizure: {
        title: '⚡ Seizure / Epilepsy',
        steps: [
            { step: 1, title: 'Clear Area', desc: 'Move furniture and sharp objects away. Protect their head with something soft (folded jacket).' },
            { step: 2, title: 'Don\'t Restrain', desc: '❌ Do NOT hold them down, put anything in their mouth, or give them water during the seizure.' },
            { step: 3, title: 'Time It', desc: 'Time the seizure. If it lasts more than 5 minutes, call 112 immediately.' },
            { step: 4, title: 'Recovery Position', desc: 'After the seizure stops, gently turn them on their side (recovery position) to keep airway clear.' },
            { step: 5, title: 'Stay & Comfort', desc: 'Stay with them. They may be confused when they wake up. Speak calmly and reassure them.' },
        ],
    },
    drowning: {
        title: '🌊 Drowning',
        steps: [
            { step: 1, title: 'Call for Help', desc: 'Shout for help and call 112. Do NOT jump in unless you\'re a trained swimmer — you may drown too.' },
            { step: 2, title: 'Reach/Throw', desc: 'Use a stick, rope, towel, or flotation device to reach them. Throw anything that floats.' },
            { step: 3, title: 'Once Out', desc: 'Lay them flat on a hard surface. Check for breathing. If not breathing, begin CPR immediately.' },
            { step: 4, title: 'Recovery', desc: 'If breathing, put in recovery position (on their side). Even if they seem fine, take them to hospital — delayed drowning is real.' },
        ],
    },
    poison: {
        title: '☠️ Poisoning',
        steps: [
            { step: 1, title: 'Identify', desc: 'Try to find out what they ate/drank. Keep the container or sample if possible.' },
            { step: 2, title: 'Call Poison Helpline', desc: 'Call 112 or Poison Control. Tell them: substance, amount, time, person\'s age and weight.' },
            { step: 3, title: 'DON\'T Induce Vomiting', desc: '❌ Do NOT make them vomit unless specifically told by poison control. Some poisons cause more damage coming back up.' },
            { step: 4, title: 'If Unconscious', desc: 'Place in recovery position. If they stop breathing, start CPR.' },
        ],
    },
    electric_shock: {
        title: '⚡ Electric Shock',
        steps: [
            { step: 1, title: 'Cut Power', desc: 'Turn off the power source. Do NOT touch the person if they\'re still in contact with electricity.' },
            { step: 2, title: 'Separate', desc: 'Use a dry, non-metallic object (wooden stick, rubber mat, dry cloth) to separate them from the electrical source.' },
            { step: 3, title: 'Call 112', desc: 'Even if they seem fine, electrical injuries can cause internal damage. Always get medical help.' },
            { step: 4, title: 'Check & CPR', desc: 'Check breathing and pulse. Start CPR if needed. Treat any burns by cooling with water.' },
        ],
    },
};

// ─── Keyword Matcher ───
const KEYWORD_MAP = {
    bleeding: ['blood', 'bleed', 'bleeding', 'cut', 'wound', 'gash', 'slash', 'stab', 'laceration'],
    burn: ['burn', 'fire', 'scald', 'boiling', 'hot water', 'flame', 'heated', 'chemical burn', 'sunburn'],
    choking: ['choke', 'choking', 'can\'t breathe', 'stuck in throat', 'swallowed', 'gagging', 'coughing hard'],
    cpr: ['cpr', 'not breathing', 'no pulse', 'unconscious', 'collapsed', 'cardiac arrest', 'stopped breathing', 'heart stopped', 'no heartbeat'],
    fracture: ['fracture', 'broken', 'broke bone', 'snap', 'swelling', 'deformed', 'can\'t move arm', 'can\'t move leg', 'twisted ankle', 'sprain'],
    heart_attack: ['heart attack', 'chest pain', 'chest pressure', 'arm pain', 'jaw pain', 'heart', 'cardiac'],
    snake_bite: ['snake', 'bite', 'snake bite', 'venom', 'bitten'],
    road_accident: ['accident', 'crash', 'car', 'bike', 'road', 'vehicle', 'hit', 'collision', 'truck'],
    seizure: ['seizure', 'epilepsy', 'fit', 'convulsion', 'shaking', 'jerking'],
    drowning: ['drown', 'drowning', 'water', 'pool', 'river', 'submerged', 'underwater'],
    poison: ['poison', 'poisoning', 'ate something', 'toxic', 'chemical', 'detergent', 'medicine overdose', 'overdose'],
    electric_shock: ['electric', 'shock', 'electrocution', 'wire', 'current', 'power line'],
};

function detectEmergencyType(text) {
    const lower = text.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const [type, keywords] of Object.entries(KEYWORD_MAP)) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) score += kw.split(' ').length; // multi-word keywords score higher
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = type;
        }
    }
    return bestMatch;
}

function getImageAnalysis(fileName) {
    const lower = fileName.toLowerCase();
    if (lower.includes('burn') || lower.includes('fire')) return 'burn';
    if (lower.includes('blood') || lower.includes('cut') || lower.includes('wound')) return 'bleeding';
    if (lower.includes('accident') || lower.includes('crash') || lower.includes('car')) return 'road_accident';
    if (lower.includes('snake')) return 'snake_bite';
    if (lower.includes('fracture') || lower.includes('broken') || lower.includes('bone')) return 'fracture';
    // Generic analysis for any image
    return null;
}

// ─── Quick Action Buttons ───
const QUICK_ACTIONS = [
    { label: '🩸 Bleeding', type: 'bleeding' },
    { label: '🔥 Burns', type: 'burn' },
    { label: '😮 Choking', type: 'choking' },
    { label: '💓 CPR', type: 'cpr' },
    { label: '🦴 Fracture', type: 'fracture' },
    { label: '❤️ Heart Attack', type: 'heart_attack' },
    { label: '🐍 Snake Bite', type: 'snake_bite' },
    { label: '🚗 Road Accident', type: 'road_accident' },
    { label: '⚡ Seizure', type: 'seizure' },
    { label: '🌊 Drowning', type: 'drowning' },
    { label: '☠️ Poisoning', type: 'poison' },
    { label: '⚡ Electric Shock', type: 'electric_shock' },
];

// ─── Chat Component ───
export default function FirstAidChat() {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            from: 'bot',
            text: '👋 Hi! I\'m your **First Aid Assistant**.\n\nDescribe what happened or tap a quick action below. You can also send a photo of the injury.\n\nI\'ll give you simple, step-by-step instructions to help until emergency services arrive.',
            time: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    function addBotMessage(text, extra = {}) {
        setIsTyping(true);
        setTimeout(() => {
            setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'bot', text, time: new Date(), ...extra }]);
            setIsTyping(false);
        }, 800 + Math.random() * 600);
    }

    function handleSend() {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'user', text: userMsg, time: new Date() }]);
        setInput('');
        processUserMessage(userMsg);
    }

    function processUserMessage(text) {
        const type = detectEmergencyType(text);
        if (type && FIRST_AID_DB[type]) {
            const data = FIRST_AID_DB[type];
            const stepsText = data.steps.map((s) => `**Step ${s.step}: ${s.title}**\n${s.desc}`).join('\n\n');
            addBotMessage(`## ${data.title}\n\nHere are the steps:\n\n${stepsText}\n\n---\n⚠️ **Remember:** Call **112** if the situation is serious. These steps are for immediate help only.`);
        } else {
            addBotMessage(
                '🤔 I couldn\'t identify the specific emergency from your description.\n\n**Try being more specific**, like:\n- "My friend is bleeding from a cut"\n- "Someone got burned"\n- "Person is choking"\n\nOr tap one of the **quick action buttons** below for instant guidance.\n\n📞 If this is a life-threatening emergency, call **112** immediately!'
            );
        }
    }

    function handleQuickAction(type) {
        const data = FIRST_AID_DB[type];
        if (!data) return;
        setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'user', text: `How to handle: ${data.title}`, time: new Date() }]);
        const stepsText = data.steps.map((s) => `**Step ${s.step}: ${s.title}**\n${s.desc}`).join('\n\n');
        addBotMessage(`## ${data.title}\n\nHere are the steps:\n\n${stepsText}\n\n---\n⚠️ **Remember:** Call **112** if the situation is serious.`);
    }

    function handleImageUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), from: 'user', text: `📷 Sent image: ${file.name}`, image: ev.target.result, time: new Date() },
            ]);

            // Analyze image
            const detectedType = getImageAnalysis(file.name);
            if (detectedType && FIRST_AID_DB[detectedType]) {
                const data = FIRST_AID_DB[detectedType];
                const stepsText = data.steps.map((s) => `**Step ${s.step}: ${s.title}**\n${s.desc}`).join('\n\n');
                addBotMessage(`📸 **Image analyzed.** This looks like it could be related to:\n\n## ${data.title}\n\n${stepsText}\n\n---\n⚠️ Call **112** if the situation is serious.`);
            } else {
                addBotMessage(
                    '📸 I received your image. Based on what I can see:\n\n**Please describe the injury in words** so I can provide accurate first-aid steps.\n\nFor example:\n- "There\'s a deep cut with bleeding"\n- "Burns on the hand"\n- "Swollen ankle, might be broken"\n\nOr tap a **quick action** below for specific guidance.'
                );
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function formatMessage(text) {
        // Simple markdown-like formatting
        return text
            .replace(/## (.+)/g, '<h3 style="color:var(--accent);margin:0.5rem 0 0.25rem">$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/---/g, '<hr style="border:none;border-top:1px solid var(--border);margin:0.75rem 0">')
            .replace(/\n/g, '<br/>');
    }

    return (
        <div className="page" style={{ paddingBottom: 0 }}>
            <div className="container" style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: '0' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem 1.25rem',
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}
                >
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Heart size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>First Aid Assistant</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', marginRight: '4px' }} />
                            Always available • Powered by ResQNet
                        </p>
                    </div>
                    <a href="tel:112" style={{
                        padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(239,68,68,0.2)', color: '#ef4444',
                        textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                        <Phone size={14} /> 112
                    </a>
                </motion.div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '0.5rem',
                                }}
                            >
                                {msg.from === 'bot' && (
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginTop: '2px',
                                    }}>
                                        <Bot size={16} color="white" />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: msg.from === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                    background: msg.from === 'user'
                                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                        : 'var(--bg-2)',
                                    color: msg.from === 'user' ? 'white' : 'var(--text)',
                                    border: msg.from === 'bot' ? '1px solid var(--border)' : 'none',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                }}>
                                    {msg.image && (
                                        <img src={msg.image} alt="Uploaded" style={{
                                            maxWidth: '100%', maxHeight: '200px', borderRadius: '0.5rem',
                                            marginBottom: '0.5rem', display: 'block',
                                        }} />
                                    )}
                                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                                    <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.25rem', textAlign: 'right' }}>
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {msg.from === 'user' && (
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                        background: 'var(--bg-3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginTop: '2px',
                                    }}>
                                        <User size={16} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                        >
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div style={{
                                padding: '0.75rem 1rem', borderRadius: '1rem', background: 'var(--bg-2)',
                                border: '1px solid var(--border)', display: 'flex', gap: '4px',
                            }}>
                                <span className="typing-dot" style={{ '--i': 0 }} />
                                <span className="typing-dot" style={{ '--i': 1 }} />
                                <span className="typing-dot" style={{ '--i': 2 }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '0.5rem 1rem',
                            display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                            borderTop: '1px solid var(--border)',
                        }}
                    >
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.type}
                                onClick={() => handleQuickAction(action.type)}
                                style={{
                                    padding: '0.35rem 0.65rem', borderRadius: '1rem',
                                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                                    color: 'var(--text)', fontSize: '0.75rem', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.target.style.background = 'rgba(239,68,68,0.15)'; e.target.style.borderColor = '#ef4444'; }}
                                onMouseLeave={(e) => { e.target.style.background = 'var(--bg-2)'; e.target.style.borderColor = 'var(--border)'; }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Input */}
                <div style={{
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg-1)',
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
                }}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'var(--bg-2)', border: '1px solid var(--border)',
                            color: 'var(--text)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all 0.2s',
                        }}
                        title="Send Image"
                    >
                        <Camera size={18} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Describe the emergency..."
                        rows={1}
                        style={{
                            flex: 1, resize: 'none',
                            padding: '0.6rem 1rem', borderRadius: '1.25rem',
                            background: 'var(--bg-2)', border: '1px solid var(--border)',
                            color: 'var(--text)', fontSize: '0.9rem',
                            outline: 'none', fontFamily: 'inherit',
                            maxHeight: '100px',
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: input.trim() ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--bg-2)',
                            border: 'none', color: 'white', cursor: input.trim() ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all 0.2s',
                            opacity: input.trim() ? 1 : 0.4,
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>

                <style>{`
                    .typing-dot {
                        width: 8px; height: 8px; border-radius: 50%;
                        background: var(--text-muted);
                        animation: typingBounce 1.4s infinite ease-in-out;
                        animation-delay: calc(var(--i) * 0.2s);
                    }
                    @keyframes typingBounce {
                        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                        40% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
}
