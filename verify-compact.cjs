const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
for(const file of ['engine','profiles','controls','picks','compact'])vm.runInThisContext(fs.readFileSync('dist/'+file+'.js','utf8'));
let count=0;
for(let m=0;m<5;m++)for(const sub of IR.modules[m].types){
 const s=IR.blank(m,sub);assert.equal(s.values.status,'completed');assert.equal(s.values.complication,'無立即併發症');assert.equal(s.values.tolerance,'病人耐受良好');assert(!IR.hasUserData(s));assert(IR.validate(s).length);
 for(const g of IR.requiredGroups(s))assert(s.items[g].length,sub+': missing initial row '+g);
 if(IR.supportsHemostasis(s)){assert.equal(s.values.hemostasisConfirm,'完成止血');assert(IR.generate(s).includes('Hemostasis was achieved'));}else assert(!IR.generate(s).includes('Hemostasis'));
 assert(IR.generate(s).includes('No immediate complication'));assert(IR.generate(s).includes('tolerated the procedure well'));
 s.values.complication='有立即併發症';assert(IR.validate(s).some(x=>x.includes('請填寫併發症詳情')));s.values.complicationDetail='A small hematoma was noted';assert(!IR.generate(s).includes('No immediate complication'));assert(IR.generate(s).includes('A small hematoma'));
 s.values.status='aborted';s.values.reason='No safe route';const r=IR.generate(s);assert(!r.includes('tolerated the procedure well'));assert(!r.includes('Hemostasis was achieved'));
 count++;
}
const p=IR.blank(1,'PTCD');Object.assign(p.items.tubes[0],{side:'left',puncture:'left intrahepatic bile duct',size:'10',tip:'duodenum'});assert.deepEqual(IR.validate(p),[]);assert(IR.hasUserData(p));p.items.tubes[0].size='';assert(IR.validate(p).some(x=>x.includes('尺寸')));
const t=IR.blank(0,'傳統 TACE');assert.equal(t.values.accessSide,'right');assert.equal(t.values.access,'common femoral artery');assert.equal(t.values.hemostasis,'manual compression');t.items.catheters.push({name:'microcatheter',size:'1.98',tip:'right hepatic artery'});assert(IR.generate(t).includes('1.98 Fr microcatheter'));assert(IR.validate(t).length);
console.log(`${count} compact defaults verified: automatic rows, normal outcomes, exception text, aborted output, PTCD four-parameter completion and retained case-specific validation.`);
