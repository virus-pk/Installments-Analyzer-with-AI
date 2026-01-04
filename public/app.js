
const btn=document.getElementById("go");
const t=document.getElementById("t");
const a=document.getElementById("analysis");
const ctx=document.getElementById("c").getContext("2d");
let chart;

btn.onclick=async()=>{
  btn.disabled=true;a.textContent="Working...";
  const r=await fetch("/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t.value})});
  const d=await r.json();
  const p=d.parsed;
  a.textContent=p.analysis_md||"";
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:"bar",data:{labels:p.chart.labels,datasets:p.chart.datasets},options:{responsive:true}});
  btn.disabled=false;
};
