const $=id=>document.getElementById(id);
Object.assign(Compact.labels,{beadType:'Bead 種類',fusion:'Sono fusion',pattern:'消融模式',rfaSetup:'針數／Switch',protectionStatus:'保護措施確認'});
const previousCompactValue=Compact.value.bind(Compact);
Compact.value=x=>/^hepatic segment \d+$/.test(String(x))?'S'+String(x).match(/\d+$/)[0]:({'midline':'Midline','intravenous sedation and local anesthesia':'Local + IVG','Cool-tip radiofrequency electrode':'Cool-tip','Bip-tip radiofrequency electrode':'Bip-tip','13 G Emprint microwave antenna':'13 G Emprint','single-position ablation':'單一位置','overlapping ablation of the same tumor':'同腫瘤 Overlap','single electrode':'單針','two electrodes with switching':'雙針 + Switch','three electrodes with switching':'三針 + Switch'})[x]||previousCompactValue(x);
let state=IR.blank(),backup=null,pending=null,expiryTimer=null,toastTimer=null;
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=x=>escapeHTML(x);
function visible(f){const v=state.values;if(f.key==='revision')return v.mode==='Revision';if(f.key==='reason')return v.status&&v.status!=='completed';if(f.key==='complicationDetail')return ['有立即併發症','未確認'].includes(v.complication);if(f.key==='toleranceDetail')return v.tolerance==='其他'||v.toleranceDetail;if(f.key==='recommendation')return state.recommend;return true;}
function fieldHTML(f,value,path){return Compact.field(f,value,path,state);}
let activePanel=null;
const complicationChoices=[['Active bleeding','Active bleeding was identified',['Compression was applied','Angiographic evaluation was performed','Embolization was performed','The patient was monitored']],['Pneumothorax','Pneumothorax was identified',['The patient was monitored','Supplemental oxygen was administered','Needle aspiration was performed','A chest tube was placed','A follow-up chest radiograph was obtained']],['鄰近胃壁增強','Increased enhancement of the adjacent stomach wall was observed',['The patient was monitored','Clinical evaluation was requested']],['鄰近腸壁增強','Increased enhancement of the adjacent bowel wall was observed',['The patient was monitored','Clinical evaluation was requested']],['Vasovagal reaction','A vasovagal reaction occurred',['The patient was placed in a supine position','Vital signs were monitored','Intravenous fluid was administered','Medication was administered']],['疼痛相關高血壓','Hypertension associated with pain was observed',['Vital signs were monitored','Analgesia was administered','Antihypertensive medication was administered']]];
function complicationOptions(){const selected=IRControls.list(state.values.complicationTypes),management=IRControls.list(state.values.complicationManagement);return `<div class="field complicationChoices"><div class="label">併發症類型 · 可複選</div><div class="choices">${complicationChoices.map(([label,value])=>IRControls.button('values.complicationTypes',value,label,selected,true)).join('')}</div>${complicationChoices.filter(([,value])=>selected.includes(value)).map(([label,,options])=>`<div class="phraseGroup"><small>${escapeHTML(label)} · 實際處置（可複選）</small><div class="choices">${options.map(x=>IRControls.button('values.complicationManagement',x,x,management,true)).join('')}</div></div>`).join('')}<label for="complicationManagementDetail">其他處置／藥物及劑量（英文，選填）</label><textarea id="complicationManagementDetail" data-path="values.complicationManagementDetail" aria-label="其他併發症處置">${escapeHTML(state.values.complicationManagementDetail||'')}</textarea></div>`;}
function accessHTML(){const f=IR.activeFields(state).find(x=>x.key==='access');return `<div class="field"><label>穿刺</label><div class="entry accessEntry"><div class="choices">${['right','left'].map(x=>`<button data-path="values.accessSide" data-value="${x}" aria-pressed="${state.values.accessSide===x}">${x==='right'?'R':'L'}</button>`).join('')}</div><select data-select-path="values.access" aria-label="穿刺途徑"><option value="">選取…</option>${f.options.map(x=>`<option value="${attr(x)}" ${state.values.access===x?'selected':''}>${escapeHTML(Compact.value(x))}</option>`).join('')}</select></div></div>`;}
function render(){
 const m=IR.modules[state.module];
 $('tabs').innerHTML=IR.modules.map((m,i)=>`<button role="tab" aria-selected="${i===state.module}" class="${i===state.module?'active':''}" data-module="${i}">${m.short}<small>Alt+${i+1}</small></button>`).join('');
 $('moduleTitle').textContent=m.title;
 $('subtypes').innerHTML=m.types.map(x=>`<button data-subtype="${attr(x)}" class="${x===state.subtype?'active':''}" aria-pressed="${x===state.subtype}">${escapeHTML(IR.typeLabel(x))}</button>`).join('');
 $('indication').value=state.indication||'';
 $('clinicalChoices').innerHTML=IRProfile.get(state).indications.map(x=>`<button data-indication="${attr(x)}" title="${attr(x)}" aria-pressed="${state.indication===x}">${escapeHTML(Compact.clinical(x))}</button>`).join('');
 const groups=IR.activeGroups(state),left=groups.filter(g=>['lesions','vessels'].includes(g.key)),middle=groups.filter(g=>!['lesions','vessels'].includes(g.key));
 const settings=(state.module===0?accessHTML():'')+IR.activeFields(state).filter(f=>f.key!=='fusion'&&!f.key.startsWith('nhi')&&visible(f)&&!(state.module===0&&['accessSide','access'].includes(f.key))).map(f=>(f.key==='guidance'&&state.module===4?`<div class="guidanceRow">${fieldHTML(f,state.values[f.key],'values.'+f.key)}<button type="button" data-path="values.fusion" data-value="Sono fusion" aria-pressed="${state.values.fusion==='Sono fusion'}" ${state.values.guidance==='CT'?'disabled title="純 CT 引導無法使用 Sono fusion"':''}>Sono fusion</button></div>`:fieldHTML(f,state.values[f.key],'values.'+f.key))+(f.key==='beads'?'<p class="help">種類與尺寸分開記錄，請依實際包裝確認規格。</p>':'')).join('');
 const routine=[state.values.complication==='無立即併發症'?'無併發症':state.values.complication==='有立即併發症'?'有併發症':'併發症待確認',state.values.tolerance==='病人耐受良好'?'耐受良好':'耐受度待確認',...(IR.supportsHemostasis(state)?[state.values.hemostasisConfirm==='完成止血'?'已止血':state.values.hemostasisConfirm==='未完成止血'?'帶 sheath 返回':'止血待確認']:[])];
 const exceptions=state.values.status!=='completed'||state.values.complication!=='無立即併發症'||state.values.tolerance!=='病人耐受良好'||(IR.supportsHemostasis(state)&&state.values.hemostasisConfirm!=='完成止血');
 const result=fieldHTML(IR.common.find(f=>f.key==='findings'),state.values.findings,'values.findings')+fieldHTML(IR.common.find(f=>f.key==='post'),state.values.post,'values.post');
 $('form').innerHTML=`<section class="workcol"><h2>處置與標的</h2><div class="section settings">${settings}</div>${left.map(g=>Compact.group(g,state)).join('')}</section><section class="workcol"><h2>器材／療程</h2>${middle.map(g=>Compact.group(g,state)).join('')}</section><section class="workcol"><h2>所見與例外</h2><div class="section">${result}<div class="routine ${exceptions?'abnormal':''}"><span>${routine.map(escapeHTML).join(' · ')}</span><button data-exceptions>例外／修改</button></div><label class="resultsConfirm"><input id="confirmResults" type="checkbox" ${state.resultsConfirmed?'checked':''}>已核對本次步驟、完成狀態、併發症、耐受與止血結果</label>${fieldHTML({key:'procedureSteps',label:'常規步驟'},state.values.procedureSteps,'values.procedureSteps')}${state.module===2?fieldHTML(IR.preparation.find(f=>f.key==='specimenFixation'),state.values.specimenFixation,'values.specimenFixation'):''}${fieldHTML(IR.common.find(f=>f.key==='recommendation'),state.values.recommendation,'values.recommendation')}${state.subtype==='DEB-TACE'&&state.values.payment==='健保'?'<button class="nhiButton" data-nhi>健保條件核對</button>':''}</div></section>`;
 update();if(activePanel)refreshPanel();
}
function openPanel(kind,path){activePanel={kind,path};refreshPanel();if(!$('workDialog').open)$('workDialog').showModal();}
function refreshPanel(){
 const d=$('workBody'),scroll=d.scrollTop,{kind,path}=activePanel;$('workDialog').dataset.kind=kind;
 if(kind==='picker'){const f=Compact.getField(path,state),value=path.split('.').reduce((a,k)=>a[k],state);$('workTitle').textContent=f.label;d.innerHTML=IRControls.fields(f,value,path,state);}
 if(kind==='exceptions'){$('workTitle').textContent='例外／結果修改';d.innerHTML=IR.commonFor(state).filter(f=>['status','reason','complication','complicationDetail','tolerance','toleranceDetail','hemostasisConfirm'].includes(f.key)&&visible(f)).map(f=>(f.key==='complicationDetail'&&state.values.complication==='有立即併發症'?complicationOptions():'')+fieldHTML(f,state.values[f.key],'values.'+f.key)).join('');}
 if(kind==='custom'){const f=Compact.getField(path,state),value=path.split('.').reduce((a,k)=>a[k],state);$('workTitle').textContent='補充 · '+f.label;d.innerHTML=`<label for="customValue">${escapeHTML(f.label)}</label><textarea id="customValue">${escapeHTML(value)}</textarea><button class="primary" data-save-custom>套用</button>`;}
 if(kind==='nhi'){$('workTitle').textContent='健保條件核對';d.innerHTML='<div id="nhiSummary"></div>'+IR.nhiFields.map(f=>fieldHTML(f,state.values[f.key],'values.'+f.key)).join('')+`<a href="${IR.NHI_SOURCE}" target="_blank" rel="noopener">健保署規定</a>`;}
 if(kind==='nhi'){const nc=IR.nhiCheck(state);$('nhiSummary').textContent='最大直徑＋總顆數：'+(nc.sum===null?'待填':nc.sum)+' · 待核對 '+nc.missing.length+' 項 · 條件不符 '+nc.failed.length+' 項';}
 d.scrollTop=scroll;
}
function closePanel(){activePanel=null;$('workDialog').close();}
function closeCaseDialogs(){closePanel();$('libraryDialog').close();}
function applyValue(path,value){
 state.resultsConfirmed=false;
 const old=path.split('.').reduce((a,k)=>a[k],state);setPath(path,value);
 if(path==='values.recommendation')state.recommend=!!String(value).trim();
 if(path==='values.mode'){const previous=IR.standardSteps({...state,values:{...state.values,mode:old}});state.values.procedureSteps=[...new Set([...IRControls.list(state.values.procedureSteps).filter(x=>!previous.includes(x)),...IR.standardSteps(state)])].join('\n');state.values.revision='';for(const r of state.items.tubes||[])r.puncture='';}
 if(path==='values.guidance'&&state.module===4&&value==='CT')state.values.fusion='';
 if(path==='values.targetType')for(const r of state.items.sclerosis||[])r.location='';
 if(path.startsWith('items.ablations.')&&path.endsWith('.rfaSetup')){const r=state.items.ablations[Number(path.split('.')[2])];r.duration=({'single electrode':'12','two electrodes with switching':'16','three electrodes with switching':'25'})[value]||'';}
 if(path.startsWith('items.ablations.')&&path.endsWith('.pattern')){const r=state.items.ablations[Number(path.split('.')[2])];r.site='';r.cycles='';}
 if(path.startsWith('items.tubes.')&&path.endsWith('.side')){const r=state.items.tubes[Number(path.split('.')[2])],other=r.side==='left'?'right':r.side==='right'?'left':null;for(const k of ['puncture','tip'])if(other&&new RegExp('\\b'+other+'\\b').test(r[k]||''))r[k]='';}
 if(path==='values.complication'&&old!==value){state.values.complicationDetail='';state.values.complicationTypes='';state.values.complicationManagement='';state.values.complicationManagementDetail='';}
 if(path==='values.complicationTypes'){const choices=IRControls.list(value),allowed=new Set(complicationChoices.filter(([,type])=>choices.includes(type)).flatMap(([, ,opts])=>opts));state.values.complicationManagement=IRControls.list(state.values.complicationManagement).filter(x=>allowed.has(x)).join('\n');}
 if(path==='values.tolerance'&&value!=='其他')state.values.toleranceDetail='';
 if(path==='values.status'&&value==='aborted'){if(state.values.complication==='無立即併發症')state.values.complication='';if(state.values.tolerance==='病人耐受良好')state.values.tolerance='';state.values.post='';if(IR.supportsHemostasis(state))state.values.hemostasisConfirm='不適用';}
 if(path==='values.access'&&(['manual compression','a radial compression device'].includes(state.values.hemostasis)||/radial/.test(value)))state.values.hemostasis=/radial/.test(value)?'a radial compression device':'manual compression';
 if(path.startsWith('items.catheters.')&&path.endsWith('.name')&&old!==value){const r=state.items.catheters[Number(path.split('.')[2])];r.size='';r.shape='';r.other='';}
 if(path.startsWith('items.drugs.')&&path.endsWith('.name')&&old!==value){const r=state.items.drugs[Number(path.split('.')[2])];r.amount='';r.detail='';r.doxorubicinDose='';r.unit=({'Lipiodol + doxorubicin mixture':'mL','Lipiodol':'mL','doxorubicin':'mg','DC Bead':'mL','LifePearl':'mL','Tandem microspheres':'mL','HepaSphere':'mL','coils':'piece'})[value]||'';}
}

