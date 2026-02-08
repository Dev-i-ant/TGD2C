import { Logger } from './logger';

export interface MarketBuyResponse {
    success: boolean;
    id?: string;
    error?: string;
}

export class MarketApi {
    private static readonly BASE_URL = 'https://market.dota2.net/api/v2';
    private static readonly KEY = process.env.MARKET_API_KEY;

    /**
     * Parse partner and token from Steam Trade URL
     */
    private static parseTradeUrl(tradeUrl: string) {
        try {
            const url = new URL(tradeUrl);
            const partner = url.searchParams.get('partner');
            const token = url.searchParams.get('token');
            if (!partner || !token) throw new Error('Invalid Trade URL format');
            return { partner, token };
        } catch (e) {
            return null;
        }
    }

    /**
     * Покупка предмета для пользователя (BuyFor)
     * Документация: https://market.dota2.net/docs-v2#buy-for
     */
    static async buyForUser(itemName: string, tradeUrl: string, maxPriceKopeks: number, customId?: string): Promise<MarketBuyResponse> {
        if (!this.KEY) {
            Logger.error('Market API: KEY is missing');
            return { success: false, error: 'API Key is missing' };
        }

        const tradeParams = this.parseTradeUrl(tradeUrl);
        if (!tradeParams) {
            Logger.warn('Market API: Invalid trade URL', { tradeUrl });
            return { success: false, error: 'Неверный формат ссылки на обмен' };
        }

        try {
            const params = new URLSearchParams({
                key: this.KEY,
                hash_name: itemName,
                price: maxPriceKopeks.toString(),
                partner: tradeParams.partner,
                token: tradeParams.token
            });
            if (customId) params.append('custom_id', customId);

            const url = `${this.BASE_URL}/buy-for?${params.toString()}`;
            Logger.info('Market API: Initiating buy-for', { itemName, maxPriceKopeks, customId });

            const response = await fetch(url);
            const data = await response.json();

            Logger.info('Market API: Received response', { status: response.status, data });

            if (data.success) {
                Logger.info('Market API: Purchase successful', { id: data.id });
                return { success: true, id: data.id };
            } else {
                Logger.warn('Market API: Purchase failed', { error: data.error });
                return { success: false, error: data.error || 'Ошибка при покупке на маркете' };
            }
        } catch (error) {
            Logger.error('Market API: Network error', error, { itemName });
            return { success: false, error: 'Ошибка сети при обращении к маркету' };
        }
    }

    /**
     * Получить информацию о покупке по custom_id
     */
    static async getBuyInfoByCustomId(customId: string): Promise<any> {
        if (!this.KEY) return null;
        try {
            const response = await fetch(`${this.BASE_URL}/get-buy-info-by-custom-id?key=${this.KEY}&custom_id=${customId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            Logger.error('Market API: getBuyInfoByCustomId error', error, { customId });
            return null;
        }
    }

    /**
     * Проверить баланс маркета
     */
    static async getMoney(): Promise<number | null> {
        if (!this.KEY) return null;
        try {
            const response = await fetch(`${this.BASE_URL}/get-money?key=${this.KEY}`);
            const data = await response.json();
            Logger.info('Market API: getMoney raw response', { data });
            return data.success ? data.money : null;
        } catch (error) {
            Logger.error('Market API: getMoney error', error);
            return null;
        }
    }

    /**
     * Пинг (поддержание онлайна)
     */
    static async ping(): Promise<boolean> {
        if (!this.KEY) return false;
        try {
            const response = await fetch(`${this.BASE_URL}/ping?key=${this.KEY}`);
            const data = await response.json();
            return !!data.success;
        } catch (error) {
            return false;
        }
    }

    /**
     * Список активных трейдов
     */
    static async getTrades(): Promise<any> {
        if (!this.KEY) return null;
        try {
            const response = await fetch(`${this.BASE_URL}/get-trades?key=${this.KEY}`);
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    /**
     * Получить минимальную цену предмета
     */
    static async getMinPrice(hashName: string): Promise<number | null> {
        if (!this.KEY) return null;
        try {
            // Using search-list-items-by-hash-name-all to find best price
            const url = `${this.BASE_URL}/search-list-items-by-hash-name-all?key=${this.KEY}&list_hash_name[]=${encodeURIComponent(hashName)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.data && data.data[hashName]) {
                const items = data.data[hashName];
                if (Array.isArray(items) && items.length > 0) {
                    // Find minimum price
                    const minPrice = Math.min(...items.map((i: any) => Number(i.price)));
                    return minPrice; // Returns in kopeks usually
                }
            }
            return null;
        } catch (error) {
            Logger.error('MarketApi: getMinPrice error', error, { hashName });
            return null;
        }
    }

    /**
     * Отмена покупки
     * Документация: https://market.dota2.net/docs-v2#cancel-buy
     */
    static async cancelBuy(marketId: string): Promise<any> {
        if (!this.KEY) return null;
        try {
            Logger.info('Market API: Cancelling purchase', { marketId });
            const response = await fetch(`${this.BASE_URL}/cancel-buy/${marketId}?key=${this.KEY}`);
            const data = await response.json();
            return data;
        } catch (error) {
            Logger.error('Market API: cancelBuy error', error);
            return null;
        }
    }

    /**
     * Полная проверка доступа и баланса
     */
    static async testAccess(): Promise<{ success: boolean; money?: number; error?: string; raw?: any }> {
        if (!this.KEY) return { success: false, error: 'API Key missing in .env' };
        try {
            const response = await fetch(`${this.BASE_URL}/get-money?key=${this.KEY}`);
            const data = await response.json();
            if (data.success) {
                return { success: true, money: data.money };
            } else {
                return { success: false, error: data.error || 'Unknown error', raw: data };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}
