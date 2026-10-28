const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
for(const file of ['engine','profiles','controls','picks','compact'])vm.runInThisContext(fs.readFileSync('dist/'+file+'.js','utf8'));
const s=IR.blank();s.subtype='傳統 TACE';s.items.drugs=[{name:'Lipiodol + doxorubicin mixture',amount:'5',unit:'mL',doxorubicinDose:'30'}];
let report=IR.generate(s);assert(report.includes('A mixture of Lipiodol (5 mL) and doxorubicin (30 mg) was used'));
s.items.drugs[0].doxorubicinDose='';assert(IR.validate(s).some(x=>x.includes('Doxorubicin 劑量')));assert(!IR.generate(s).includes('A mixture of'));
s.items.drugs[0].doxorubicinDose='30';s.items.drugs[0].unit='mg';assert(IR.validate(s).some(x=>x.includes('單位必須為 mL')));
s.items.drugs=[{name:'Lipiodol',amount:'2',unit:'mL'},{name:'Lipiodol + doxorubicin mixture',amount:'5',unit:'mL',doxorubicinDose:'30'}];report=IR.generate(s);assert(report.includes('Lipiodol (2 mL) was used'));assert(report.includes('Total Lipiodol used: 7 mL'));
const group=IR.activeGroups(s).find(g=>g.key==='drugs');const html=Compact.group(group,s);assert(html.includes('Doxorubicin 劑量'));assert(html.includes('f-items-drugs-1-doxorubicinDose'));assert(!html.includes('f-items-drugs-0-doxorubicinDose'));assert(Compact.value('angiographic catheter')==='Angiographic catheter');
console.log('Mixture validation, independent doses, totals, and catheter label passed.');
