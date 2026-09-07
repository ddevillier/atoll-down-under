// Follow the visible home menus when an action is inside a closed disclosure.
export async function clickButton(page,options){
 let target=page.getByRole('button',{...options,includeHidden:true});
 if(options.name==='Enter the reef'&&await target.count()===0)target=page.getByRole('button',{name:'Explore freely',exact:true,includeHidden:true});
 if(!await target.isVisible()){
  const menu=await target.evaluate(e=>e.closest('.splash-menu')?.querySelector('summary').textContent);
  if(menu)await page.getByText(menu,{exact:true}).click();
 }
 await target.click();
}
