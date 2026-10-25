// Evaluation only. Not imported by production main.js. Debt is retained, not discarded.
export class FixedStepPrototype {
 constructor(step=1/60,maxSteps=8){this.step=step;this.maxSteps=maxSteps;this.debt=0;}
 advance(elapsed,update){if(!Number.isFinite(elapsed)||elapsed<0)return 0;this.debt+=elapsed;let n=0;while(this.debt+1e-10>=this.step&&n<this.maxSteps){update(this.step);this.debt=Math.max(0,this.debt-this.step);n++;}return n;}
 snapshot(){return {step:this.step,maxSteps:this.maxSteps,debt:this.debt};}
 restore(s){if(!s||!(s.step>0)||!Number.isFinite(s.debt)||s.debt<0||!Number.isInteger(s.maxSteps)||s.maxSteps<1)throw Error('Invalid clock');Object.assign(this,s);}
}
