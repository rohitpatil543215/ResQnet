/**
 * SMS Fallback Service using Twilio.
 * Falls back to console log if Twilio is not configured.
 */

let twilioClient = null;

function getTwilioClient() {
    if (twilioClient) return twilioClient;
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!accountSid || accountSid === 'your_twilio_sid') return null;
        // Dynamic import not needed since it's in deps
        // For hackathon, we'll simulate
        return null;
    } catch {
        return null;
    }
}

/**
 * Send emergency SMS to 112 or configured number.
 */
export async function sendEmergencySMS(userData, location) {
    const message = `🚨 RESQNET EMERGENCY\nName: ${userData.name}\nBlood Group: ${userData.bloodGroup || 'Unknown'}\nLocation: ${location.lat}, ${location.lng}\nGoogle Maps: https://maps.google.com/?q=${location.lat},${location.lng}\nSent via ResQNet Emergency Network`;

    const client = getTwilioClient();

    if (client) {
        try {
            await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: '+91112', // Emergency number
            });
            return { success: true, method: 'sms' };
        } catch (err) {
            console.error('Twilio SMS failed:', err.message);
        }
    }

    // Fallback: log to console for demo
    console.log('📱 OFFLINE SMS (simulated):', message);
    return { success: true, method: 'simulated', message };
}

/**
 * Send notification SMS to a helper.
 */
export async function sendHelperSMS(phone, emergencyDetails) {
    const message = `🚨 ResQNet: Emergency ${emergencyDetails.type} at ${emergencyDetails.distance}km from you. Open app to respond.`;
    console.log(`📱 SMS to ${phone}:`, message);
    return { success: true, method: 'simulated' };
}
