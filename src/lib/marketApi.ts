import { Logger } from './logger';

export interface MarketBuyResponse {
    success: boolean;
    id?: string;
    error?: string;
}

interface MarketApiBaseResponse {
    success?: boolean;
    error?: string;
    [key: string]: unknown;
}

export class MarketApi {
    private static readonly BASE_URL = 'https://market.dota2.net/api/v2';
    private static readonly KEY = process.env.MARKET_API_KEY;
    private static readonly REQUEST_TIMEOUT_MS = 10000;

    private static async request(path: string): Promise<MarketApiBaseResponse | null> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);
            const response = await fetch(`${this.BASE_URL}${path}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                Logger.warn('Market API: HTTP error', { path, status: response.status });
                return null;
            }

            const data = (await response.json()) as MarketApiBaseResponse;
            return data;
        } catch (error) {
            Logger.error('Market API: request error', error, { path });
            return null;
        }
    }

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

            const data = await this.request(`/buy-for?${params.toString()}`);
            Logger.info('Market API: buy-for response', { itemName, data });

            if (!data) {
                return { success: false, error: 'Маркет недоступен' };
            }

            if (data.success) {
                Logger.info('Market API: Purchase successful', { id: data.id });
                return { success: true, id: String(data.id) };
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
            const data = await this.request(`/get-buy-info-by-custom-id?key=${this.KEY}&custom_id=${customId}`);
            if (!data) return null;
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
            const data = await this.request(`/get-money?key=${this.KEY}`);
            if (!data) return null;
            Logger.info('Market API: getMoney raw response', { data });
            const money = Number(data.money);
            return data.success && Number.isFinite(money) ? money : null;
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
            const data = await this.request(`/ping?key=${this.KEY}`);
            if (!data) return false;
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
            return await this.request(`/get-trades?key=${this.KEY}`);
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
            const data = await this.request(`/search-list-items-by-hash-name-all?key=${this.KEY}&list_hash_name[]=${encodeURIComponent(hashName)}`);
            if (!data) return null;

            if (data.success && data.data && data.data[hashName]) {
                const items = data.data[hashName] as Array<{ price: number | string }>;
                if (Array.isArray(items) && items.length > 0) {
                    // Find minimum price
                    const minPrice = Math.min(...items.map((i) => Number(i.price)).filter((price) => Number.isFinite(price)));
                    if (!Number.isFinite(minPrice)) return null;
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
            return await this.request(`/cancel-buy/${marketId}?key=${this.KEY}`);
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
            const data = await this.request(`/get-money?key=${this.KEY}`);
            if (!data) return { success: false, error: 'Market API unavailable' };
            if (data.success) {
                return { success: true, money: Number(data.money) };
            } else {
                return { success: false, error: data.error || 'Unknown error', raw: data };
            }
        } catch (error: unknown) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
