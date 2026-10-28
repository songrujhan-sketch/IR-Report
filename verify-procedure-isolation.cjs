const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
for(const file of ['engine','profiles','controls','picks'])vm.runInThisContext(fs.readFileSync('dist/'+file+'.js','utf8'));
const choices=(s,key,path='values.'+key)=>IRPicks.get({key},path,s);
for(const sub of IR.modules[1].types.filter(x=>x!=='Sclerotherapy'))for(const mode of ['新置管','換管']){
 if(sub==='STENT'&&mode!=='新置管')continue;
 const s=IR.blank(1,sub);s.values={mode,guidance:'fluoroscopy',status:'completed',post:IRProfile.get(s).post[0],complication:'無立即併發症'};
 const c=IR.tubeConfig(s),name=choices(s,'name','items.tubes.0.name')[0];
 s.items.tubes=[{side:'left',puncture:c.puncture.find(x=>x.includes('left'))||c.puncture[0],name,size:c.sizes[0],tip:c.tips[0],result:choices(s,'result','items.tubes.0.result')[0]}];
 assert.deepEqual(IR.validate(s),[],sub+' '+mode);
 const text=IR.generate(s);
 if(c.urinary){assert(!/biliary|bile duct|hepatic hilum/i.test([...c.names,...c.obstruction,...c.tips,...c.puncture].join(' ')));assert(!IR.activeGroups(s)[0].fields[0].options.includes('midline'));assert(!IR.activeFields(s).find(f=>f.key==='guidance').options.includes('CT'));s.values.urinaryFinding='staghorn stones';assert(IR.generate(s).includes('Staghorn stones were identified.'));assert(!IR.generate(s).includes('Obstruction at staghorn'));}
 if(c.biliary){assert(!/ureter|nephrostomy|renal|bladder/i.test([...c.names,...c.obstruction,...c.tips,...c.puncture].join(' ')));assert(!IR.activeFields(s).find(f=>f.key==='guidance').options.includes('CT'));}
 if(sub==='STENT'){s.items.tubes[0].length='60';const r=IR.generate(s);assert(r.includes('6 mm metallic biliary stent (length: 60 mm)'));assert(!r.includes('6 Fr metallic'));assert(r.includes('Biliary tract stent'));assert(!/tip in/.test(r));}
 if(sub==='DJ'){assert(text.includes('proximal and distal ends'));assert(!/metallic biliary/.test(text));}
}
for(const sub of IR.modules[3].types){const s=IR.blank(3,sub);assert(!/renal|bladder|bile duct|duodenum/.test(choices(s,'tip','items.collections.0.tip').join(' ')));assert(!/urine|bile|duodenum/.test(choices(s,'result','items.collections.0.result').join(' ')));}
for(const sub of IR.modules[4].types){const s=IR.blank(4,sub);assert(choices(s,'location','items.lesions.0.location').every(x=>x.startsWith('hepatic segment')));assert(choices(s,'device','items.ablations.0.device').every(x=>sub==='RFA'?/radiofrequency/.test(x):/microwave/.test(x)));}
for(const sub of ['手術前栓塞','緊急栓塞止血','HAIC'])assert(!choices(IR.blank(0,sub),'name','items.drugs.0.name').includes('doxorubicin'));
console.log('Procedure isolation passed: all tube subtypes and exchange modes, stent units, Staghorn wording, urinary/biliary separation, CT-drainage targets, ablation devices and embolization materials.');
