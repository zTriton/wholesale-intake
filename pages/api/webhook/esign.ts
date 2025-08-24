import type { NextApiRequest, NextApiResponse } from 'next';
import { supa } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const evt = String(req.body?.event || req.body?.type || '').toLowerCase();
  if (!evt.includes('complete')) {
    res.status(200).json({ ok: true });
    return;
  }

  const signerEmail =
    req.body?.submission?.email ||
    req.body?.signer?.email ||
    req.body?.data?.email ||
    req.body?.email ||
    '';

  if (!signerEmail) {
    res.status(200).json({ ok: true, note: 'no email in payload' });
    return;
  }

  const { data: buyer } = await supa
    .from('buyers')
    .select('id')
    .eq('email', signerEmail)
    .maybeSingle();

  if (!buyer) {
    res.status(200).json({ ok: true, note: 'buyer not found' });
    return;
  }

  await supa.from('ndas').upsert({
    buyer_id: buyer.id,
    provider: 'docuseal',
    audit: req.body,
    signed_at: new Date().toISOString(),
    typed_name: ''
  });

  await supa.from('deal_access').insert({
    buyer_id: buyer.id,
    // deal_id: null // add when you link to a specific deal
    granted_by: 'docuseal.webhook'
  });

  res.status(200).json({ ok: true });
  return;
}
