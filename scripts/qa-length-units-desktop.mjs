import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';
const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const isolatedProfile=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));expect(isolatedProfile).toBe(true);
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Settings',exact:true});
 await expect(page.getByLabel('Metric length summaries (cm / m)')).toBeChecked();
 await page.getByLabel('Metric length summaries (cm / m)').uncheck();await clickButton(page,{name:'Done',exact:true});
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Field guide',exact:true});await page.getByRole('searchbox').fill('Moorish idol');await page.getByRole('option').click();
 await page.locator('.natural-history>summary').click();
 await expect(page.locator('.natural-history-body>p').first()).toContainText('9.4 inches standard length (without the tail fin) (approx.)');
 await clickButton(page,{name:'Return',exact:true});await clickButton(page,{name:'Settings',exact:true});
 await expect(page.getByLabel('Metric length summaries (cm / m)')).not.toBeChecked();
 await page.getByLabel('Metric length summaries (cm / m)').check();await clickButton(page,{name:'Done',exact:true});
 await clickButton(page,{name:'Field guide',exact:true});await page.getByRole('searchbox').fill('Moorish idol');await page.getByRole('option').click();
 await page.locator('.natural-history>summary').click();
 await expect(page.locator('.natural-history-body>p').first()).toContainText('24 cm standard length (without the tail fin)');
 expect(errors).toEqual([]);
 const report={surface:executablePath?'packaged Windows':'source Electron',isolatedProfile,metricDefault:true,imperialVerified:true,persistenceVerified:true,metricRestored:true,errors};
 fs.writeFileSync('artifacts/native-length-units-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await app.close();}
