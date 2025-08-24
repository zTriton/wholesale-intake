import type { NextApiRequest, NextApiResponse } from 'next';
import { supa } from '../../lib/supabase';
import { classify } from '../../lib/rules';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { name, email, phone, answers } = req.body || {};
  if (!name || !email) {
    res.status(400).json({ ok: false, err: 'missing' });
    return;
  }

  const { data: buyers, error } = await supa
    .from('buyers')
    .upsert({ email, name, phone }, { onConflict: 'email' })
    .select()
    .limit(1);

  if (error || !buyers?.[0]) {
    res.status(500).json({ ok: false, err: 'db' });
    return;
  }

  const buyer = buyers[0];
  const { tags, score, segment } = classify(answers || {});
  await supa.from('submissions').insert({ buyer_id: buyer.id, answers, score, tags });
  await supa.from('buyers').update({ status: segment }).eq('id', buyer.id);

  res.status(200).json({ ok: true, buyer_id: buyer.id });
  return;
}
