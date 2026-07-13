class TakeoffSheet{constructor(){this.selectedItems=[];this.checklistItems=[];this.projects={}}addItems(items){items.forEach(item=>{if(!this.selectedItems.find(i=>i.id===item.id)){this.selectedItems.push(item);this.checklistItems.push({...item,checked:false,itemNo:this.checklistItems.length+1,timesingNo:1,timesingL:1,timesingW:1,timesingD:1,dimL:0,dimW:0,dimD:0,waste:5,rate:0})}});this.renderChecklist();this.renderMeasurements();this.renderReinforcement()}removeItem(itemId){this.selectedItems=this.selectedItems.filter(i=>i.id!==itemId);this.checklistItems=this.checklistItems.filter(i=>i.id!==itemId);this.checklistItems.forEach((item,index)=>item.itemNo=index+1);this.renderChecklist();this.renderMeasurements();this.renderReinforcement()}toggleChecklistItem(itemId){const item=this.checklistItems.find(i=>i.id===itemId);if(item){item.checked=!item.checked;this.renderChecklist()}}renderChecklist(){const tbody=document.getElementById('checklistBody');if(this.checklistItems.length===0){tbody.innerHTML='<tr class="empty-row"><td colspan="8">No items selected. Choose work sections from the sidebar.</td></tr>';return}tbody.innerHTML=this.checklistItems.map(item=>`<tr class="${item.checked?'item-complete':''}"><td>${item.checked?'✅':'⬜'}</td><td>${item.smmRef||''}</td><td>${item.itemNo}</td><td>${item.desc.split('(')[0]||item.desc}</td><td style="font-size:12px;">${item.desc}</td><td>${item.smmRef||''}</td><td>${item.timesingNo||1}</td><td><button class="check-btn ${item.checked?'checked':''}" onclick="takeoffSheet.toggleChecklistItem('${item.id}')">${item.checked?'Undo':'✓'}</button></td></tr>`).join('')}renderMeasurements(){const tbody=document.getElementById('measurementsBody');if(this.checklistItems.length===0){tbody.innerHTML='<tr class="empty-row"><td colspan="15">Measurements will appear here as you work through the checklist.</td></tr>';return}tbody.innerHTML=this.checklistItems.map(item=>`<tr><td>${item.smmRef||''}</td><td style="text-align:left;font-size:12px;">${item.desc}</td><td>${item.unit}</td><td><input type="number" id="ts_${item.id}_no" value="${item.timesingNo||1}" min="1" style="width:45px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><input type="number" id="ts_${item.id}_l" value="${item.timesingL||1}" min="1" style="width:45px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><input type="number" id="ts_${item.id}_w" value="${item.timesingW||1}" min="1" style="width:45px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><input type="number" id="ts_${item.id}_d" value="${item.timesingD||1}" min="1" style="width:45px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><input type="number" id="dim_${item.id}_l" value="${item.dimL||0}" step="0.001" style="width:55px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><input type="number" id="dim_${item.id}_w" value="${item.dimW||0}" step="0.001" style="width:55px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><input type="number" id="dim_${item.id}_d" value="${item.dimD||0}" step="0.001" style="width:55px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><span id="calc_${item.id}" class="calc-qty">—</span></td><td><input type="number" id="waste_${item.id}" value="${item.waste||5}" step="0.5" style="width:45px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><span id="total_${item.id}" class="calc-qty">—</span></td><td><input type="number" id="rate_${item.id}" value="${item.rate||0}" step="0.01" style="width:65px;" onchange="takeoffSheet.updateCalc('${item.id}')"></td><td><span id="amount_${item.id}" class="amount-cell">—</span></td></tr>`).join('')}updateCalc(itemId){const tsN=parseFloat(document.getElementById(`ts_${itemId}_no`)?.value)||0;const tsL=parseFloat(document.getElementById(`ts_${itemId}_l`)?.value)||0;const tsW=parseFloat(document.getElementById(`ts_${itemId}_w`)?.value)||0;const tsD=parseFloat(document.getElementById(`ts_${itemId}_d`)?.value)||0;const dimL=parseFloat(document.getElementById(`dim_${itemId}_l`)?.value)||0;const dimW=parseFloat(document.getElementById(`dim_${itemId}_w`)?.value)||0;const dimD=parseFloat(document.getElementById(`dim_${itemId}_d`)?.value)||0;const waste=parseFloat(document.getElementById(`waste_${itemId}`)?.value)||0;const rate=parseFloat(document.getElementById(`rate_${itemId}`)?.value)||0;const timesingFactor=tsN*tsL*tsW*tsD;let quantity=0;const item=this.checklistItems.find(i=>i.id===itemId);if(item){switch(item.unit){case'm³':quantity=timesingFactor*dimL*dimW*dimD;break;case'm²':quantity=timesingFactor*dimL*dimW;break;case'm':quantity=timesingFactor*dimL;break;case'kg':if(item.id.startsWith('reinf_')){const dia=dimW>0?dimW:12;quantity=timesingFactor*dimL*((Math.PI*Math.pow(dia/1000,2))/4)*7850}else{quantity=timesingFactor*dimL*dimW*dimD*7850}break;case'no':quantity=timesingFactor*dimL||timesingFactor;break;case'item':quantity=1;break;default:quantity=timesingFactor*dimL*dimW*dimD}}item._tsN=tsN;item._tsL=tsL;item._tsW=tsW;item._tsD=tsD;item._dimL=dimL;item._dimW=dimW;item._dimD=dimD;item._quantity=quantity;item._totalQty=quantity*(1+waste/100);item._waste=waste;item._rate=rate;item._amount=item._totalQty*rate;const totalQty=item._totalQty;const amount=item._amount;document.getElementById(`calc_${itemId}`).textContent=quantity.toFixed(3);document.getElementById(`total_${itemId}`).textContent=totalQty.toFixed(3);document.getElementById(`amount_${itemId}`).textContent=amount>0?'KSh '+amount.toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}calculateAll(){this.checklistItems.forEach(item=>{this.updateCalc(item.id)});this.showTotals()}showTotals(){const totals={};let grandTotal=0;this.checklistItems.forEach(item=>{const totalEl=document.getElementById(`total_${item.id}`);const amountEl=document.getElementById(`amount_${item.id}`);if(totalEl&&totalEl.textContent!=='—'){const unit=item.unit;if(!totals[unit])totals[unit]={qty:0,amount:0};totals[unit].qty+=parseFloat(totalEl.textContent)||0}if(amountEl&&amountEl.textContent!=='—'){const amt=parseFloat(amountEl.textContent.replace(/[^0-9.]/g,''))||0;grandTotal+=amt;if(!totals[item.unit])totals[item.unit]={qty:0,amount:0};totals[item.unit].amount+=amt}});const display=document.getElementById('totalsDisplay');let html='<h4>Summary of Quantities:</h4><table>';for(const[unit,data]of Object.entries(totals)){html+=`<tr><td><strong>${unit}:</strong></td><td>${data.qty.toFixed(2)}</td><td>KSh ${data.amount.toLocaleString('en-KE',{minimumFractionDigits:2})}</td></tr>`}html+='</table>';display.innerHTML=html;document.getElementById('costSummary').innerHTML=`<h3>💰 TOTAL ESTIMATED COST: KSh ${grandTotal.toLocaleString('en-KE',{minimumFractionDigits:2})}</h3>`}

generateNarrativeReport(){
  this.calculateAll();
  const projectName=document.getElementById('projectName').value||'Untitled Project';
  const drawingTitle=document.getElementById('drawingTitle').value||'N/A';
  const drawingNo=document.getElementById('drawingNo').value||'N/A';
  const standard=document.getElementById('smmStandard').options[document.getElementById('smmStandard').selectedIndex].text;
  const date=document.getElementById('takeoffDate').value||new Date().toISOString().split('T')[0];
  const takerOff=document.getElementById('takerOff').value||'QS';
  const sheetNo=document.getElementById('sheetNo').value||'1';

  let grandTotal=0;
  this.checklistItems.forEach(item=>{grandTotal+=item._amount||0});

  const sections={};
  this.checklistItems.forEach(item=>{
    const sec=smmWorkSections.find(s=>s.items.find(i=>i.id===item.id));
    const secName=sec?sec.title:'UNCLASSIFIED';
    if(!sections[secName])sections[secName]=[];
    sections[secName].push(item);
  });

  let report=`<button class="close-report" onclick="document.getElementById('reportDisplay').style.display='none'">✕ Close Report</button>`;
  report+=`<h2 style="text-align:center;text-transform:uppercase;letter-spacing:2px;font-size:18pt;">TAKING-OFF & QUANTITY TAKEOFF REPORT</h2>`;
  report+=`<h3 style="text-align:center;color:#555;">${projectName}</h3>`;
  report+=`<p style="text-align:center;color:#666;"><strong>Drawing:</strong> ${drawingTitle} (${drawingNo}) | <strong>Standard:</strong> ${standard}</p>`;
  report+=`<p style="text-align:center;color:#666;"><strong>Date:</strong> ${date} | <strong>Sheet:</strong> ${sheetNo} | <strong>Taker-off:</strong> ${takerOff}</p>`;
  
  report+=`<div class="summary-box"><h3>📊 EXECUTIVE SUMMARY</h3>`;
  report+=`<p>This Taking-Off Report has been prepared in accordance with <strong>${standard}</strong> for: <strong>${projectName}</strong>.</p>`;
  report+=`<p>The taking-off follows the standard sequence of measurement per SMM, commencing with preliminaries through to finishes and external works.</p>`;
  report+=`<p><strong>Total Work Items Measured:</strong> ${this.checklistItems.length}</p>`;
  report+=`<p class="grand-total">GRAND TOTAL ESTIMATE: KSh ${grandTotal.toLocaleString('en-KE',{minimumFractionDigits:2})}</p></div>`;

  let globalItemNo=0;
  for(const[sectionName,items]of Object.entries(sections)){
    report+=`<h2 class="section-title">${sectionName}</h2>`;
    report+=`<p style="color:#666;font-style:italic;">Measuring per ${standard}. Dimensions from Drawing No. ${drawingNo}.</p>`;

    for(let i=0;i<items.length;i++){
      globalItemNo++;
      const item=items[i];
      const dimL=item._dimL||0;
      const dimW=item._dimW||0;
      const dimD=item._dimD||0;
      const tsN=item._tsN||1;
      const tsL=item._tsL||1;
      const tsW=item._tsW||1;
      const tsD=item._tsD||1;
      const qty=item._quantity||0;
      const totalQty=item._totalQty||0;
      const amount=item._amount||0;
      const waste=item._waste||0;

      report+=`<h3>${globalItemNo}. ${item.desc}</h3>`;
      report+=`<p><strong>SMM Ref:</strong> ${item.smmRef||'N/A'} | <strong>Unit:</strong> ${item.unit}</p>`;
      report+=`<div class="narrative-step">`;
      report+=`<p><strong>Step 1 — Identification:</strong> This item was identified from Drawing No. ${drawingNo} (${drawingTitle}). The work involves <em>${item.desc.toLowerCase()}</em> as classified under ${standard} reference <strong>${item.smmRef||'as applicable'}</strong>.</p>`;
      
      let measurementMethod='';
      if(item.unit==='m³')measurementMethod='The volume is computed as the product of the length, width, and depth (or height) of the element as detailed on the drawing. Where the element has a constant cross-section, the volume equals cross-sectional area × length.';
      else if(item.unit==='m²')measurementMethod='The area is computed as length × width (or height). Irregular shapes are broken down into regular geometric sections and summed.';
      else if(item.unit==='m')measurementMethod='Length measured along the centerline. Junctions and intersections measured once only per SMM rules.';
      else if(item.unit==='kg')measurementMethod='Weight calculated from theoretical mass per metre run of the specified bar diameter × total length. Steel density: 7,850 kg/m³.';
      else if(item.unit==='no')measurementMethod='Each unit enumerated individually. Identical units counted and recorded with timesing factors.';
      else measurementMethod='Measured as described in the SMM for this class of work.';
      
      report+=`<p><strong>Step 2 — Method of Measurement:</strong> In accordance with ${standard}, this work is measured in <strong>${item.unit}</strong>. ${measurementMethod}</p>`;

      if(dimL>0||dimW>0||dimD>0){
        report+=`<p><strong>Step 3 — Dimensions Taken from Drawing:</strong></p><ul>`;
        if(dimL>0)report+=`<li><strong>Length:</strong> ${dimL.toFixed(3)} m</li>`;
        if(dimW>0&&item.unit!=='m')report+=`<li><strong>Width:</strong> ${dimW.toFixed(3)} m</li>`;
        if(dimD>0&&item.unit==='m³')report+=`<li><strong>Depth/Height:</strong> ${dimD.toFixed(3)} m</li>`;
        if(item.unit==='kg'&&dimW>0)report+=`<li><strong>Bar Diameter:</strong> ${dimW.toFixed(0)} mm</li>`;
        report+=`</ul>`;
      }

      if(tsN>1||tsL>1||tsW>1||tsD>1){
        const parts=[];
        if(tsN>1)parts.push(`<strong>${tsN}</strong> identical elements`);
        if(tsL>1)parts.push(`<strong>${tsL}</strong> repetitions along length`);
        if(tsW>1)parts.push(`<strong>${tsW}</strong> repetitions across width`);
        if(tsD>1)parts.push(`<strong>${tsD}</strong> repetitions in depth`);
        report+=`<p><strong>Step 4 — Timesing:</strong> ${parts.join(' × ')}</p>`;
      }

      if(qty>0){
        report+=`<p><strong>Step 5 — Calculation:</strong></p><div class="calc-box">`;
        let formula='';
        if(item.unit==='m³')formula=`Volume = Timesing × L × W × D = ${tsN*tsL*tsW*tsD} × ${dimL.toFixed(3)} × ${dimW.toFixed(3)} × ${dimD.toFixed(3)}`;
        else if(item.unit==='m²')formula=`Area = Timesing × L × W = ${tsN*tsL*tsW*tsD} × ${dimL.toFixed(3)} × ${dimW.toFixed(3)}`;
        else if(item.unit==='m')formula=`Length = Timesing × L = ${tsN*tsL*tsW*tsD} × ${dimL.toFixed(3)}`;
        else if(item.unit==='kg')formula=`Weight = No. × Length × Mass/m = ${tsN*tsL*tsW*tsD} × ${dimL.toFixed(3)} × ${((Math.PI*Math.pow((dimW||12)/1000,2)/4)*7850).toFixed(3)} kg/m`;
        else formula=`Quantity = ${tsN*tsL*tsW*tsD} × ${dimL.toFixed(3)} × ${dimW.toFixed(3)} × ${dimD.toFixed(3)}`;
        report+=`<span class="formula">${formula}</span><br><span class="result">= ${qty.toFixed(3)} ${item.unit}</span></div>`;
        if(waste>0){
          report+=`<p><strong>Step 6 — Waste Allowance:</strong> ${waste}% added for cutting, breakage, and normal construction losses per Kenyan standard practice.</p>`;
          report+=`<div class="calc-box"><span class="formula">Total = ${qty.toFixed(3)} × (1 + ${waste}/100)</span><br><span class="result">= ${totalQty.toFixed(3)} ${item.unit}</span></div>`;
        }
        if(item._rate>0){
          report+=`<p><strong>Step 7 — Costing:</strong> At KSh ${item._rate.toLocaleString('en-KE')}/${item.unit}:</p>`;
          report+=`<div class="calc-box"><span class="formula">Amount = ${totalQty.toFixed(3)} × ${item._rate.toLocaleString('en-KE')}</span><br><span class="result">= KSh ${amount.toLocaleString('en-KE',{minimumFractionDigits:2})}</span></div>`;
        }
      }
      report+=`</div>`;
    }
  }

  report+=`<div class="summary-box"><h3>📋 FINAL SUMMARY</h3><table><tr><th>Section</th><th>Items</th><th>Cost (KSh)</th></tr>`;
  for(const[sectionName,items]of Object.entries(sections)){
    let secTotal=0;items.forEach(i=>secTotal+=i._amount||0);
    report+=`<tr><td>${sectionName}</td><td>${items.length}</td><td>KSh ${secTotal.toLocaleString('en-KE',{minimumFractionDigits:2})}</td></tr>`;
  }
  report+=`<tr style="font-weight:bold;background:#e8e8e8;"><td><strong>GRAND TOTAL</strong></td><td><strong>${this.checklistItems.length}</strong></td><td><strong>KSh ${grandTotal.toLocaleString('en-KE',{minimumFractionDigits:2})}</strong></td></tr></table></div>`;

  report+=`<div class="signature-block"><div><div class="line"></div>Prepared by: ${takerOff}<br>Date: ${date}</div><div><div class="line"></div>Checked by: ________________<br>Date: ________________</div></div>`;

  document.getElementById('reportDisplay').innerHTML=report;
  document.getElementById('reportDisplay').style.display='block';
  document.getElementById('reportDisplay').scrollIntoView({behavior:'smooth'});
}

renderReinforcement(){const tbody=document.getElementById('reinforcementBody');const reinfItems=this.checklistItems.filter(i=>i.id.startsWith('reinf_')||i.unit==='kg');if(reinfItems.length===0){document.getElementById('reinfSection').style.display='none';return}document.getElementById('reinfSection').style.display='block';tbody.innerHTML=reinfItems.map((item,i)=>{const barType=item.desc.includes('Y')?'High Tensile (Y)':'Mild Steel (R)';const diaMatch=item.desc.match(/[YR](\d+)/i)||item.desc.match(/(\d+)mm/i);const dia=diaMatch?diaMatch[1]:'12';return`<tr><td>${item.itemNo}</td><td>B${i+1}</td><td>${barType}</td><td>${dia}</td><td>Straight</td><td><input type="number" id="rb_${item.id}_count" value="${item.timesingNo||1}" style="width:50px;" onchange="takeoffSheet.updateRebarCalc('${item.id}')"></td><td><input type="number" id="rb_${item.id}_len" value="${item.dimL||6}" step="0.01" style="width:60px;" onchange="takeoffSheet.updateRebarCalc('${item.id}')"></td><td><span id="rb_total_${item.id}">—</span></td><td><span id="rb_wtm_${item.id}">${(Math.pow(dia/1000,2)*6170).toFixed(3)}</span></td><td><span id="rb_wt_${item.id}" class="calc-qty">—</span></td></tr>`}).join('')}updateRebarCalc(itemId){const count=parseFloat(document.getElementById(`rb_${itemId}_count`)?.value)||0;const len=parseFloat(document.getElementById(`rb_${itemId}_len`)?.value)||0;const wtmEl=document.getElementById(`rb_wtm_${itemId}`);const wtm=wtmEl?parseFloat(wtmEl.textContent)||0.888:0.888;const totalLen=count*len;const totalWt=totalLen*wtm;document.getElementById(`rb_total_${itemId}`).textContent=totalLen.toFixed(2);document.getElementById(`rb_wt_${itemId}`).textContent=totalWt.toFixed(2)}exportSheet(){this.generateNarrativeReport()}exportCsv(){let csv='Ref,Item No,Description,Unit,Timesing,Dim L,Dim W,Dim D,Quantity,Waste%,Total Qty,Rate (KSh),Amount (KSh)\n';this.checklistItems.forEach(item=>{const tsN=document.getElementById(`ts_${item.id}_no`)?.value||'';const dimL=document.getElementById(`dim_${item.id}_l`)?.value||'';const dimW=document.getElementById(`dim_${item.id}_w`)?.value||'';const dimD=document.getElementById(`dim_${item.id}_d`)?.value||'';const calc=document.getElementById(`calc_${item.id}`)?.textContent||'';const waste=document.getElementById(`waste_${item.id}`)?.value||'';const total=document.getElementById(`total_${item.id}`)?.textContent||'';const rate=document.getElementById(`rate_${item.id}`)?.value||'';const amount=document.getElementById(`amount_${item.id}`)?.textContent||'';csv+=`${item.smmRef||''},${item.itemNo},"${item.desc}",${item.unit},${tsN},${dimL},${dimW},${dimD},${calc},${waste},${total},${rate},${amount}\n`});const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='quantity_takeoff.csv';a.click()}saveProject(){const name=document.getElementById('projectName').value||'Untitled';const data={name:name,drawingTitle:document.getElementById('drawingTitle').value,drawingNo:document.getElementById('drawingNo').value,standard:document.getElementById('smmStandard').value,date:document.getElementById('takeoffDate').value,sheetNo:document.getElementById('sheetNo').value,takerOff:document.getElementById('takerOff').value,checklistItems:this.checklistItems};localStorage.setItem('qto_project_'+name,JSON.stringify(data));localStorage.setItem('qto_last_project',name);alert('✅ Project saved: '+name)}loadProject(){const name=localStorage.getItem('qto_last_project');if(!name){alert('No saved projects found.');return}const data=JSON.parse(localStorage.getItem('qto_project_'+name));if(!data){alert('Project not found.');return}document.getElementById('projectName').value=data.name||'';document.getElementById('drawingTitle').value=data.drawingTitle||'';document.getElementById('drawingNo').value=data.drawingNo||'';document.getElementById('smmStandard').value=data.standard||'kenyan';document.getElementById('takeoffDate').value=data.date||'';document.getElementById('sheetNo').value=data.sheetNo||'';document.getElementById('takerOff').value=data.takerOff||'';this.checklistItems=data.checklistItems||[];this.selectedItems=[...this.checklistItems];this.renderChecklist();this.renderMeasurements();this.renderReinforcement();alert('✅ Project loaded: '+name)}clearAll(){if(confirm('Clear all takeoff data? This cannot be undone.')){this.selectedItems=[];this.checklistItems=[];this.renderChecklist();this.renderMeasurements();this.renderReinforcement();document.getElementById('totalsDisplay').innerHTML='';document.getElementById('costSummary').innerHTML='';document.getElementById('reportDisplay').style.display='none';document.getElementById('reportDisplay').innerHTML=''}}}
const takeoffSheet=new TakeoffSheet();
