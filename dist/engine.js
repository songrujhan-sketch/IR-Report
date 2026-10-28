/* Static field definitions and English phrase structure. No patient persistence. */
(function(root){
const f=(key,label,required=false,options=null,type='text',unit='')=>({key,label,required,options,type,unit});
const side=f('side','側別',true,['right','left','bilateral','midline','not applicable']);
const location=f('location','位置（英文）',true);
const size=f('size','大小（cm）',true,null,'dimension','cm');
const lesion={key:'lesions',title:'病灶 Lesions',fields:[side,location,size]};
const catheter={key:'catheters',title:'導管 Catheters',fields:[f('name','導管類別',true),f('shape','導管型式'),f('other','其他名稱／規格（選填）'),f('size','尺寸（Fr）',true,null,'number','Fr'),f('tip','末端位置（英文）',true)]};
const drugs={key:'drugs',title:'藥物／栓塞材料',fields:[f('name','名稱（英文）',true),f('amount','使用量',true,null,'number'),f('unit','單位',true,['mg','mL','g','µg','IU','vial','piece']),f('doxorubicinDose','Doxorubicin 劑量（mg）',false,null,'number','mg'),f('detail','規格／備註（英文）')]};
const modules=[
 {id:'angio',title:'Angio／TACE／栓塞',short:'Angio / TACE',types:['Angiography','傳統 TACE','DEB-TACE','手術前栓塞','緊急栓塞止血','HAIC','Y90 1st','Y90 2nd'],source:'ANGRAD、TAE1／TAE2、TACEB、TAEDCB、dcbead；新增栓塞句型待使用者核對',fields:[f('accessSide','穿刺側別',true,['right','left']),f('access','穿刺途徑',true,['common femoral artery','radial artery','brachial artery','distal radial artery (anatomical snuffbox)','axillary artery']),f('scope','血管攝影範圍（英文）',true),f('hemostasis','止血方式（英文）')],groups:[lesion,{key:'vessels',title:'供應／目標血管 Target vessels',fields:[f('name','血管名稱（英文）',true),f('finding','血管攝影所見（英文）',true)]},catheter,drugs]},
 {id:'tube',title:'置管引流／硬化治療',short:'置管引流',types:['PTCD','STENT','PCN','DJ','PCNL','PCD','Sclerotherapy'],source:'PTCD 系列、PCNL／PCNR、PCN 換管、PCNDJL／PCNDJR；Sclerotherapy 新增結構待使用者核對',fields:[f('mode','處置方式',true,['新置管','換管','Revision']),f('guidance','引導方式',true,['ultrasound and fluoroscopy','fluoroscopy','CT','ultrasound']),f('obstruction','阻塞位置（英文）'),f('revision','Revision 實際步驟（英文）')],groups:[{key:'tubes',title:'置管位置與器材',fields:[side,f('puncture','穿刺／既有途徑位置（英文）',true),f('name','導管／支架名稱',true),f('size','尺寸（Fr）',true,null,'number','Fr'),f('tip','末端位置（英文）',true),f('result','引流／處置結果（英文）',true)]}]},
 {id:'biopsy',title:'CT-guided biopsy',short:'CT biopsy',types:['Liver','Abdomen','Retroperitoneum','Pelvis','Kidney','Adrenal gland'],source:'ctg、ctgab／CTGAB；腹部共用結構待原文核對',fields:[f('position','體位',true,['supine','prone','right lateral decubitus','left lateral decubitus']),f('path','進針途徑（英文）',true),f('coaxial','Coaxial needle（G）',false,null,'number','G'),f('needle','Biopsy needle（G）',true,null,'number','G'),f('passes','採樣次數',true,null,'integer'),f('samples','檢體數量',true,null,'integer'),f('tests','送檢項目（英文）',true)],groups:[lesion]},
 {id:'drain',title:'CT-guided drainage',short:'CT drainage',types:['Liver','Abdominal abscess','Pancreatitis','Psoas muscle abscess','Iliacus muscle abscess'],source:'ctg、ctgab／CTGAB；各膿瘍句型待原文核對',fields:[f('position','體位',true,['supine','prone','right lateral decubitus','left lateral decubitus']),f('tests','檢體送驗（英文；未送驗請選下方）'),f('noSpecimen','檢體處理確認',true,['送驗','未送驗'])],groups:[{key:'collections',title:'積液與引流導管',fields:[side,location,f('path','進針途徑（英文）',true),f('size','導管尺寸（Fr）',true,null,'number','Fr'),f('tip','導管末端位置（英文）',true),f('fluid','引流液性質（英文）',true),f('volume','引流液量（mL）',true,null,'nonnegative','mL'),f('result','術後結果（英文）',true)]}]},
 {id:'ablation',title:'RFA／MW',short:'RFA / MW',types:['RFA','Microwave ablation'],source:'RFA、RFA1／RFA2／RFA2D、MW',fields:[f('anesthesia','麻醉方式',true,['local anesthesia and patient-controlled intravenous analgesia','intravenous sedation and local anesthesia','general anesthesia']),f('anesthesiaDetail','麻醉用藥及劑量（英文；含單位）'),f('guidance','引導方式',true,['CT','ultrasound','CT and ultrasound']),f('protection','保護措施（英文）'),f('protectionStatus','保護措施確認',true,['已使用','未使用'])],groups:[lesion,{key:'ablations',title:'消融位置與治療次數',fields:[f('target','對應病灶編號',true,null,'integer'),f('site','治療位置（英文）',true),f('device','針具／天線（含規格）',true),f('power','功率（W）',true,null,'number','W'),f('duration','時間（min）',true,null,'number','min'),f('cycles','次數',true,null,'integer')]}]}
];
const preparation=[f('consent','同意程序確認',false,['Informed consent was obtained']),f('sterile','無菌準備確認',false,['The skin was prepped and draped in the usual sterile fashion']),f('localAnesthesia','局部麻醉確認',false,['Local anesthesia was administered']),f('specimenFixation','檢體固定確認',false,['The tissue specimens were placed in formalin for fixation'])];
const common=[f('status','實際處置狀態',true,['completed','partially completed','aborted']),f('reason','未完成原因（英文）'),f('findings','Findings（英文）'),f('post','術後影像／處置結果（英文）',true),f('complication','立即併發症',true,['無立即併發症','有立即併發症','未確認']),f('complicationDetail','併發症詳情（英文）'),f('tolerance','耐受情形',false,['病人耐受良好','其他']),f('toleranceDetail','其他耐受情形（英文）'),f('hemostasisConfirm','止血結果',false,['完成止血','未完成止血','不適用']),f('recommendation','Recommendation（英文）')];
const sclerosis={key:'sclerosis',title:'硬化治療位置',fields:[side,location,f('path','進針／導管途徑（英文）',true),f('device','針具／導管（含 G 或 Fr）',true),f('aspirate','抽出液量（mL）',false,null,'nonnegative','mL'),f('agent','硬化劑名稱（英文）',true),f('concentration','濃度（含 % 或 mg/mL）',true),f('volume','每次注入量（mL）',true,null,'number','mL'),f('dwell','每次留置時間（min）',true,null,'number','min'),f('cycles','治療次數',true,null,'integer'),f('recovery','硬化劑回收處理',true,['aspirated after dwell','left in situ']),f('result','治療結果（英文）',true)]};
const radio={key:'radio',title:'核種投予位置與活度',fields:[f('target','投予血管',true),f('activity','實際投予活度',true,null,'number'),f('unit','活度單位',true,['mCi','GBq'])]};
const typeLabel=sub=>sub==='STENT'?'Biliary tract stent':sub;
const urinaryTypes=['PCN','PCNL','DJ'];
const biliaryTypes=['PTCD','STENT'];
const tubeConfig=s=>{
 const urinary=urinaryTypes.includes(s.subtype),biliary=biliaryTypes.includes(s.subtype),exchange=s.values.mode==='換管'||s.values.mode==='Revision';
 const isStent=s.subtype==='STENT',isDJ=s.subtype==='DJ';
 return {urinary,biliary,isStent,isDJ,
 names:isStent?['metallic biliary stent']:isDJ?['double-J ureteral stent']:biliary?['biliary drainage catheter','internal-external biliary drainage catheter']:urinary?['nephrostomy catheter','pigtail catheter']:['pigtail catheter','drainage catheter'],
 obstruction:biliary?['common bile duct','common hepatic duct','hepatic hilum']:urinary?['distal ureter','proximal ureter','ureteropelvic junction']:[],
 guidance:isStent?['fluoroscopy']:['ultrasound and fluoroscopy','fluoroscopy','ultrasound',...(!urinary&&!biliary?['CT']:[])],
 puncture:isStent?['existing biliary drainage catheter']:urinary?(exchange?['existing nephrostomy tract']:['lower pole renal calyx','upper pole renal calyx']):biliary?(exchange?['existing biliary drainage tract']:['right intrahepatic bile duct','left intrahepatic bile duct']):(exchange?['existing drainage tract']:['anterior abdominal wall','posterior abdominal wall']),
 tips:isDJ?['renal pelvis and urinary bladder']:isStent?['common bile duct','common hepatic duct','hepatic hilum']:urinary?['renal pelvis']:biliary?['duodenum','common bile duct','right intrahepatic bile duct','left intrahepatic bile duct']:['hepatic collection','pelvic collection','psoas collection'],
 sizes:isStent?['6','8','10']:isDJ?['4.7','5','6','7','8']:['6','8','8.5','10','12','14']};
};
const baseGroups=s=>s.module===0&&s.subtype==='Angiography'?[modules[0].groups[1],catheter]:s.module===0&&['HAIC','緊急栓塞止血'].includes(s.subtype)?[modules[0].groups[1],catheter,drugs]:s.module===0&&s.subtype.startsWith('Y90')?[modules[0].groups[1],catheter,radio]:s.module===1&&s.subtype==='Sclerotherapy'?[sclerosis]:modules[s.module].groups;
const activeGroups=s=>baseGroups(s).map(g=>{
 if(s.module===4&&g.key==='ablations')return {...g,fields:g.fields.filter(x=>x.key!=='cycles'&&!(s.subtype==='RFA'&&x.key==='power')).flatMap(x=>x.key==='target'?[x,f('pattern','消融模式',true,['single-position ablation','overlapping ablation of the same tumor'])]:x.key==='device'&&s.subtype==='RFA'?[x,f('rfaSetup','針數／Switching',true,['single electrode','two electrodes with switching','three electrodes with switching'])]:[{...x,...(x.key==='site'?{required:false}:{})}])};
 if((s.module===1&&s.subtype==='Sclerotherapy'&&['renal cyst','hepatic cyst'].includes(s.values.targetType))||(s.module===2&&['Kidney','Adrenal gland'].includes(s.subtype)))return {...g,fields:g.fields.map(x=>x.key==='side'?{...x,options:['right','left','bilateral']}:x)};
 if(s.module!==1||s.subtype==='Sclerotherapy')return g;
 const c=tubeConfig(s);
 return {...g,fields:g.fields.map(x=>x.key==='side'&&(c.urinary||c.biliary)?{...x,options:['right','left','bilateral']}:x.key==='size'&&c.isStent?{...x,label:'支架直徑（mm）',unit:'mm'}:x.key==='tip'&&c.isStent?{...x,label:'支架跨越位置（英文）'}:x.key==='tip'&&c.isDJ?{...x,label:'支架兩端位置（英文）'}:x).concat(c.isStent?[f('length','支架長度（mm）',false,null,'number','mm')]:[])};
});
const supportsHemostasis=s=>s.module===0&&s.subtype!=='HAIC';
const commonFor=s=>common.filter(x=>x.key!=='hemostasisConfirm'||supportsHemostasis(s));
const documentation='Images were obtained for documentation';
const standardSteps=s=>{
 const mode=s.values.mode,exchange=mode==='換管'||mode==='Revision';
 if(s.module===1){
  if(s.subtype==='PTCD')return [
   ...(exchange?['Cholangiography was performed through the existing biliary drainage catheter']:['The biliary system was examined under ultrasound guidance','Cholangiography was performed to evaluate the biliary tract']),
   ...(mode==='Revision'?[]:[exchange?'A guidewire was advanced through the existing catheter':'A guidewire was advanced into the biliary system']),
   'The catheter was secured and the wound was dressed',documentation];
  if(['PCN','PCNL'].includes(s.subtype))return [
   ...(exchange?['Contrast was injected through the existing nephrostomy catheter to opacify the collecting system']:['The renal collecting system was localized under ultrasound guidance','Contrast was injected to opacify the renal collecting system']),
   ...(mode==='Revision'?[]:[exchange?'A guidewire was advanced through the existing catheter':'A guidewire was advanced into the renal pelvis']),
   'The catheter was secured and the wound was dressed',documentation];
  if(s.subtype==='STENT')return ['Cholangiography was performed to evaluate the biliary obstruction',documentation];
  if(s.subtype==='DJ')return ['Contrast injection was performed to evaluate the ureter',documentation];
  if(s.subtype==='PCD')return ['The drainage catheter was secured and the wound was dressed',documentation];
  return [];
 }
 if(s.module===2)return ['CT was performed to determine the puncture level, angle, and depth',documentation];
 if(s.module===3)return ['CT was performed to determine the puncture level, angle, and depth','The drainage catheter was secured and the wound was dressed',documentation];
 if(s.module===0&&['傳統 TACE','DEB-TACE'].includes(s.subtype))return ['Superselective catheterization of the tumor-feeding artery was performed','Embolization was performed under fluoroscopic guidance',documentation];
 if(s.module===0&&s.subtype==='HAIC')return ['The catheter was secured and the wound was covered',documentation];
 if(s.module===4&&s.subtype==='RFA')return [documentation,'The radiofrequency electrode was positioned within the target lesion','Tract ablation was performed during device withdrawal'];
 return [documentation];
};
const defaultValues=s=>{
 const v={anesthesia:'local anesthesia',status:'completed',complication:'無立即併發症',tolerance:'病人耐受良好',post:'The procedure was performed as described above'};
 if(supportsHemostasis(s))Object.assign(v,{hemostasis:'manual compression',hemostasisConfirm:'完成止血'});
 if(s.module===1&&s.subtype!=='Sclerotherapy')Object.assign(v,{mode:'新置管',guidance:s.subtype==='STENT'?'fluoroscopy':s.subtype==='PCD'?'ultrasound':'ultrasound and fluoroscopy'});
 if(s.module===0&&s.subtype==='HAIC')Object.assign(v,{accessSide:'left',access:'axillary artery'});
 if(s.module===0&&['傳統 TACE','DEB-TACE'].includes(s.subtype))Object.assign(v,{accessSide:'right',access:'common femoral artery',hemostasis:'manual compression'});
 if(s.module===4)Object.assign(v,{guidance:'CT and ultrasound',anesthesia:'local anesthesia and patient-controlled intravenous analgesia',findings:'The target lesion was identified under image guidance'});
 if(s.module===0&&s.subtype==='Y90 2nd')v.hemostasis='an Angio-Seal closure device';
 v.procedureSteps=standardSteps({...s,values:{...s.values,...v}}).join('\n');
 return v;
};
const requiredGroups=s=>s.module===0?(['Angiography','HAIC'].includes(s.subtype)?['catheters']:s.subtype.startsWith('Y90')?['vessels','catheters','radio']:s.subtype==='DEB-TACE'?['lesions','vessels','catheters']:s.subtype==='傳統 TACE'?['lesions','vessels','catheters','drugs']:['vessels','catheters','drugs']):activeGroups(s).map(g=>g.key);
const defaultItem=(s,key)=>{
 if(key==='catheters')return {name:'angiographic catheter'};
 if(key==='tubes'){const c=tubeConfig(s);return {name:c.names[0],...(c.isStent?{puncture:'existing biliary drainage catheter'}:{}),...(c.tips.length===1?{tip:c.tips[0]}:{}),result:'The device was positioned as described above'};}
 if(key==='collections')return {result:'The drainage catheter was positioned as described above'};
 if(key==='ablations')return {target:'1',pattern:'single-position ablation',...(s.subtype==='RFA'?{rfaSetup:'single electrode',duration:'12'}:{})};
 if(key==='radio')return {unit:s.subtype==='Y90 1st'?'mCi':'GBq'};
 if(key==='lesions'&&!(s.module===2&&['Kidney','Adrenal gland'].includes(s.subtype)))return {side:'not applicable'};
 return {};
};
const seedItems=s=>Object.fromEntries(activeGroups(s).map(g=>[g.key,requiredGroups(s).includes(g.key)?[defaultItem(s,g.key)]:[]]));
const blank=(module=0,subtype)=>{const s={module,subtype:subtype||modules[module].types[0],values:{},items:{},recommend:false};s.values=defaultValues(s);s.items=seedItems(s);return s;};
const hasUserData=s=>{
 const base={...s,values:defaultValues({...s,values:{}})};base.items=seedItems(base);
 const norm=x=>Array.isArray(x)?x.map(norm):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==''&&x[k]!==undefined&&x[k]!==null).map(k=>[k,norm(x[k])])):x;
 const values={...s.values},defaults={...base.values};for(const v of [values,defaults])v.procedureSteps=String(v.procedureSteps||'').split('\n').filter(Boolean).sort().join('\n');
 return JSON.stringify(norm(values))!==JSON.stringify(norm(defaults))||JSON.stringify(norm(s.items))!==JSON.stringify(norm(base.items))||s.recommend||!!s.indication;
};
const NHI_SOURCE='https://www.nhi.gov.tw/ch/dl-87090-920b2eba56cc4340bff23d454f9819f7-1.pdf';
const nhiFields=[f('nhiProcedure','診療項目為 33075B 血管栓塞術',true,['符合','不符合','未確認']),f('nhiBclc','BCLC 分期',true,['B','A','C','D','0','未確認']),f('nhiAlbi','ALBI grade',true,['1','2','3','未確認']),f('nhiMax','最大腫瘤直徑（cm）',true,null,'number','cm'),f('nhiCount','腫瘤總顆數',true,null,'integer'),f('nhiImaging','已檢附 CT／MRI／血管攝影報告',true,['已檢附','未檢附','未確認']),f('nhiPrior','本次之前終身已給付次數',true,null,'nonnegative'),f('nhiVials','本次使用瓶數',true,null,'integer','vial'),f('nhiExclusive','未併用健保可吸收性栓塞微粒球',true,['確認未併用','有併用','未確認']),f('nhiSpecialist','執行者為放射診斷科專科醫師',true,['符合','不符合','未確認']),f('nhiTraining','具學會授權肝腫瘤載藥微球訓練及認證',true,['符合','不符合','未確認'])];
function nhiCheck(s){const v=s.values,missing=[],failed=[];if(s.subtype!=='DEB-TACE'||v.payment!=='健保')return {active:false,missing,failed,sum:null};for(const x of nhiFields){if(!String(v[x.key]??'').trim()||v[x.key]==='未確認')missing.push(x.label);}
 const validNum=(key,min,integer=false)=>{const n=Number(v[key]);return String(v[key]??'').trim()!==''&&Number.isFinite(n)&&n>=min&&(!integer||Number.isInteger(n));};
 const sum=validNum('nhiMax',0.000001)&&validNum('nhiCount',1,true)?Number((Number(v.nhiMax)+Number(v.nhiCount)).toFixed(6)):null;
 for(const [key,yes] of [['nhiProcedure','符合'],['nhiBclc','B'],['nhiExclusive','確認未併用'],['nhiSpecialist','符合'],['nhiTraining','符合'],['nhiImaging','已檢附']]){if(v[key]&&v[key]!=='未確認'&&v[key]!==yes)failed.push(nhiFields.find(f=>f.key===key).label);}
 if(v.nhiAlbi&&v.nhiAlbi!=='未確認'&&!['2','3'].includes(v.nhiAlbi))failed.push('ALBI grade 必須 ≥2');
 if(sum!==null&&sum<11)failed.push('最大腫瘤直徑（cm）＋總顆數必須 ≥11');
 if(String(v.nhiPrior??'').trim()&&(!validNum('nhiPrior',0,true)||Number(v.nhiPrior)>=3))failed.push('本次之前終身已給付次數需為 0、1 或 2');
 if(String(v.nhiVials??'').trim()&&Number(v.nhiVials)!==1)failed.push('每次限使用 1 瓶');
 return {active:true,missing,failed,sum};}
