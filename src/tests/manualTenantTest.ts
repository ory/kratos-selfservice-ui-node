import { createTenantRow } from '../lib/db/transactions';

(async () => {
    try {
        const result = await createTenantRow({
            name: 'ScanSure Labs',
            subdomain: 'scansure-labs'
        });

        console.log('✅ Tenant created:', result);
    } catch (err) {
        console.error('❌ Test failed:', err);
    }
})();
