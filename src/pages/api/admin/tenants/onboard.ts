import type { NextApiRequest, NextApiResponse } from 'next';
import { onboardTenant } from '../../../../lib/tenantOnboardingService';
// adjust path if needed
import requireAdmin from '../../../../lib/requireAdmin.audit';
import db from '../../../../lib/db'; // adjust if your DB client is elsewhere

export default requireAdmin(async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, tenant_id, roles } = req.body;

    if (!email || !tenant_id || !Array.isArray(roles)) {
        return res.status(400).json({ error: 'Missing or invalid request body' });
    }

    try {
        const result = await onboardTenant({ email, tenant_id, roles }, db);
        res.status(201).json({ message: 'Tenant onboarded successfully', result });
    } catch (err: any) {
        console.error('Onboarding failed:', err);
        res.status(500).json({ error: 'Onboarding failed. Rolled back.' });
    }
});
