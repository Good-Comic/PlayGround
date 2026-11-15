export function fixture(g){
 g.newRun(42,{civ:'SPA',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=10;
 const leader=g.spawnUnit('brute',4.2,3,'enemy'),follower=g.spawnUnit('brute',3,3,'enemy'),attacker=g.spawnUnit('villager',4.9,3,'player');
 leader.state='move';leader.targetPos={x:3.5,y:3};g.navigationBudget=2;g.stepToward(leader,3.5,3,.01);
 if(!(leader._heading?.x<0))throw Error('missing native movement history');
 follower.state='attack';follower.target=attacker;follower.retargetTimer=10;attacker.state='hold';attacker.hold=true;attacker.stance='passive';
 return{g,leader,follower,attacker};
}
