// A timed-out native click may already have delivered its side effect.
export async function recoverNativeSavePause(page,record){
 const observed=await page.evaluate(()=>({paused:ageOfAsh.game.paused,phase:ageOfAsh.game.phase}));
 if(!observed.paused)return false;
 if(!await page.locator('#btn-resume').isVisible())throw Error('PAUSED_WITHOUT_NATIVE_RESUME');
 await page.locator('#btn-resume').click({timeout:5000});
 if(await page.evaluate(()=>ageOfAsh.game.paused))throw Error('SAVE_PAUSE_RECOVERY_FAILED');
 record('action',{command:'native-save-pause-recovered',observed});return true;
}