function setPath(path,value){let parts=path.split('.'),x=state;for(let i=0;i<parts.length-1;i++)x=x[parts[i]];x[parts.at(-1)]=value;}
function caseSignature(){return JSON.stringify([state.module,state.subtype,state.values,state.items,state.recommend,state.indication]);}
function reportErrors(){const errors=IR.validate(state);if(!state.resultsConfirmed)errors.push('請核對並確認本次完成狀態、併發症、耐受與止血結果');return errors;}
function previewReport(){if(state.resultsConfirmed)return IR.generate(state);const v={...state.values};if(v.status==='completed')v.status='';if(v.complication==='無立即併發症')v.complication='';if(v.tolerance==='病人耐受良好')v.tolerance='';if(v.hemostasisConfirm==='完成止血')v.hemostasisConfirm='';return IR.generate({...state,values:v});}
function update(){
 if(state.resultsConfirmed&&state.confirmedSnapshot!==caseSignature())state.resultsConfirmed=false;
 if($('confirmResults'))$('confirmResults').checked=!!state.resultsConfirmed;
 const text=previewReport(),errors=reportErrors();
 const nc=IR.nhiCheck(state);if($('nhiSummary'))$('nhiSummary').textContent=`最大直徑＋總顆數：${nc.sum===null?'尚未填妥':nc.sum+'（門檻 ≥11）'} · ${nc.missing.length?'待核對 '+nc.missing.length+' 項':nc.failed.length?'有 '+nc.failed.length+' 項條件不符':'所填條件核對通過，仍須核對品項及申報'}`;
 $('report').textContent=text||'選擇處置並點選實際項目後，英文報告將即時顯示於此。\n\n未填寫的非必要段落不會輸出。';
 $('count').textContent=`${text.length.toLocaleString()} 字元`;
 $('checks').classList.toggle('ok',!errors.length);
 $('checks').innerHTML=errors.length?`<b>報告檢查 · ${errors.length} 項待完成（將阻止複製）</b><ul>${errors.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`:'<b>✓ 結構檢查通過 · 可產生並複製</b><p class="help">請核對全文、側別、器材及劑量後使用。</p>';
 $('copy').setAttribute('aria-disabled',String(!!errors.length));
}
function hasData(){return IR.hasUserData(state);}
function requestSwitch(mod,sub){if(mod===state.module&&(!sub||sub===state.subtype))return;if(hasData()){pending={mod,sub};$('switchDialog').showModal();}else doSwitch(mod,sub);}
function doSwitch(mod,sub){closeCaseDialogs();state=IR.blank(mod,sub);pending=null;render();document.querySelector('.editor').scrollTop=0;}
function notify(text,undo=false){clearTimeout(toastTimer);$('toast').replaceChildren();let span=document.createElement('span');span.textContent=text;$('toast').append(span);if(undo){let b=document.createElement('button');b.textContent='復原';b.onclick=restore;$('toast').append(b);}$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),undo?30000:5000);}
function nextPatient(){
 if(!hasData()&&!state.indication){notify('目前已是空白個案');return;}
 backup={data:structuredClone(state),until:Date.now()+30000};clearTimeout(expiryTimer);expiryTimer=setTimeout(()=>{backup=null;$('toast').classList.remove('show');},30000);
 closeCaseDialogs();state=IR.blank(state.module,state.subtype);render();notify('已清空個案，可在 30 秒內復原',true);
}
function restore(){if(!backup||Date.now()>backup.until){notify('沒有可復原的個案');backup=null;return;}if(hasData()||state.indication){notify('請先清空目前輸入，再復原上一位');return;}state=backup.data;backup=null;clearTimeout(expiryTimer);render();notify('已復原上一位個案');}
async function copyReport(){const errors=reportErrors();if(errors.length){notify('報告未完成：'+errors[0]);$('checks').scrollIntoView({block:'nearest'});return;}try{await navigator.clipboard.writeText(IR.generate(state));notify('英文報告已複製');}catch{notify('剪貼簿權限受限，請選取右側報告手動複製');const range=document.createRange();range.selectNodeContents($('report'));const sel=getSelection();sel.removeAllRanges();sel.addRange(range);}}
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.customPath){const path=t.dataset.customPath,old=path.split('.').reduce((a,k)=>a[k],state),known=JSON.parse(t.dataset.known);applyValue(path,[...IRControls.list(old).filter(x=>known.includes(x)),...IRControls.list(t.value)].join('\n'));update();}else if(t.dataset.path&&t.tagName!=='BUTTON'){applyValue(t.dataset.path,t.value);update();}});
document.addEventListener('change',e=>{if(e.target.id==='confirmResults'){state.resultsConfirmed=e.target.checked;state.confirmedSnapshot=caseSignature();update();}else if(e.target.dataset.selectPath){applyValue(e.target.dataset.selectPath,e.target.value);render();}});
$('indication').addEventListener('input',e=>{state.resultsConfirmed=false;state.indication=e.target.value;update();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.path){const old=b.dataset.path.split('.').reduce((a,k)=>a[k],state),a=IRControls.list(old);applyValue(b.dataset.path,b.dataset.multi?(a.includes(b.dataset.value)?a.filter(x=>x!==b.dataset.value):[...a,b.dataset.value]).join('\n'):old===b.dataset.value?'':b.dataset.value);render();}
 if(b.dataset.pickerPath)openPanel('picker',b.dataset.pickerPath);
 if(b.dataset.editPath)openPanel('custom',b.dataset.editPath);
 if(b.hasAttribute('data-exceptions'))openPanel('exceptions');
 if(b.hasAttribute('data-nhi'))openPanel('nhi');
 if(b.hasAttribute('data-work-close'))closePanel();
 if(b.hasAttribute('data-save-custom')){applyValue(activePanel.path,$('customValue').value);closePanel();render();}
 if(b.dataset.overlapAdd!==undefined){state.resultsConfirmed=false;const r=state.items.ablations[Number(b.dataset.overlapAdd)];state.items.ablations.push({target:r.target,pattern:'overlapping ablation of the same tumor',device:r.device,...(r.rfaSetup?{rfaSetup:r.rfaSetup}:{})});render();}
 if(b.dataset.catAdd){state.resultsConfirmed=false;state.items.catheters.push({name:b.dataset.catAdd});render();}
 if(b.dataset.add){state.resultsConfirmed=false;state.items[b.dataset.add].push(IR.defaultItem(state,b.dataset.add));render();}
 if(b.dataset.remove){state.resultsConfirmed=false;const [g,i]=b.dataset.remove.split('.');state.items[g].splice(Number(i),1);render();}
});
$('workDialog').addEventListener('close',()=>{activePanel=null;});
$('tabs').addEventListener('click',e=>{let b=e.target.closest('[data-module]');if(b)requestSwitch(Number(b.dataset.module));});
$('subtypes').addEventListener('click',e=>{let b=e.target.closest('[data-subtype]');if(b)requestSwitch(state.module,b.dataset.subtype);});
$('confirmSwitch').onclick=()=>{if(pending)doSwitch(pending.mod,pending.sub);$('switchDialog').close();};
$('cancelSwitch').onclick=()=>{pending=null;$('switchDialog').close();};
$('copy').onclick=copyReport;$('next').onclick=nextPatient;
function resize(value){let n=Math.max(22,Math.min(50,Math.round(Number(value))));document.documentElement.style.setProperty('--preview',n+'%');$('width').value=n;$('widthValue').textContent=n+'%';try{localStorage.setItem('ir-report-preview-width-readable',n);}catch{}}
function setReportSize(value){const n=Math.max(12,Math.min(24,Math.round(Number(value))));document.documentElement.style.setProperty('--report-font',n+'px');$('reportSize').textContent=n+' px';try{localStorage.setItem('ir-report-font-size',n);}catch{}}
$('reportSmaller').onclick=()=>setReportSize(parseInt($('reportSize').textContent,10)-1);
$('reportLarger').onclick=()=>setReportSize(parseInt($('reportSize').textContent,10)+1);
$('width').oninput=e=>resize(e.target.value);
$('splitter').addEventListener('pointerdown',e=>{e.target.setPointerCapture(e.pointerId);e.target.onpointermove=ev=>resize((window.innerWidth-ev.clientX)/window.innerWidth*100);e.target.onpointerup=()=>{e.target.onpointermove=null;};});
$('splitter').onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();resize(Number($('width').value)+(e.key==='ArrowLeft'?1:-1));}};
document.addEventListener('keydown',e=>{if(!e.altKey)return;if(e.key.toLowerCase()==='p'){e.preventDefault();copyReport();}if(e.key==='Enter'){e.preventDefault();nextPatient();}if(e.key.toLowerCase()==='z'){e.preventDefault();restore();}if(/^[1-5]$/.test(e.key)){e.preventDefault();requestSwitch(Number(e.key)-1);}});
function libraryEntries(){
 const fields=[{key:'procedureSteps',label:'實際執行步驟'},...IR.activeFields(state),...IR.commonFor(state).filter(f=>!['complicationDetail','toleranceDetail'].includes(f.key)),...IR.preparation.filter(f=>state.module===2&&f.key==='specimenFixation'),...IR.activeGroups(state).flatMap(g=>g.fields.map(f=>({...f,group:g.key})))];
 const seen=new Set(),out=[];
 for(const f of fields){for(const text of f.options||IRPicks.get(f,f.group?'items.'+f.group+'.0.'+f.key:'values.'+f.key,state)){if(!seen.has(text)){seen.add(text);out.push({text,label:f.label});}}}
 return out;
}
let libraryRows=[];
function searchLibrary(){const q=$('phraseSearch').value.toLowerCase().trim();const rows=libraryRows.filter(r=>(r.text+' '+r.label).toLowerCase().includes(q));$('phraseResults').innerHTML=rows.map(r=>`<button class="phraseResult" data-phrase="${attr(r.text)}"><small>${escapeHTML(r.label)}</small>${escapeHTML(r.text)}<span>＋ 加入</span></button>`).join('')||'<p>沒有符合的片語，請換個關鍵字。</p>';}
$('library').onclick=()=>{libraryRows=libraryEntries();$('libraryContent').innerHTML=`<p class="help">目前模組：${escapeHTML(IR.modules[state.module].title)}。搜尋目前處置的常用片語，點選可加入指定段落。</p><input id="phraseSearch" type="search" placeholder="搜尋片語、器材或所見…" aria-label="搜尋片語"><label for="phraseDestination">加入段落</label><select id="phraseDestination"><option value="findings">Findings 補充所見</option><option value="post">Post-procedural findings 術後結果</option><option value="recommendation">Recommendation 建議</option></select><div id="phraseResults"></div><details><summary>範本來源與整理方式</summary>${IRPicks.sources.map(r=>`<p><b>${escapeHTML(r[0])}</b>：${escapeHTML(r[1])}</p>`).join('')}<p>來源：您提供的片語庫（1,473 筆）。本介面將相關處置原文整理成共用英文句型與結構選項；MW 與硬化治療沿用既有結構。HAIC 與 Y90 分別參照 HAIC／HAIC1／HAIC2、Y901／Y902 範本；來源中的個案資料、日期、尺寸及劑量不自動套用。尺寸、器材、結果均由本次點選確認。</p><p>GI bleeding 用語參考：<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12868068/" target="_blank" rel="noopener">CIRSE emergency IR standards</a>（側枝回流）；<a href="https://pubs.rsna.org/doi/10.1148/radiol.232298" target="_blank" rel="noopener">ACG／SAR consensus</a>（間歇出血）。僅於選取後加入報告。</p></details>`;searchLibrary();$('phraseSearch').oninput=searchLibrary;$('phraseResults').onclick=e=>{const b=e.target.closest('[data-phrase]');if(!b)return;const k=$('phraseDestination').value;state.values[k]=[...new Set([...IRControls.list(state.values[k]),b.dataset.phrase])].join('\n');if(k==='recommendation')state.recommend=true;render();notify('片語已加入 '+k);};$('libraryDialog').showModal();};
document.querySelector('.clinical').addEventListener('click',e=>{const b=e.target.closest('[data-indication]');if(b){state.resultsConfirmed=false;state.indication=state.indication===b.dataset.indication?'':b.dataset.indication;render();}});
$('closeLibrary').onclick=()=>$('libraryDialog').close();
try{resize(localStorage.getItem('ir-report-preview-width-readable')||30);setReportSize(localStorage.getItem('ir-report-font-size')||14);}catch{resize(30);setReportSize(14);}
render();
