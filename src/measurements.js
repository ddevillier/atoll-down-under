// Source strings remain untouched; only the guide's length summary is formatted.
export function lengthSummary(text,metric=true){
 if(!text||metric)return text||'';
 let converted=false;
 const result=text.replace(/\b(\d+(?:\.\d+)?)\s+(cm|m)\b(?:\s+\(\d+(?:\.\d+)?\s+(?:inches|feet)\))?/g,(_,value,unit)=>{
  converted=true;
  const amount=Math.round((Number(value)*(unit==='m'?100:1)/(unit==='m'?30.48:2.54))*10)/10;
  return amount+' '+(unit==='m'?(amount===1?'foot':'feet'):(amount===1?'inch':'inches'));
 });
 return converted?result+' (approx.)':result;
}
