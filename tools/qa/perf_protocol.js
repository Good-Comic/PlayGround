// Reproducible local-only load fixtures. Production AI/update/render remain enabled.
export function setup(count, mode) {
  const {game:g,renderer}=window.ageOfAsh;
  g.newRun(window.ageOfAsh.seedFromString('phase-a-perf'),{civ:'TEU',biome:'steppe'});
  g.inMenu=false;g.paused=false;g.autoEconomy=false;g.autoMilitary=false;
  g.phase='prep';g.prepTimer=1e6;g.speed=1;g.units=[];g.buildings=[];g.crowd=null;g.hero=null;
  g.navigationQueue=[];g.navigationQueued=new Set();g.navigationStats={totalSearches:0};
  g.world.resources=[];g.world.props=[];g.world.wildlife=[];g.world.camps=[];
  for(const t of g.world.tiles)t.terrain='grass';
  renderer.terrainKey='';
  g.camera={x:0,y:800,targetX:0,targetY:800,zoom:.45,targetZoom:.45};
  const cols=mode==='combat'?28:Math.ceil(Math.sqrt(count)),spacing=(mode==='combat'?48:38)/Math.max(cols,2),spacingY=mode==='combat'?48/Math.ceil(count/cols):spacing,offset=mode==='combat'?1:5,origins=new Map();
  const composition={};
  if(mode==='economy'){g.autoEconomy=true;g.addBuilding('core',23,23,true);for(let i=0;i<80;i++){const resource=['food','wood','gold','stone'][i%4];g.world.resources.push({id:10000+i,x:3+(i%10)*4.5,y:3+Math.floor(i/10)*5.5,resource,kind:resource==='wood'?'oak':resource==='food'?'berry':'ore',amount:30,maxAmount:30,radius:.32,alive:true});}}
  for(let i=0;i<count;i++) {
    const x=offset+(i%cols)*spacing,y=offset+Math.floor(i/cols)*spacingY;
    const type=mode==='combat'?'guard':mode==='economy'?'villager':'militia';
    const team=mode==='combat'&&i%2?'enemy':'player';
    const u=g.spawnUnit(type,x,y,team);if(!u)throw Error(`Spawn failed ${i}/${count}`);
    u.stance=mode==='combat'?'aggressive':'passive';
    origins.set(u.id,{x:u.x,y:u.y});composition[`${team}:${type}`]=(composition[`${team}:${type}`]||0)+1;
    if(mode==='move')g.commandMove([u],x+.6,y+.6);
    else if(mode==='economy')g.orderGather(u,g.findResource(['food','wood','gold','stone'][i%4],u.x,u.y));
  }
  window.audit={count,mode,origins,composition,moved:new Set(),firstMoves:new Map(),attacks:0,kills:0,started:performance.now()};
  return {seed:g.seed,count,mode,composition,spacing,spacingY,obstacles:mode==='economy'?21:0,commands:mode==='move'?'Each unit alternates origin and (+0.6,+0.6), immediate reissue on idle':'Natural interleaved 500v500 standard guard combat; no HP/damage/AI changes',speed:g.speed,dpr:devicePixelRatio};
}
export function install(detailed=false) {
  const {game:g,renderer,ui}=ageOfAsh;
  const stats={enabled:false,frames:[],frameWork:[],update:[],draw:[],ui:[],simDt:[],observer:[],nav:[],searches:[],expanded:[],pending:[],alive:[],heap:[],sub:{},routeReuse:0,routeMiss:0,steps:0};
  const original={};let frameStart=0;
  for(const [object,key,name] of [[g,'update','update'],[renderer,'draw','draw'],[ui,'update','ui']]) {
    original[name]=object[key].bind(object);
    object[key]=(...args)=>{
      const start=performance.now();if(name==='update')frameStart=start;
      const value=original[name](...args);
      if(stats.enabled){stats[name].push(performance.now()-start);if(name==='update')stats.simDt.push(args[0]*1000);if(name==='ui')stats.frameWork.push(performance.now()-frameStart);}
      return value;
    };
  }
  const attack=g.attackUnit.bind(g),kill=g.killEntity.bind(g);
  g.attackUnit=(...args)=>{if(stats.enabled) audit.attacks++;return attack(...args);};
  g.killEntity=(...args)=>{if(stats.enabled&&args[0]?.alive)audit.kills++;return kill(...args);};
  if(detailed) {
    for(const key of ['stepToward','segmentWalkable','isWalkable','updateUnits','updateEnemy','updatePlayerUnit','acquireTarget','nearestPlayerTarget','nearestEnemyAt','findResource','findReachableResource','updateGather','updateReturn']) {
      const fn=g[key].bind(g);stats.sub[key]={calls:0,ms:0,max:0};
      g[key]=(...args)=>{
        const start=performance.now(),u=args[0],cached=key==='stepToward'&&u?._nav?.status==='ready'&&u._nav.points?.length;
        const searches=g.navigationStats?.totalSearches||0;const value=fn(...args);
        if(stats.enabled){const ms=performance.now()-start,s=stats.sub[key];s.calls++;s.ms+=ms;s.max=Math.max(s.max,ms);if(key==='stepToward'){stats.steps++;if(cached&&u?._nav?.status==='ready'&&(g.navigationStats?.totalSearches||0)===searches)stats.routeReuse++;else stats.routeMiss++;if(value==='pending'&&(g.navigationStats?.totalSearches||0)===searches)stats.queueWait=(stats.queueWait||0)+1;}}
        return value;
      };
    }
    for(const key of ['drawUnit','drawTerrain','drawParticles','drawProjectiles','drawAtmosphere']) {
      const fn=renderer[key].bind(renderer);stats.sub[`renderer.${key}`]={calls:0,ms:0,max:0};
      renderer[key]=(...args)=>{const start=performance.now(),value=fn(...args);if(stats.enabled){const ms=performance.now()-start,s=stats.sub[`renderer.${key}`];s.calls++;s.ms+=ms;s.max=Math.max(s.max,ms);}return value;};
    }
    // Every new Crowd instance uses the same prototype.
    import('/js/crowd.js').then(({Crowd})=>{
      for(const key of ['nearby','steer']) {
        const fn=Crowd.prototype[key];stats.sub[`crowd.${key}`]={calls:0,ms:0,max:0};
        Crowd.prototype[key]=function(...args){const start=performance.now(),value=fn.apply(this,args);if(stats.enabled){const ms=performance.now()-start,s=stats.sub[`crowd.${key}`];s.calls++;s.ms+=ms;s.max=Math.max(s.max,ms);}return value;};
      }
    });
  }
  window.auditStats=stats;
}
export async function run(warmup,seconds,mode,count) {
  const stats=auditStats;
  // The same observer and command policy runs during warmup and measurement.
  let last=performance.now(),lastSample=0;const started=last;
  await new Promise(resolve=>{
    function frame(now){
      const observerStart=performance.now(),elapsed=(now-started)/1000,g=ageOfAsh.game;
      if(!stats.enabled&&elapsed>=warmup){stats.enabled=true;stats.simStart=g.time;performance.mark('AUDIT_MEASURE_START');audit.attacks=0;audit.kills=0;last=now;}
      for(const u of g.units){
        const o=audit.origins.get(u.id);if(!o)continue;
        if(Math.hypot(u.x-o.x,u.y-o.y)>.15){audit.moved.add(u.id);if(!audit.firstMoves.has(u.id))audit.firstMoves.set(u.id,(now-audit.started)/1000);}
        if(mode==='move'&&u.alive&&u.state==='idle') {
          const away=Math.hypot(u.x-o.x,u.y-o.y)>.4;g.commandMove([u],o.x+(away?0:.6),o.y+(away?0:.6));
        }
      }
      if(stats.enabled) {
        if(now>last)stats.frames.push(now-last);
        stats.nav.push(g.navigationStats?.ms||0);stats.searches.push(g.navigationStats?.searches||0);stats.expanded.push(g.navigationStats?.expanded||0);
        if(now-lastSample>250){lastSample=now;stats.pending.push(g.navigationQueue?.length||0);stats.alive.push(g.units.filter(u=>u.alive).length);stats.heap.push(performance.memory?.usedJSHeapSize||null);}
        stats.observer.push(performance.now()-observerStart);
      }
      last=now;
      if(elapsed<warmup+seconds)requestAnimationFrame(frame);else{performance.mark('AUDIT_MEASURE_END');stats.enabled=false;resolve();}
    }
    requestAnimationFrame(frame);
  });
  return {raw:stats,units:gCount(),mode,seed:ageOfAsh.game.seed,composition:audit.composition,moved_fraction:audit.moved.size/count,moved_fraction_15s:[...audit.firstMoves.values()].filter(t=>t<=15).length/count,first_move_latency_seconds:[...audit.origins.keys()].map(id=>audit.firstMoves.get(id)??null),attacks:audit.attacks,kills:audit.kills,sim_time:ageOfAsh.game.time,measured_sim_seconds:ageOfAsh.game.time-stats.simStart,phase:ageOfAsh.game.phase,navigation:ageOfAsh.game.navigationStats,elapsed_wall_seconds:(performance.now()-started)/1000};
}
function gCount(){return ageOfAsh.game.units.length;}
