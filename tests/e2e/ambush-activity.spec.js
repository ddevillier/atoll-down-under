import {test, expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {mkdir, writeFile} from 'node:fs/promises';

test('frogfish aims without leaving its ambush, catches generated prey and records the discovery', async ({page}) => {
 test.setTimeout(300000);
 // Generate the fixed world through the normal Practice menu, preserving all
 // production animals, positions, physiology, and progress.
 await page.addInitScript(() => {Date.now = () => 42;});
 await mkdir('artifacts/ambush', {recursive: true});
 for (const [width, height] of [[1600, 900], [1024, 768]]) {
  await page.setViewportSize({width, height});
  await page.goto('/');
  await page.waitForFunction(() => window.atoll?.renderer.ready);
  await clickButton(page, {name: /Practice Choose/});
  await page.getByRole('searchbox').fill('Painted frogfish');
  await page.getByRole('option').click();
  await clickButton(page, {name: 'Show goal', exact: true});
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.atoll.simulation.paused)).toBe(true);

  const initial = await page.evaluate(async () => {
   const {contactGap} = await import('/src/feeding-contact.js');
   const s = window.atoll.simulation;
   window.ambushEvidence = {bites: [], attempts: [], sites: []};
   const consume = s.consume;
   // Observe the real consumption contact; never replace its result or timing.
   s.consume = function (food) {
    if (this.player.ambush?.strike > 0 && this.player.ambush.target === food.id) {
     window.ambushEvidence.bites.push({id: food.id, gap: contactGap(this.player, food), anticipation: this.player.feeding?.elapsed, strike: this.player.ambush.strike, alive: food.alive, time: this.time});
    }
    return consume.call(this, food);
   };
   return {roster: s.sections.flatMap(r => r.entities.map(e => e.id)), time: s.time};
  });
  async function chooseSite() {
   return page.evaluate(async () => {
    const {edible} = await import('/src/simulation.js');
    const {sitesFor} = await import('/src/adventures.js');
    const s = window.atoll.simulation;
    const score = p => s.section.entities.filter(e => e.alive && !e.hidden && edible(s.player, e) && !e.species.poison && Math.hypot(e.x - p.x, e.y - p.y) < 340).length;
    const sites = sitesFor(s).sort((a, b) => score(b) - score(a) || Math.hypot(s.player.x - a.x, s.player.y - a.y) - Math.hypot(s.player.x - b.x, s.player.y - b.y));
    const site = sites[0];
    window.ambushEvidence.sites.push({id: site.id, time: s.time, nearbyPrey: score(site)});
    return site;
   });
  }
  const box = await page.locator('#reef').boundingBox();
  const screen = p => ({x: box.x + p.x / 1600 * box.width, y: box.y + (p.y + 55) / 900 * box.height});
  const move = async p => {const pt = screen(p); await page.mouse.move(pt.x, pt.y);};
  let site = await chooseSite();
  await page.keyboard.press('Escape');
  await move(site);
  await page.waitForFunction(site => Math.hypot(window.atoll.simulation.player.x - site.x, window.atoll.simulation.player.y - site.y) < 25, site, {timeout: 30000});
  await page.keyboard.press('e');
  await page.waitForFunction(() => window.atoll.simulation.player.ambush?.settled >= 2);
  await page.keyboard.press('Escape');
  const frozen = await page.evaluate(() => window.atoll.simulation.serialize());
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.atoll.simulation.serialize())).toBe(frozen);
  await page.screenshot({path: `artifacts/ambush-${width}-waiting.png`});
  await page.keyboard.press('Escape');
  const waiting = await page.evaluate(() => ({x: window.atoll.simulation.player.x, y: window.atoll.simulation.player.y}));
  await move({x: waiting.x + 90, y: waiting.y - 30});
  await page.waitForTimeout(100);
  const aimed = await page.evaluate(() => ({x: window.atoll.simulation.player.x, y: window.atoll.simulation.player.y, settled: window.atoll.simulation.player.ambush?.settled}));
  expect(aimed.settled).toBe(2);
  expect(aimed.x).toBe(waiting.x);
  expect(aimed.y).toBe(waiting.y);

  const deadline = Date.now() + 120000;
  let reassessAt = await page.evaluate(() => window.atoll.simulation.time + 20);
  let complete = false;
  while (Date.now() < deadline) {
   const state = await page.evaluate(async site => {
    const {edible} = await import('/src/simulation.js');
    const {creaturePickFrame} = await import('/src/geometry.js');
    const {defended} = await import('/src/ability-rules.js');
    const s = window.atoll.simulation, p = s.player;
    const candidates = s.section.entities.filter(e => e.alive && !e.hidden && !e.stun && !e.species.poison && !defended(e) && edible(p, e) && Math.hypot(p.x - e.x, p.y - e.y) <= 105)
     .sort((a, b) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(p.x - b.x, p.y - b.y));
    const e = candidates.find(e => {const f = creaturePickFrame(e); return s.findAt(f.x, f.y) === e;});
    return {complete: s.adventure.complete, ambush: p.ambush, time: s.time, near: Math.hypot(p.x - site.x, p.y - site.y) < 25, prey: e ? {id: e.id, ...creaturePickFrame(e), aligned: Math.cos(p.angle - Math.atan2(e.y - p.y, e.x - p.x)) > .97} : null};
   }, site);
   if (state.complete) {complete = true; break;}
   // Real visitors can depart or defend themselves. Reassess the live reef and
   // swim to another authored site rather than endlessly camping its old score.
   if (state.time >= reassessAt && !(state.ambush?.strike > 0)) {
    if (state.ambush) await page.keyboard.press('e');
    site = await chooseSite();
    await move(site);
    reassessAt = state.time + 20;
   } else if (!state.ambush) {
    if (state.near) await page.keyboard.press('e');
    else await move(site);
   } else if (state.ambush.settled >= 2 && !state.ambush.strike && state.prey) {
    // Aim first: the burst lasts only 0.8 seconds, including a real 0.24-second
    // bite anticipation. A click at the outer radius is not a promised catch.
    await move(state.prey);
    if (state.prey.aligned) {
     await page.mouse.down();
     await page.mouse.up();
     await page.evaluate(id => {
      const s = window.atoll.simulation;
      window.ambushEvidence.attempts.push({id, time: s.time, actualTarget: s.player.ambush?.target, strike: s.player.ambush?.strike});
     }, state.prey.id);
    }
   }
   await page.waitForTimeout(100);
  }
  await page.keyboard.press('Escape');
  const evidence = await page.evaluate(() => {
   const s = window.atoll.simulation;
   return {...window.ambushEvidence, complete: s.adventure.complete, caught: s.adventure.ambushCatch, roster: s.sections.flatMap(r => r.entities.map(e => e.id)), discoveries: window.atoll.journal.discoveries, consumed: window.ambushEvidence.bites.map(b => ({id: b.id, alive: s.sections.flatMap(r => r.entities).find(e => e.id === b.id)?.alive})), time: s.time};
  });
  await writeFile(`artifacts/ambush/confirmation-${width}.json`, JSON.stringify(evidence, null, 2));
  expect(complete, JSON.stringify(evidence)).toBe(true);
  expect(evidence.complete).toBe(true);
  expect(evidence.caught).toBe(true);
  expect(evidence.roster).toEqual(initial.roster);
  expect(evidence.bites.length).toBe(1);
  expect(evidence.bites[0].alive).toBe(true);
  expect(evidence.bites[0].gap).toBeLessThanOrEqual(3);
  expect(evidence.bites[0].anticipation).toBeGreaterThanOrEqual(.24);
  expect(evidence.bites[0].strike).toBeGreaterThan(0);
  expect(evidence.consumed[0].alive).toBe(false);
  expect(evidence.discoveries).toContain('frogfish-ambush');
  await page.screenshot({path: `artifacts/ambush-${width}-complete.png`});
 }
});
