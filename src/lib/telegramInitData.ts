import { createHmac } from 'crypto';

interface TelegramInitDataValidationResult {
    valid: boolean;
    user?: {
        id: number;
        username?: string;
        first_name?: string;
        last_name?: string;
        photo_url?: string;
    };
    error?: string;
}

const MAX_INIT_DATA_AGE_SECONDS = 60 * 60 * 24; // 24h

export function validateTelegramInitData(
    initData: string,
    botToken: string,
    maxAgeSeconds: number = MAX_INIT_DATA_AGE_SECONDS
): TelegramInitDataValidationResult {
    if (!initData || !botToken) {
        return { valid: false, error: 'Missing initData or bot token' };
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    const authDate = params.get('auth_date');
    const userRaw = params.get('user');

    if (!hash || !authDate || !userRaw) {
        return { valid: false, error: 'Missing required initData fields' };
    }

    const authDateUnix = Number(authDate);
    if (!Number.isFinite(authDateUnix)) {
        return { valid: false, error: 'Invalid auth_date' };
    }

    const nowUnix = Math.floor(Date.now() / 1000);
    if (nowUnix - authDateUnix > maxAgeSeconds) {
        return { valid: false, error: 'initData is expired' };
    }

    const checkPairs: string[] = [];
    for (const [key, value] of params.entries()) {
        if (key === 'hash') continue;
        checkPairs.push(`${key}=${value}`);
    }
    checkPairs.sort();
    const dataCheckString = checkPairs.join('\n');

    // Official Telegram algorithm:
    // secret = HMAC_SHA256("WebAppData", bot_token)
    // expected_hash = HMAC_SHA256(secret, data_check_string)
    const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = createHmac('sha256', secret).update(dataCheckString).digest('hex');

    if (expectedHash !== hash) {
        return { valid: false, error: 'Invalid initData hash' };
    }

    try {
        const user = JSON.parse(userRaw);
        if (!user || typeof user.id !== 'number') {
            return { valid: false, error: 'Invalid user payload' };
        }
        return { valid: true, user };
    } catch {
        return { valid: false, error: 'Failed to parse user payload' };
    }
}