const activeFields=s=>{
 let a=[...modules[s.module].fields];
 if(s.module===4)a=a.filter(x=>x.key!=='protectionStatus');
 if(s.module===1&&s.subtype!=='Sclerotherapy'){const c=tubeConfig(s);a=a.filter(x=>x.key!=='obstruction'||c.urinary||c.biliary).map(x=>x.key==='guidance'?{...x,options:c.guidance}:x.key==='mode'&&c.isStent?{...x,options:['新置管']}:x);if(c.urinary)a.push(f('urinaryFinding','泌尿道所見（選填）',false,['staghorn stones']));}
 if(s.module===0&&s.subtype==='HAIC')a=a.filter(x=>x.key!=='hemostasis').map(x=>x.key==='access'?{...x,options:['common femoral artery','brachial artery','axillary artery']}:x);
 if(s.module===0&&s.subtype==='DEB-TACE')a.push(f('beadType','Bead 種類',true,['DC Bead','LifePearl','Tandem microspheres','HepaSphere']),f('beads','Beads 規格（µm）',true),f('loadingDrug','載藥名稱（英文）',true),f('loadingDose','載藥總量（mg）',true,null,'number','mg'),f('beadsVolume','使用 beads 體積（mL）',true,null,'number','mL'),f('payment','微球費用別',true,['健保','自費','其他']),...(s.values.payment==='健保'?nhiFields:[]));
 if(s.module===0&&['手術前栓塞','緊急栓塞止血'].includes(s.subtype))a.push(f('embolizationSite','栓塞病灶／出血位置（英文）',true),f('embolizationFinding','主要血管攝影所見',true,['tumor blush','active contrast extravasation','pseudoaneurysm','abnormal vascularity','no active contrast extravasation']),f('embolizationResult','栓塞後造影結果',true,['reduced tumor vascularity','no residual contrast extravasation','persistent contrast extravasation','complete occlusion of the target vessel','partial occlusion of the target vessel','no angiographic change']));
 if(s.module===1&&s.subtype==='Sclerotherapy')a=[f('guidance','引導方式',true,['ultrasound and fluoroscopy','fluoroscopy','CT','ultrasound']),f('targetType','治療標的',true,['renal cyst','hepatic cyst','lymphocele','other']),f('accessMode','處置途徑',true,['existing catheter','new puncture']),f('communication','與鄰近管道相通之評估',true,['no communication identified','communication identified','not assessed']),f('catheterEnd','治療後導管處理',true,['removed','left in place','not applicable'])];
 if(s.module===0&&s.subtype==='HAIC')a.push(f('haicStage','HAIC 次別',true,['1st','2nd']),f('infusionTip','HAIC 留置末端',true),f('stability','呼吸時導管位置',true,['stable','dislodgement observed','not assessed']));
 if(s.module!==4)a.push(f('anesthesia','麻醉方式',false,['local anesthesia','general anesthesia','intravenous sedation']));
 if(s.module===4)a.push(f('fusion','Sono fusion（可加選）',false,['Sono fusion']));
 return a;
};
const clean=x=>String(x??'').trim();
const phrase=x=>clean(x).replace(/\n+/g,', ').replace(/[.。\s]+$/,'');
const sentence=x=>phrase(x)?phrase(x)+'.':'';
const sideText=x=>x==='not applicable'?'':x;
const article=x=>/^(8|11(?!\d)|18(?!\d))/.test(clean(x))?'an':'a';
const the=x=>{const p=phrase(x);return !p||/^(the|a|an)\s/i.test(p)?p:'the '+p;};
const cap=x=>x.charAt(0).toUpperCase()+x.slice(1);
const loc=r=>[sideText(r.side),clean(r.location)].filter(Boolean).join(' ')+(clean(r.locationFeatures)?', '+clean(r.locationFeatures).split('\n').filter(Boolean).join(', '):'');
function validate(s){
 const errors=[],v=s.values,m=modules[s.module];
 const check=(field,val,prefix='')=>{let x=clean(val);if(field.required&&!x)errors.push(prefix+field.label+'：必填');if(x&&['number','integer','nonnegative'].includes(field.type)&&(!Number.isFinite(Number(x))||(field.type==='nonnegative'?Number(x)<0:Number(x)<=0)||(field.type==='integer'&&!Number.isInteger(Number(x)))))errors.push(prefix+field.label+'：請輸入有效'+(field.type==='integer'?'正整數':'數值'));if(x&&field.type==='dimension'&&(!/^\d+(?:\.\d+)?(?:\s*[x×]\s*\d+(?:\.\d+)?){0,2}$/i.test(x)||x.split(/[x×]/i).some(n=>Number(n)<=0)))errors.push(prefix+field.label+'：請輸入正數尺寸，例如 2.5 或 2.5 × 3');if(x&&field.options&&!field.options.includes(x))errors.push(prefix+field.label+'：選項無效');};
 activeFields(s).forEach(x=>{if(x.key==='revision'&&v.mode==='Revision')x={...x,required:true};if(v.status==='aborted'||x.key.startsWith('nhi'))x={...x,required:false};check(x,v[x.key]);});
 commonFor(s).forEach(x=>{if(x.key==='post'&&v.status==='aborted')x={...x,required:false};check(x,v[x.key]);});
 if(v.status&&v.status!=='completed'&&!clean(v.reason))errors.push('未完成處置請填寫原因');
 if(['有立即併發症','未確認'].includes(v.complication)&&!clean(v.complicationDetail)&&!(v.complication==='有立即併發症'&&clean(v.complicationTypes)))errors.push(v.complication==='未確認'?'請填寫併發症未確認原因／補充說明':'請填寫併發症詳情或選擇併發症類型');
 if(v.complication==='無立即併發症'&&(clean(v.complicationDetail)||clean(v.complicationTypes)||clean(v.complicationManagement)))errors.push('併發症確認與詳情互斥，請清除詳情或更改選項');
 const posts=clean(v.post).split('\n').filter(Boolean);const conflicts=[['No residual tumor staining was demonstrated','Residual tumor staining persisted'],['No residual contrast extravasation was identified','Persistent contrast extravasation was identified'],['No active contrast extravasation was identified','Persistent contrast extravasation was identified']];if(conflicts.some(pair=>pair.every(x=>posts.includes(x))))errors.push('術後結果包含相互矛盾的選項，請重新確認');
 if(v.tolerance==='其他'&&!clean(v.toleranceDetail))errors.push('請填寫其他耐受情形');
 if(v.tolerance!=='其他'&&clean(v.toleranceDetail))errors.push('耐受情形詳情與所選狀態不一致');
 if(v.hemostasisConfirm==='完成止血'&&supportsHemostasis(s)&&!clean(v.hemostasis))errors.push('請填寫止血方式');
 if(s.module===3&&v.noSpecimen==='送驗'&&!clean(v.tests))errors.push('請填寫檢體送驗項目');
 if(s.module===3&&v.noSpecimen==='未送驗'&&clean(v.tests))errors.push('檢體未送驗與送驗項目互斥');
 if(s.recommend&&!clean(v.recommendation))errors.push('已啟用 Recommendation，請填寫內容');
 if(s.module===0&&s.subtype.startsWith('Y90'))(s.items.radio||[]).forEach((r,i)=>{if(r.unit!==(s.subtype==='Y90 1st'?'mCi':'GBq'))errors.push('核種 #'+(i+1)+'：'+s.subtype+' 活度單位應為 '+(s.subtype==='Y90 1st'?'mCi':'GBq'));});
 if(s.module===4&&v.guidance==='CT'&&v.fusion)errors.push('純 CT 引導不能選擇 Sono fusion');
 if(s.module===1&&s.subtype==='STENT'&&v.mode!=='新置管')errors.push('金屬膽道支架僅提供新置入，不可選擇換管或 Revision');
 const nc=nhiCheck(s);if(nc.active&&v.status!=='aborted'){nc.missing.forEach(x=>errors.push('健保核對未完成：'+x));nc.failed.forEach(x=>errors.push('健保條件不符：'+x));}
 const required=requiredGroups(s);
 activeGroups(s).forEach(g=>{const rows=s.items[g.key]||[];if(v.status!=='aborted'&&required.includes(g.key)&&!rows.length)errors.push(g.title+'：請至少新增一項');rows.forEach((r,i)=>g.fields.forEach(field=>check(v.status==='aborted'||(g.key==='ablations'&&r.pattern==='overlapping ablation of the same tumor'&&field.key==='cycles')?{...field,required:false}:field,r[field.key],g.title+' #'+(i+1)+' · ')));});
 (s.items.ablations||[]).forEach((r,i)=>{if(Number(r.target)>(s.items.lesions||[]).length)errors.push('消融 #'+(i+1)+'：病灶編號不存在');});
 if(s.module===4&&v.status!=='aborted')(s.items.ablations||[]).forEach((r,i)=>{if(r.pattern==='overlapping ablation of the same tumor'&&!clean(r.site))errors.push('消融 #'+(i+1)+'：Overlapping ablation 請填治療位置');if(r.pattern==='overlapping ablation of the same tumor'&&(s.items.ablations||[]).filter(x=>x.pattern===r.pattern&&x.target===r.target).length<2)errors.push('病灶 '+r.target+' 的 Overlap 請至少記錄兩個治療位置');});
 // Structured laterality is authoritative; detect common contradictory words in location fields.
 Object.values(s.items).flat().forEach(r=>{if(r.side==='right'&&/\bleft\b/i.test(r.location||r.puncture||''))errors.push('側別與位置中的 left 不一致');if(r.side==='left'&&/\bright\b/i.test(r.location||r.puncture||''))errors.push('側別與位置中的 right 不一致');if(r.side==='right'&&/\bleft\b/i.test(r.tip||''))errors.push('側別與導管末端中的 left 不一致');if(r.side==='left'&&/\bright\b/i.test(r.tip||''))errors.push('側別與導管末端中的 right 不一致');});
 (s.items.catheters||[]).forEach(r=>{if(r.name==='angiographic catheter'&&r.size&&![4,5,6].includes(Number(r.size)))errors.push('Angiographic catheter 尺寸應為 4–6 Fr');if(r.name==='microcatheter'&&r.size&&Number(r.size)>=4)errors.push('Microcatheter 尺寸與所選類別不符');});
 if(s.module===0&&s.values.status!=='aborted')(s.items.drugs||[]).forEach((r,i)=>{if(r.name==='Lipiodol + doxorubicin mixture'){if(!clean(r.doxorubicinDose))errors.push('藥物／栓塞材料 #'+(i+1)+' · Doxorubicin 劑量（mg）：必填');if(r.unit&&r.unit!=='mL')errors.push('藥物／栓塞材料 #'+(i+1)+' · 混合物的 Lipiodol 用量單位必須為 mL');}});
 const all=[s.indication,...Object.values(v),...Object.values(s.items).flat().flatMap(Object.values)].filter(x=>typeof x==='string');
 if(all.some(x=>/\[[^\]]*\]|\{[^}]*\}|<[^>]*>|_{2,}|\b(?:TBD|TODO|XXX)\b|待填|待確認|請填/i.test(x)))errors.push('仍有空白占位符或待確認文字');
 return [...new Set(errors)];
}
function generate(s){
const v=s.values,m=modules[s.module],sections=[],tech=[],find=[],post=[],imp=[];
const add=(a,x)=>{if(clean(x))a.push(sentence(x));};
const title=s.module===0?({'傳統 TACE':'Conventional transarterial chemoembolization','DEB-TACE':'Drug-eluting bead transarterial chemoembolization','Angiography':'Angiography','手術前栓塞':'Preoperative embolization','緊急栓塞止血':'Emergency embolization for hemorrhage control','HAIC':'Hepatic arterial infusion catheter placement ('+(v.haicStage||'unspecified session')+')','Y90 1st':'Tc-99m MAA mapping prior to Y-90 radioembolization','Y90 2nd':'Y-90 radioembolization'}[s.subtype]):s.module===1?(s.subtype==='Sclerotherapy'?'Percutaneous sclerotherapy':typeLabel(s.subtype)+({'新置管':' placement','換管':' exchange','Revision':' revision'}[v.mode]||'')):s.module===2?'CT-guided '+({Liver:'liver',Abdomen:'abdominal',Retroperitoneum:'retroperitoneal',Pelvis:'pelvic',Kidney:'renal','Adrenal gland':'adrenal'}[s.subtype]||s.subtype.toLowerCase())+' biopsy':s.module===3?'CT-guided drainage of '+({Liver:'a hepatic collection','Abdominal abscess':'an abdominal abscess',Pancreatitis:'a peripancreatic collection','Psoas muscle abscess':'a psoas muscle abscess','Iliacus muscle abscess':'an iliacus muscle abscess'}[s.subtype]||s.subtype.toLowerCase()):s.subtype;
const selectedSteps=clean(v.procedureSteps).split('\n').filter(Boolean),isPreparationStep=x=>/^(CT was performed to determine|Cholangiography|Contrast (was injected|injection was performed)|The (biliary system was examined|renal collecting system was localized)|A guidewire was advanced)/.test(x);
const outcome=v.status==='completed'?'completed':v.status==='partially completed'?'partially completed':v.status==='aborted'?'aborted':'';
if(clean(s.indication))sections.push('Clinical information: '+sentence(s.indication));
if(v.status==='aborted'){
 add(tech,title+' was aborted'+(v.reason?' because '+phrase(v.reason):''));
 // Actual performed steps belong in findings; never invent insertion/biopsy/ablation after abortion.
}else{
 add(tech,'Informed consent was obtained');
 add(tech,'The skin was prepped and draped in the usual sterile fashion');
 if(s.module!==4&&v.anesthesia)add(tech,'The procedure was performed under '+v.anesthesia);
 if([2,3].includes(s.module)&&v.position)add(tech,'The patient was placed in the '+v.position+' position');
 selectedSteps.filter(isPreparationStep).forEach(x=>add(tech,x));
 if(s.module===0){
  if(v.access&&v.accessSide)add(tech,'Vascular access was obtained via the '+v.accessSide+' '+v.access);
  if(v.scope)add(tech,'Angiography of '+the(v.scope)+' was performed');
  (s.items.catheters||[]).forEach(r=>{if(r.name&&r.size&&r.tip)add(tech,cap(article(r.size))+' '+r.size+' Fr '+[r.shape,r.name,r.other].filter(Boolean).join(' ')+' was positioned in '+the(r.tip));});
  (s.items.vessels||[]).forEach(r=>{if(r.name&&r.finding)add(find,r.name+': '+phrase(r.finding));});
  (s.items.drugs||[]).forEach(r=>{if(r.name==='Lipiodol + doxorubicin mixture'){if(r.amount&&r.unit==='mL'&&r.doxorubicinDose)add(tech,'A mixture of Lipiodol ('+r.amount+' mL) and doxorubicin ('+r.doxorubicinDose+' mg) was used'+(r.detail?'; '+phrase(r.detail):''));}else if(r.name&&r.amount&&r.unit)add(tech,r.name+' ('+r.amount+' '+r.unit+') was used'+(r.detail?'; '+phrase(r.detail):''));});
  const totals=new Map();const addTotal=(name,amount,unit)=>{if(name&&Number(amount)>0&&unit){const key=clean(name).toLowerCase()+'|'+unit;const t=totals.get(key)||{name,unit,n:0,sum:0};t.n++;t.sum+=Number(amount);totals.set(key,t);}};(s.items.drugs||[]).forEach(r=>{if(r.name==='Lipiodol + doxorubicin mixture'){if(r.unit==='mL')addTotal('Lipiodol',r.amount,'mL');addTotal('doxorubicin',r.doxorubicinDose,'mg');}else addTotal(r.name,r.amount,r.unit);});totals.forEach(t=>{if(t.n>1)add(tech,'Total '+t.name+' used: '+Number(t.sum.toFixed(4))+' '+t.unit);});
  if(s.subtype==='HAIC'){
   if(v.infusionTip)add(tech,'The infusion catheter tip was placed in '+the(v.infusionTip));
   if(v.stability==='stable')add(post,'The catheter tip remained stable during inspiration and expiration under fluoroscopy');
   if(v.stability==='dislodgement observed')add(post,'Catheter dislodgement was observed during respiration');
  }
  if(s.subtype.startsWith('Y90'))(s.items.radio||[]).forEach(r=>{if(r.target&&r.activity&&r.unit)add(tech,r.activity+' '+r.unit+' of '+(s.subtype==='Y90 1st'?'Tc-99m MAA':'Y-90')+' was administered via '+the(r.target));});
  if(s.subtype==='DEB-TACE'&&v.beadType&&v.beads&&v.loadingDrug&&v.loadingDose&&v.beadsVolume)add(tech,v.beadsVolume+' mL of '+v.beads+' µm '+v.beadType+' beads loaded with '+v.loadingDrug+' (total loading dose: '+v.loadingDose+' mg) was used');
  if(['手術前栓塞','緊急栓塞止血'].includes(s.subtype)){if(v.embolizationSite&&v.embolizationFinding)add(find,cap(v.embolizationFinding)+' at '+the(v.embolizationSite));if(v.embolizationResult)add(post,'Post-embolization angiography showed '+phrase(v.embolizationResult));}
 }else if(s.module===1){
  if(s.subtype==='Sclerotherapy'){
   if(v.targetType)add(tech,'Percutaneous sclerotherapy was performed for '+(v.targetType==='other'?'the target lesion':'a '+v.targetType)+(v.guidance?' under '+v.guidance+' guidance':''));
   if(v.accessMode)add(tech,'Access was obtained via '+(v.accessMode==='existing catheter'?'an existing catheter':'a new puncture'));
   (s.items.sclerosis||[]).forEach((r,i)=>{if(r.side&&r.location)add(find,'Target '+(i+1)+': '+loc(r));if(r.path&&r.device)add(tech,'Target '+(i+1)+' was accessed via '+phrase(r.path)+' using '+phrase(r.device));if(clean(r.aspirate))add(tech,r.aspirate+' mL of fluid was aspirated from target '+(i+1));if(r.agent&&r.concentration&&r.volume&&r.dwell&&r.cycles)add(tech,'Target '+(i+1)+': '+r.volume+' mL of '+r.agent+' ('+r.concentration+') was instilled per cycle, with a dwell time of '+r.dwell+' min per cycle, for '+r.cycles+' cycle(s)');if(r.recovery)add(tech,'The sclerosant for target '+(i+1)+' was '+r.recovery);if(r.result)add(post,'Target '+(i+1)+': '+phrase(r.result));});
   if(v.communication&&v.communication!=='not assessed')add(find,'Communication assessment: '+v.communication);
   if(v.catheterEnd&&v.catheterEnd!=='not applicable')add(post,'The catheter was '+v.catheterEnd);
   const rows=s.items.sclerosis||[];const totals=new Map();rows.forEach(r=>{if(r.agent&&r.concentration&&Number(r.volume)>0&&Number(r.cycles)>0){const key=clean(r.agent).toLowerCase()+'|'+r.concentration;const t=totals.get(key)||{agent:r.agent,concentration:r.concentration,volume:0};t.volume+=Number(r.volume)*Number(r.cycles);totals.set(key,t);}});totals.forEach(t=>add(tech,'Total '+t.agent+' ('+t.concentration+') instilled: '+Number(t.volume.toFixed(4))+' mL'));
  }else{
  const guide=v.guidance?'Under '+v.guidance+' guidance, ':'';
  (s.items.tubes||[]).forEach(r=>{if(!(r.side&&r.puncture&&r.name&&r.size&&r.tip))return;const c=tubeConfig(s),desc=[sideText(r.side),r.size+(c.isStent?' mm':' Fr'),r.name,c.isStent&&r.length?'(length: '+r.length+' mm)':''].filter(Boolean).join(' '),device=c.isStent||c.isDJ?'stent':'catheter',position=c.isStent?' across '+the(r.tip):c.isDJ?' with its proximal and distal ends in '+the(r.tip):' with its tip in '+the(r.tip);if(v.mode==='新置管')add(tech,cap(guide+article(desc)+' '+desc+' was inserted via '+the(r.puncture)+position));if(v.mode==='換管')add(tech,cap(guide+'the existing '+device+' was exchanged via '+the(r.puncture)+' for '+article(desc)+' '+desc+position));if(v.mode==='Revision'&&v.revision)add(tech,cap(guide+'revision of the '+desc+' via '+the(r.puncture)+' was performed: '+phrase(v.revision)+'; final tip position: '+phrase(r.tip)));if(r.result&&r.result!=='The device was positioned as described above')add(post,r.result);});
  if(v.obstruction)add(find,'Obstruction at '+phrase(v.obstruction));
  if(v.urinaryFinding==='staghorn stones')add(find,'Staghorn stones were identified');
  }
 }else if(s.module===2){
  if(v.path&&v.needle)add(tech,'Under CT guidance, '+(['8','11','18'].includes(String(v.needle))?'an ':'a ')+v.needle+' G biopsy needle'+(v.coaxial?' through a '+v.coaxial+' G coaxial needle':'')+' was advanced via '+phrase(v.path));
  if(v.passes&&v.samples)add(tech,v.passes+' sampling pass(es) yielded '+v.samples+' specimen(s)'+(v.tests?', submitted for '+phrase(v.tests):''));
  if(v.specimenFixation)add(tech,v.specimenFixation);
 }else if(s.module===3){
  (s.items.collections||[]).forEach((r,i)=>{if(r.location&&r.side)add(find,'Collection '+(i+1)+': '+loc(r));if(r.size&&r.path&&r.tip)add(tech,'Under CT guidance, '+article(r.size)+' '+r.size+' Fr drainage catheter was inserted into collection '+(i+1)+' via '+phrase(r.path)+' with its tip in '+the(r.tip));if(r.volume&&r.fluid)add(tech,r.volume+' mL of '+r.fluid+' fluid was drained from collection '+(i+1));if(r.result&&r.result!=='The drainage catheter was positioned as described above')add(post,'Collection '+(i+1)+': '+phrase(r.result));});
  if(v.noSpecimen==='送驗'&&v.tests)add(tech,'Fluid specimens were submitted for '+phrase(v.tests));
  if(v.noSpecimen==='未送驗')add(tech,'No specimen was submitted for testing');
  const vols=(s.items.collections||[]).map(r=>r.volume);if(vols.length>1&&vols.every(x=>clean(x)!==''&&Number.isFinite(Number(x))))add(tech,'Total drained volume: '+Number(vols.reduce((a,x)=>a+Number(x),0).toFixed(4))+' mL');
 }else if(s.module===4){
  if(v.anesthesia)add(tech,'The procedure was performed under '+v.anesthesia+(v.anesthesiaDetail?' ('+phrase(v.anesthesiaDetail)+')':''));
  (s.items.ablations||[]).forEach((r,i)=>{const overlap=r.pattern==='overlapping ablation of the same tumor',ready=r.target&&r.device&&r.duration&&(!overlap||r.site)&&(s.subtype==='RFA'?r.rfaSetup:r.power);if(ready)add(tech,(overlap?'Overlapping treatment ':'Treatment ')+(i+1)+' for lesion '+r.target+(overlap?' at '+phrase(r.site):'')+': '+r.device+(s.subtype==='RFA'?' using '+r.rfaSetup:', '+r.power+' W')+', '+r.duration+' min'+(v.guidance?', under '+v.guidance+' guidance':'')+(v.fusion==='Sono fusion'?' with ultrasound fusion imaging':''));});
  clean(v.protection).split('\n').filter(Boolean).forEach(x=>add(tech,x));
  const a=s.items.ablations||[];if(a.length>1&&a.every(r=>Number(r.duration)>0))add(tech,'Total ablation time: '+Number(a.reduce((n,r)=>n+Number(r.duration),0).toFixed(4))+' min');
 }
 (s.items.lesions||[]).forEach((r,i)=>{if(r.location&&r.side&&r.size)add(find,'Lesion '+(i+1)+': '+loc(r)+', measuring '+r.size+' cm');});
}
if(v.status!=='aborted')selectedSteps.filter(x=>!isPreparationStep(x)).forEach(x=>add(tech,x));
clean(v.findings).split('\n').filter(x=>x&&!(v.status==='aborted'&&x==='The target lesion was identified under image guidance')).forEach(x=>add(find,x));clean(v.post).split('\n').filter(x=>x&&x!=='The procedure was performed as described above').forEach(x=>add(post,x));
if(v.status!=='aborted'&&supportsHemostasis(s)&&v.hemostasisConfirm==='完成止血')add(post,'Hemostasis was achieved'+(v.hemostasis?' by '+phrase(v.hemostasis):''));
if(supportsHemostasis(s)&&v.hemostasisConfirm==='未完成止血')add(post,s.module===0?'The vascular sheath was left in place for return to the ward':'Hemostasis was not achieved');
if(v.complication==='未確認'&&v.complicationDetail)add(post,'Immediate complication assessment: '+phrase(v.complicationDetail));
if(v.status!=='aborted'&&v.complication==='無立即併發症')add(post,'No immediate complication was identified');
if(v.complication==='有立即併發症'){const details=[...clean(v.complicationTypes).split('\n').filter(Boolean),...clean(v.complicationDetail).split('\n').filter(Boolean)];details.forEach(x=>add(post,'Immediate complication: '+x));clean(v.complicationManagement).split('\n').filter(Boolean).forEach(x=>add(post,x));if(clean(v.complicationManagementDetail))add(post,'Management: '+v.complicationManagementDetail);}
if(v.status!=='aborted'&&v.tolerance==='病人耐受良好')add(post,'The patient tolerated the procedure well');
if(v.tolerance==='其他'&&v.toleranceDetail)add(post,v.toleranceDetail);
if(outcome)add(imp,title+' '+outcome+(v.status!=='completed'&&v.reason?'; '+phrase(v.reason):''));
clean(v.post).split('\n').filter(x=>x&&x!=='The procedure was performed as described above').forEach(x=>add(imp,x));
if(v.status!=='aborted'&&v.embolizationResult&&['手術前栓塞','緊急栓塞止血'].includes(s.subtype))add(imp,'Post-embolization angiography: '+phrase(v.embolizationResult));
if(v.complication==='有立即併發症')[...clean(v.complicationTypes).split('\n').filter(Boolean),...clean(v.complicationDetail).split('\n').filter(Boolean)].forEach(x=>add(imp,'Immediate complication: '+x));
if(tech.length)sections.push('Procedure / Technique:\n'+tech.join('\n'));
if(find.length)sections.push('Findings:\n'+find.join('\n'));
if(post.length)sections.push('Post-procedural findings:\n'+post.join('\n'));
if(imp.length)sections.push('Impression:\n'+imp.map((x,i)=>(i+1)+'. '+x).join('\n'));
const recommendations=s.recommend?clean(v.recommendation).split('\n').filter(Boolean):[];
if(supportsHemostasis(s)&&v.hemostasisConfirm==='未完成止血')recommendations.push('Monitor the sheath insertion site for infection and hematoma','Remove the vascular sheath within 3 days');
if(recommendations.length)sections.push('Recommendation:\n'+[...new Set(recommendations)].map(sentence).join('\n'));
return sections.join('\n\n');
}
root.IR={modules,common,commonFor,supportsHemostasis,standardSteps,defaultValues,defaultItem,requiredGroups,hasUserData,preparation,typeLabel,tubeConfig,blank,activeFields,activeGroups,nhiFields,nhiCheck,NHI_SOURCE,validate,generate};
if(typeof module!=='undefined')module.exports=root.IR;
})(typeof window!=='undefined'?window:globalThis);
