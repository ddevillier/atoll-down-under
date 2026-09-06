import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',timeout:45000,use:{baseURL:'http://127.0.0.1:4173',viewport:{width:1440,height:810}},webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:true},reporter:[['list'],['json',{outputFile:'artifacts/e2e-results.json'}]],outputDir:'artifacts/e2e'});
