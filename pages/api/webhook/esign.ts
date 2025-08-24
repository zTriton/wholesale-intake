import type { NextApiRequest, NextApiResponse } from 'next';
import { supa } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method!=='POST') return res.status(405).end();

  const evt = (req.body?.event || req.body?.type || '').toString().toLowerCase();
  if (!evt.includes('complete')) return res.status(200).json({ ok:true });

  const signerEmail =
    req.body?.submission?.email ||
    req.body?.signer?.email ||
    req.body?.data?.email ||
    req.body?.email || '';

  if (!signerEmail) return res.status(200).json({ ok:true, note:'no email in payload' });

  const { data: buyer } = await supa.from('buyers').select('id').eq('email', signerEmail).maybeSingle();
  if (!buyer) return res.status(200).json({ ok:true, note:'buyer not found' });

  await supa.from('ndas').upsert({
    buyer_id: buyer.id,
    provider: 'docuseal',
    audit: req.body,
    signed_at: new Date().toISOString(),
    typed_name: ''
  });
  await supa.from('deal_access').insert({
    buyer_id: buyer.id,
    deal_id: null, // simplified for now
    granted_by: 'docuseal.webhook'
  });

  return res.status(200).json({ ok:true });
}
