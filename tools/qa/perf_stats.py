"""Nearest-rank quantiles; legacy gate stays on rAF intervals, never JS-only time."""
import math

def distribution(values):
 values=[float(x) for x in values if x is not None]
 if not values:return {'n':0,'mean':None,'p50':None,'p95':None,'p99':None,'max':None}
 ordered=sorted(values)
 def q(p):return ordered[max(0,math.ceil(len(ordered)*p)-1)]
 return {'n':len(values),'mean':sum(values)/len(values),'p50':q(.5),'p95':q(.95),'p99':q(.99),'max':ordered[-1]}

def gates(result):
 d=distribution(result['raw']['frames'])
 checks={'raf_mean_le_33_3':d['mean'] is not None and d['mean']<=33.3,'raf_p95_le_50':d['p95'] is not None and d['p95']<=50,'movement_ge_90_percent_at_15s':result['moved_fraction_15s']>=.9,'searches_per_update_le_2':max(result['raw']['searches'],default=0)<=2}
 if result['mode']=='combat':checks.update({'actual_attacks_ge_100':result['attacks']>=100,'mean_alive_ge_900':distribution(result['raw']['alive'])['mean']>=900})
 return checks
