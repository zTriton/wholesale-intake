import { useState } from 'react';

export default function Access(){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState<any>({});

  const fields=[
    {key:'name',label:'Full Name',type:'text',req:true},
    {key:'email',label:'Email',type:'email',req:true},
    {key:'phone',label:'Phone',type:'tel'},
    {key:'assetType',label:'Asset Type',type:'select',options:['self-storage','industrial','multifamily'],req:true},
    {key:'budgetMin',label:'Budget (min $)',type:'number',req:true}
  ];
  const next=()=>{const f=fields[step]; if(f?.req && !form[f.key]) return alert('Please complete this step.'); setStep(s=>s+1);};

  async function goSign(){
    const s1 = await fetch('/api/submit',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ name:form.name, email:form.email, phone:form.phone, answers:form })
    }).then(r=>r.json());
    if(!s1?.ok) return alert('Error saving your info');

    const base = process.env.NEXT_PUBLIC_DOCUSEAL_URL!;
    window.location.href = base;
  }

  if(step<fields.length){
    const f=fields[step];
    return (
      <div style={{maxWidth:560,margin:'24px auto'}}>
        <h2>Access Off-Market Deals</h2>
        <label>{f.label}</label>
        {f.type==='select' ? (
          <select value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})}>
            <option value="">Select…</option>
            {f.options?.map((o:string)=><option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={f.type} value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
        )}
        <div style={{marginTop:12}}><button onClick={next}>Next</button></div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:720,margin:'24px auto'}}>
      <div style={{border:'1px solid #ddd',padding:12,maxHeight:200,overflow:'auto'}}>
        <h4>Mutual NDA – Off-Market Deal Access</h4>
        <p>Non-disclosure / non-circumvent / no distribution.</p>
      </div>
      <label><input type="checkbox" onChange={e=>setForm({...form, nda_ok:e.target.checked})}/> I agree to the NDA</label>
      <div style={{marginTop:12}}>
        <button onClick={()=> form.nda_ok ? goSign() : alert('Please agree to continue.')}>Agree & Continue</button>
      </div>
    </div>
  );
}
