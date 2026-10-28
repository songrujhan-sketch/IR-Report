/* Reusable IR wording adapted from the supplied phrase library; no historical case data. */
const IRPicks={
 sources:[['HAIC','HAIC, HAIC1, HAIC2, haic2'],['Y90 1st / 2nd','Y901（Tc-MAA mapping）, Y902（radioembolization）'],['Angio / TACE','ANGRAD, TAE1, TAE2, TACEB, TAEDCB1, TAEDCB2, TAEK'],['置管／換管','PCNL, PCNR, CPCNL, CPCNR, PCNRL, PCNRR, PTCD, PTCDCH, PTCDR, PTGBD, PCNDJL, PCNDJR'],['CT biopsy','ctg, CTG, CTGL'],['CT drainage','ctgab, CTGAB, PCD, PCDR'],['RFA','RFA, RFA1, RFA2, RFA2D']],
 get(f,path,s){
 const profile=IRProfile.get(s);
 if(s.module===0&&s.subtype==='HAIC'&&f.key==='hemostasis')return ['manual compression','a Perclose ProGlide closure device','an Angio-Seal closure device','a StarClose closure device'];
 if(s.module===0&&f.key==='finding')return s.subtype==='緊急栓塞止血'?['active contrast extravasation','no active contrast extravasation','pseudoaneurysm','retrograde collateral filling']:s.subtype.startsWith('Y90')?['tumor staining','extrahepatic shunting','no extrahepatic shunting identified']:s.subtype==='Angiography'?['patent vessel','focal stenosis','complete occlusion','active contrast extravasation','no active contrast extravasation']:['tumor staining','residual tumor staining','extrahepatic collateral tumor supply'];
 if(s.module===1&&s.subtype!=='Sclerotherapy'){
  const c=IR.tubeConfig(s);
  if(f.key==='name'&&path.startsWith('items.tubes.'))return c.names;
  if(f.key==='size'&&path.startsWith('items.tubes.'))return c.sizes;
  if(f.key==='length')return ['40','60','80','100'];
  if(f.key==='obstruction')return c.obstruction;
  if(['tip','puncture'].includes(f.key)){const row=s.items.tubes?.[Number(path.split('.')[2])]||{},other=row.side==='left'?'right':row.side==='right'?'left':null;return (f.key==='tip'?c.tips:c.puncture).filter(x=>!other||!new RegExp('\\b'+other+'\\b').test(x));}
  if(f.key==='result')return c.isStent?['Contrast passed freely through the biliary stent into the duodenum','The biliary stent was in the intended position','Residual biliary obstruction was demonstrated']:c.isDJ?['The proximal and distal ends of the ureteral stent were in the renal pelvis and urinary bladder','Contrast passed into the urinary bladder']:c.urinary?['Clear urine drained freely','Pink urine was noted after catheter exchange','The nephrostomy catheter drained freely']:c.biliary?['Bile drained freely','Contrast passed into the duodenum','Persistent biliary obstruction was demonstrated']:['Purulent fluid was drained','The collection decreased in size','The catheter drained freely'];
 }
 if(s.module===1&&s.subtype==='Sclerotherapy'){
  if(f.key==='location')return s.values.targetType==='renal cyst'?['renal upper pole cyst','renal lower pole cyst','renal interpolar cyst']:s.values.targetType==='hepatic cyst'?['right hepatic cyst','left hepatic cyst']:s.values.targetType==='lymphocele'?['pelvic lymphocele','retroperitoneal lymphocele']:['target cavity'];
  if(f.key==='result')return ['The target cavity collapsed','A residual cavity remained'];
 }
 if(s.module===3){
  if(f.key==='tip')return ({Liver:['hepatic collection'],'Abdominal abscess':['abdominal collection','pelvic collection','subphrenic collection'],Pancreatitis:['peripancreatic collection','lesser sac collection','retroperitoneal collection'],'Psoas muscle abscess':['psoas collection'],'Iliacus muscle abscess':['iliacus collection']})[s.subtype];
  if(f.key==='result')return ['The catheter tip was within the target collection','The collection decreased in size','A residual collection remained'];
 }
 if(s.module===4&&f.key==='location')return Array.from({length:8},(_,i)=>'hepatic segment '+(i+1));
 if(path.startsWith('items.drugs.')&&f.key==='name')return s.subtype==='傳統 TACE'?['Lipiodol + doxorubicin mixture','Lipiodol','doxorubicin','gelatin sponge','EGgel']:s.subtype==='DEB-TACE'?['DC Bead','LifePearl','Tandem microspheres','HepaSphere','gelatin sponge','coils','EGgel']:s.subtype==='HAIC'?['coils','gelatin sponge','EGgel']:['gelatin sponge','coils','PVA particles','EGgel'];
 if(path.startsWith('items.drugs.')&&f.key==='detail'){const r=s.items.drugs[Number(path.split('.')[2])]||{};return r.name==='coils'?['detachable coils','pushable coils']:['PVA particles','DC Bead'].includes(r.name)?['100–300 µm','300–500 µm']:[];}
 if(s.module===3&&f.key==='location')return ({Liver:['hepatic segment 2','hepatic segment 3','hepatic segment 4','hepatic segment 5','hepatic segment 6','hepatic segment 7','hepatic segment 8'],'Abdominal abscess':['peritoneal cavity','pelvic cavity','subphrenic space'],'Pancreatitis':['peripancreatic region','lesser sac','retroperitoneal space'],'Psoas muscle abscess':['psoas muscle'],'Iliacus muscle abscess':['iliacus muscle']})[s.subtype];
 if(f.key==='findings')return profile.groups.flatMap(x=>x[1]);
 if(f.key==='post')return profile.post;
 if(f.key==='recommendation')return profile.recommend;
 if(f.key==='procedureSteps')return profile.steps;
 if(f.key==='scope')return IRControls.arteryChoices(false,s);
 if(f.key==='infusionTip')return ['common hepatic artery','proper hepatic artery','right hepatic artery','left hepatic artery'];
 if(path.startsWith('items.radio.')){if(f.key==='target')return IRControls.arteryChoices(true,s);if(f.key==='activity')return s.subtype==='Y90 1st'?['1','2','3','4','5']:['0.5','1','2','3','4','5','8'];if(f.key==='unit')return s.subtype==='Y90 1st'?['mCi']:['GBq'];}
 if(path.startsWith('items.catheters.')){const row=s.items.catheters[Number(path.split('.')[2])]||{};if(f.key==='name')return ['angiographic catheter','microcatheter'];if(f.key==='shape')return row.name==='angiographic catheter'?['RC','RLG','RH','OMNI','J Curve','RIM','Cobra','Simmons']:[];if(f.key==='size')return row.name==='microcatheter'?['1.7','1.9','1.98','2.0','2.1','2.4','2.7']:['4','5','6'];if(f.key==='tip')return IRControls.arteryChoices(true,s);}
 if(path.startsWith('items.vessels.')&&f.key==='name')return IRControls.arteryChoices(false,s);
 const k=f.key,g=path.split('.')[1],m=s.module;
 const locations=m===2?({Liver:['hepatic segment 2','hepatic segment 3','hepatic segment 4','hepatic segment 5','hepatic segment 6','hepatic segment 7','hepatic segment 8'],Kidney:['renal upper pole','renal lower pole','renal cortex'],Abdomen:['abdominal mass','peritoneal mass'],Retroperitoneum:['retroperitoneal mass'], 'Adrenal gland':['adrenal gland']}[s.subtype]||[]):['hepatic segment 2','hepatic segment 3','hepatic segment 4','hepatic segment 5','hepatic segment 6','hepatic segment 7','hepatic segment 8','renal pelvis','psoas muscle','iliacus muscle','pelvic cavity','peritoneal cavity'];
 const vessels=['celiac artery','superior mesenteric artery','common hepatic artery','right hepatic artery','left hepatic artery','gastroduodenal artery','renal artery','segment VI hepatic artery','segment VII hepatic artery','segment VIII hepatic artery'];
 const map={
 scope:['celiac and superior mesenteric arteries','common hepatic artery','bilateral renal arteries','abdominal aorta'],
 location:locations,
 name:g==='vessels'?vessels:g==='drugs'?['Lipiodol','doxorubicin','gelatin sponge','coils','PVA particles','DC Bead']:g==='catheters'?['angiographic catheter','microcatheter','Cobra catheter','Simmons catheter']:['pigtail catheter','nephrostomy catheter','biliary drainage catheter','internal-external biliary drainage catheter','double-J ureteral stent','metallic biliary stent'],
 tip:m===0?vessels:['renal pelvis','urinary bladder','common bile duct','duodenum','hepatic collection','pelvic collection','psoas collection'],
 puncture:['existing nephrostomy tract','existing biliary drainage tract','existing drainage tract','lower pole renal calyx','upper pole renal calyx','right intrahepatic bile duct','left intrahepatic bile duct','anterior abdominal wall'],
 path:['an anterior approach','a posterior approach','a lateral approach','an oblique approach','the existing tract'],
 finding:['tumor staining','active contrast extravasation','pseudoaneurysm','no active contrast extravasation','patent vessel','focal stenosis','complete occlusion'],
 findings:m===2?['A solid mass was identified','The biopsy needle was positioned within the target lesion']:m===3?['A fluid collection was identified','A multiloculated collection was identified']:m===4?['The target lesion was identified under image guidance']:m===1?['Dilatation of the collecting system was demonstrated','Biliary ductal dilatation was demonstrated','Obstruction was demonstrated on contrast injection']:['Patency of the main portal vein and its bilateral branches','No active contrast extravasation was identified','Tumor staining was demonstrated','Dilatation of the collecting system was demonstrated','Biliary ductal dilatation was demonstrated'],
 post:m===2?['Post-procedure CT revealed no significant hematoma, abnormal fluid or air collection','Post-procedure CT revealed a small hematoma','Post-procedure CT revealed pneumothorax']:m===4?['The ablation zone covered the target lesion','Residual enhancement was identified','No significant hematoma was identified']:m===0?['The target vessel remained patent','Reduced tumor staining was demonstrated','No residual contrast extravasation was identified']:['The catheter tip was in the intended position','Free drainage was demonstrated','The collection decreased in size','Persistent obstruction was demonstrated'],
 result:['Clear urine drained freely','Pus-like fluid was drained','Free flow of contrast into the duodenum was demonstrated','The catheter tip was in the intended position','The collection decreased in size','Pink urine was noted after catheter exchange'],
 fluid:['purulent','turbid','serous','bloody','bilious','clear'],
 obstruction:['common bile duct','common hepatic duct','hepatic hilum','distal ureter','proximal ureter','ureteropelvic junction'],
 revision:['The catheter was repositioned over a guidewire','The catheter was upsized over a guidewire','The catheter was advanced across the obstruction'],
 tests:['histopathology','histopathology and cytology','culture','cytology and culture','histopathology, cytology and culture'],
 reason:['No safe access route was available','The patient could not tolerate the procedure','Patient movement prevented completion','The lesion could not be confidently identified'],
 complicationDetail:['A small hematoma developed','Pneumothorax developed','Contrast extravasation was identified','Catheter-related bleeding was noted'],
 toleranceDetail:['The patient experienced transient pain','The procedure was interrupted due to patient discomfort'],
 hemostasis:['manual compression','a Perclose ProGlide closure device','an Angio-Seal closure device','a StarClose closure device','a radial compression device'],
 beads:['100','100–300','300–500'],loadingDrug:['doxorubicin','epirubicin'],
 embolizationSite:vessels,
 protection:['Artificial ascites was created','Hydrodissection was performed','Artificial pleural effusion was created'],
 site:['center of the target lesion','superior aspect of the lesion','inferior aspect of the lesion','peripheral aspect of the lesion'],
 device:g==='sclerosis'?['8 Fr pigtail catheter','10 Fr pigtail catheter','18 G needle']:s.subtype==='RFA'?['Cool-tip radiofrequency electrode','Bip-tip radiofrequency electrode']:['13 G Emprint microwave antenna'],
 agent:['ethanol','polidocanol','doxycycline'],concentration:['95%','99%','100%'],
 recommendation:['Clinical and laboratory correlation is suggested','Follow-up imaging is suggested','Monitor the drainage output','Specimens were submitted for pathological examination'],
 detail:['100–300 µm','300–500 µm','detachable coils','pushable coils'],
 anesthesiaDetail:[]
 };
 if(k==='size')return g==='lesions'?['1','1.5','2','2.5','3','4','5']:g==='catheters'?['2','2.4','2.7','4','5','6']:['6','8','8.5','10','12','14'];
 if(k==='coaxial')return ['17','19'];if(k==='needle')return ['18','20'];
 if(['passes','samples','cycles','target','nhiCount','nhiVials'].includes(k))return ['1','2','3','4','5','6'];
 if(k==='nhiPrior')return ['0','1','2','3'];
 if(k==='power')return s.module===4&&s.subtype==='Microwave ablation'?['50','75','100','125','150']:[];
 if(k==='duration'&&s.module===4)return s.subtype==='RFA'?['12','16','25']:['3','5','7','10'];
 if(['duration','dwell'].includes(k))return ['3','5','10','15','20','30'];
 if(['volume','aspirate'].includes(k))return f.type==='nonnegative'?['0','5','10','20','30','50','100','200']:['5','10','20','30','50','100','200'];
 if(k==='amount')return ['1','2','3','5','10','20','30','50'];
 if(k==='doxorubicinDose')return ['10','20','30','40','50','60','75'];
 if(k==='loadingDose')return ['25','50','75'];if(k==='beadsVolume')return ['1','2'];
 if(k==='nhiMax')return ['1','2','3','4','5','6','8','10'];
 return map[k]||[];
 }
};
