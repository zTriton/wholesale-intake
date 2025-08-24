import type { NextApiRequest, NextApiResponse } from 'next';
import { supa } from '../../lib/supabase';
import { classify } from '../../lib/rules';

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST') return res.status(405).end();
  const { name, email, phone, answers } = req.body||{};
  if(!name||!email) return res.status(400).json({ok:false,err:'missing'});

  const { data: buyers, error } = await supa
    .from('buyers')
    .upsert({ email, name, phone }, { onConflict:'email' })
    .select().limit(1);

  if (error || !buyers?.[0]) return res.status(500).json({ ok:false, err:'db' });
  const buyer = buyers[0];

  const { tags, score, segment } = classify(answers||{});
  await supa.from('submissions').insert({ buyer_id: buyer.id, answers, score, tags });
  await supa.from('buyers').update({ status: segment }).eq('id', buyer.id);

  res.json({ ok:true, buyer_id: buyer.id });
}
