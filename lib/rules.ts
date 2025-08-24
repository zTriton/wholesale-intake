export function classify(answers:any){
  const tags:string[] = [];
  let score = 0;
  if ((answers.assetType||'').toLowerCase()==='self-storage'){ tags.push('self-storage'); score+=10; }
  if ((answers.budgetMin||0) >= 1_000_000){ tags.push('budget-1m-plus'); score+=10; }
  const segment = score>=15?'A':score>=8?'B':'C';
  return { tags, score, segment };
}
