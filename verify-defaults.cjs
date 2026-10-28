const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
for(const file of ['engine','profiles','controls','picks'])vm.runInThisContext(fs.readFileSync('dist/'+file+'.js','utf8'));
let count=0;
for(let m=0;m<IR.modules.length;m++)for(const sub of IR.modules[m].types){
 const s=IR.blank(m,sub);assert.equal(s.values.anesthesia,'local anesthesia');assert.equal(IR.hasUserData(s),false,sub);assert.equal(s.values.complication,'無立即併發症');assert.equal(s.values.tolerance,'病人耐受良好');assert.equal(s.values.status,'completed');assert(s.values.post);assert(IR.validate(s).length>0);assert(IR.generate(s).includes('No immediate complication'));if(IR.supportsHemostasis(s))assert(IR.generate(s).includes('Hemostasis was achieved'));
 for(const step of IR.standardSteps(s))assert(IRProfile.get(s).steps.includes(step),sub+': default step missing from controls');
 s.values.anesthesia='';assert(IR.hasUserData(s));s.values.anesthesia='local anesthesia';assert(!IR.hasUserData(s));
 s.values.status='aborted';s.values.reason='No safe route';const r=IR.generate(s);assert(!r.includes('guidewire was advanced'));assert(!r.includes('catheter was secured'));assert(!r.includes('Images were obtained'));count++;
}
for(const sub of ['傳統 TACE','DEB-TACE']){const s=IR.blank(0,sub);assert.equal(s.values.accessSide,'right');assert.equal(s.values.access,'common femoral artery');assert.equal(s.values.hemostasis,'manual compression');assert.equal(s.values.hemostasisConfirm,'完成止血');}
for(const m of [1,2,3,4])for(const sub of IR.modules[m].types){const s=IR.blank(m,sub);assert(!IR.commonFor(s).some(f=>f.key==='hemostasisConfirm'));s.values.hemostasisConfirm='未完成止血';assert(!IR.generate(s).includes('Hemostasis'));assert(!IR.generate(s).includes('within 3 days'));}
const p=IR.blank(1,'PTCD');assert.equal(p.values.guidance,'ultrasound and fluoroscopy');assert.equal(p.values.mode,'新置管');assert(p.values.procedureSteps.includes('biliary system'));assert(!p.values.procedureSteps.includes('existing'));
p.items.tubes=[{side:'left',puncture:'left intrahepatic bile duct',name:'biliary drainage catheter',size:'10',tip:'duodenum',result:'Bile drained freely'}];Object.assign(p.values,{status:'completed',post:'Free drainage was demonstrated',complication:'無立即併發症'});assert.deepEqual(IR.validate(p),[]);const r=IR.generate(p);assert(r.indexOf('Cholangiography')<r.indexOf('was inserted via'));assert(r.indexOf('was inserted via')<r.indexOf('catheter was secured'));
const exchange={...p,values:{...p.values,mode:'換管'}};assert(IR.standardSteps(exchange).some(x=>x.includes('existing biliary drainage catheter')));
const h=IR.blank(0,'HAIC');assert.equal(h.values.access,'axillary artery');assert(!IR.activeFields(h).some(f=>f.key==='hemostasis'));assert(!IR.commonFor(h).some(f=>f.key==='hemostasisConfirm'));
console.log(`${count} procedure defaults passed; editable defaults, workflow ordering, incomplete/aborted states and inapplicable-field suppression verified.`);
