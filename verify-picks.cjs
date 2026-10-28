const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('dist/engine.js','utf8'));
for(const file of ['profiles','controls','picks'])vm.runInThisContext(fs.readFileSync('dist/'+file+'.js','utf8'));
let count=0;
for(let m=0;m<5;m++)for(const sub of IR.modules[m].types){
 const s=IR.blank(m,sub);
 for(const f of IR.activeFields(s)){
  if(f.key==='revision')continue;
  const choices=f.options||IRPicks.get(f,'values.'+f.key,s);
  if(f.required)assert(choices.length,sub+': missing click choices '+f.key);
  if(choices.length)s.values[f.key]=choices[0];
 }
 if(sub==='DEB-TACE')s.values.payment='自費';
 Object.assign(s.values,{status:'completed',complication:'無立即併發症'});
 s.values.post=IRPicks.get({key:'post'},'values.post',s)[0];
 if(s.values.protectionStatus==='未使用')s.values.protection='';
 const required=m===0?(['Angiography','HAIC'].includes(sub)?['catheters']:sub.startsWith('Y90')?['vessels','catheters','radio']:sub==='DEB-TACE'?['lesions','vessels','catheters']:sub==='傳統 TACE'?['lesions','vessels','catheters','drugs']:['vessels','catheters','drugs']):IR.activeGroups(s).map(g=>g.key);
 for(const g of IR.activeGroups(s))if(required.includes(g.key)){
  const row={};for(const f of g.fields){const choices=(g.key==='radio'?IRPicks.get(f,'items.'+g.key+'.0.'+f.key,s):null)||f.options||IRPicks.get(f,'items.'+g.key+'.0.'+f.key,s);if(f.required)assert(choices.length,sub+': missing '+g.key+'.'+f.key);if(choices.length)row[f.key]=choices[0];}s.items[g.key]=[row];
 }
 assert.deepEqual(IR.validate(s),[],sub);
 assert(IR.generate(s).includes('Impression'));
 assert(IR.generate(s).includes('Informed consent'))
 s.values.consent=IR.preparation[0].options[0];
 assert(IR.generate(s).includes('Informed consent was obtained'));
 s.values.status='aborted';s.values.reason='No safe access route was available';
 assert(!IR.generate(s).includes('Informed consent'));
 count++;
}
console.log(count+' subtypes completed using click choices only; explicit preparation and aborted output verified.');
