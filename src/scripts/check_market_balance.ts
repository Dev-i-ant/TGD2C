
import { MarketApi } from '../lib/marketApi';

async function main() {
    console.log('Checking Market Balance...');
    const balance = await MarketApi.getMoney();
    console.log(`Balance (raw from API): ${balance}`);

    // Check type
    console.log(`Type: ${typeof balance}`);

    if (balance !== null) {
        console.log(`In Kopeks (if input is RUB): ${Math.floor(balance * 100)}`);
        console.log(`In Rubles (if input is Kopeks): ${balance / 100}`);
    }
}

main().catch(console.error);
