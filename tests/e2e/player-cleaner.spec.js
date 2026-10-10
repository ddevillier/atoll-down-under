import {test, expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

for (const [name, id] of [['Bluestreak cleaner wrasse', 's43'], ['Banded coral shrimp', 's45']]) {
 test(name + ' helps an actual generated client through mouse controls', async ({page}) => {
  test.setTimeout(90000);
  // Keep generated parasites and the complete population; only the player's
  // energy is lowered to make the nourishment from real treatment observable.
  await page.addInitScript(() => {Date.now = () => 42;});
  for (const [width, height] of [[1600, 900], [1024, 768]]) {
   await page.setViewportSize({width, height});
   await page.goto('/');
   await page.waitForFunction(() => window.atoll?.renderer.ready);
   await clickButton(page, {name: /Practice Choose/});
   await page.getByRole('searchbox').fill(name);
   await page.getByRole('option').click();
   await clickButton(page, {name: 'Show goal', exact: true});
   await page.keyboard.press('Escape');
   expect(await page.evaluate(() => window.atoll.simulation.paused)).toBe(true);

   const client = await page.evaluate(async () => {
    const {canHelp, parasiteDamage} = await import('/src/player-cleaner.js');
    const {creaturePickFrame} = await import('/src/geometry.js');
    const s = window.atoll.simulation;
    s.player.energy = 50;
    const candidates = s.section.entities.filter(e => canHelp(e) && parasiteDamage(e) > 10)
     .sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y));
    // Target the current painted frame used by hit testing. A simulation-frame
    // center can select an overlapping neighbor while the fish is turning.
    const c = candidates.find(e => {const p = creaturePickFrame(e); return s.findAt(p.x, p.y) === e;});
    if (!c) throw Error('No generated client has a visible, unambiguous hit point');
    return {id: c.id, ...creaturePickFrame(c), health: c.health, parasites: parasiteDamage(c), roster: s.section.entities.map(e => e.id)};
   });
   const box = await page.locator('#reef').boundingBox();
   // Position the pointer during inspection, so no swim instruction is emitted
   // between Resume and the click that requests treatment.
   await page.mouse.move(box.x + client.x / 1600 * box.width, box.y + (client.y + 55) / 900 * box.height);
   expect(await page.evaluate(async ({id, x, y}) => {
    const {canHelp} = await import('/src/player-cleaner.js');
    const s = window.atoll.simulation, c = s.section.entities.find(e => e.id === id);
    return s.paused && canHelp(c) && s.findAt(x, y) === c;
   }, client)).toBe(true);
   await page.keyboard.press('Escape');
   await page.mouse.down();
   await page.mouse.up();
   await expect.poll(() => page.evaluate(() => window.atoll.simulation.player.service?.client), {timeout: 5000}).toBe(client.id);
   await page.waitForFunction(() => window.atoll.simulation.player.service?.elapsed > .5, null, {timeout: 30000});
   await page.keyboard.press('Escape');
   const contact = await page.evaluate(async () => {
    const {cleanerInspection} = await import('/src/cleaner-motion.js');
    const s = window.atoll.simulation, c = s.section.entities.find(e => e.id === s.player.service.client);
    return {gap: cleanerInspection(s.player, c).gap, removed: s.player.service.removed};
   });
   expect(contact.gap).toBeLessThanOrEqual(8);
   expect(contact.removed).toBeGreaterThan(0);
   await page.screenshot({path: `artifacts/player-cleaner-${id}-${width}-working.png`});
   const held = await page.evaluate(() => JSON.stringify(window.atoll.simulation.player.service));
   await page.waitForTimeout(100);
   expect(await page.evaluate(() => JSON.stringify(window.atoll.simulation.player.service))).toBe(held);

   await page.keyboard.press('Escape');
   await page.waitForFunction(() => !window.atoll.simulation.player.service, null, {timeout: 15000});
   await page.keyboard.press('Escape');
   const result = await page.evaluate(id => {
    const s = window.atoll.simulation, c = s.section.entities.find(e => e.id === id);
    return {health: c.health, energy: s.player.energy, clients: s.adventure.clients, roster: s.section.entities.map(e => e.id), helper: !!window.atoll.journal.earned.helper};
   }, client.id);
   expect(result.health).toBeGreaterThan(client.health + 9);
   expect(result.energy).toBeGreaterThan(50);
   expect(result.clients.length).toBe(1);
   expect(result.roster).toEqual(client.roster);
   expect(result.helper).toBe(true);
   await page.screenshot({path: `artifacts/player-cleaner-${id}-${width}-complete.png`});
  }
 });
}
