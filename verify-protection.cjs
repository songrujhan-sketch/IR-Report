const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
for(const file of ['engine','profiles','controls','picks','compact'])vm.runInThisContext(fs.readFileSync('dist/'+file+'.js','utf8'));
for(const subtype of IR.modules[4].types){const s=IR.blank(4,subtype);assert(!IR.activeFields(s).some(f=>f.key==='protectionStatus'));assert(!IR.validate(s).some(x=>x.includes('保護')));assert(!IR.generate(s).includes('Hydrodissection was performed'));
s.values.protection='Hydrodissection was performed';assert(IR.generate(s).includes('Hydrodissection was performed.'));assert(!IR.validate(s).some(x=>x.includes('保護')));
s.values.protection+='\nArtificial ascites was created';let report=IR.generate(s);assert(report.includes('Hydrodissection was performed.'));assert(report.includes('Artificial ascites was created.'));
s.values.protection='';assert(!IR.generate(s).includes('Hydrodissection was performed'));
const html=Compact.field(IR.activeFields(s).find(f=>f.key==='protection'),'','values.protection',s);assert(html.includes('data-multi="1"'));assert(!html.includes('<select'));
s.values.protection='Hydrodissection was performed';s.values.status='aborted';s.values.reason='No safe route';assert(!IR.generate(s).includes('Hydrodissection was performed'));}
console.log('RFA/MW protection verified: direct multi-select, immediate output, deselection, no extra status and aborted suppression.');
