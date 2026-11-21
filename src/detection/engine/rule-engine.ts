//This is the main engine which will actually executes all the rules defined in the contract(AML Rules) and return the findings.


//Engine ko pata hona chahiye ke RiskLens mein kaun se AML rules available hain.
import type { AMLRule } from "./rule-interface.js";

import type { RuleContext } from "../types/rule-context.js";
import type { RuleFinding } from "../types/findings.js";


export class RuleEngine {
  private rules: Map<string, AMLRule> = new Map();
  //Map use kiya Engine mqin rules store karne ke liye - 
  // //Map mein hum har rule ko uski unique id ke against store karenge.
  //private ka matlab hai class ke bahar se koi directly rules Map modify nahi kar sakta.


  //ye registerRule() method rules ko Map main add karta hai
  registerRule(rule: AMLRule): void {
    //this if is to avoid duplicate rule registration
    if (this.rules.has(rule.id)) {
  throw new Error(`Rule with ID "${rule.id}" is already registered.`);
}
  this.rules.set(rule.id, rule);
  //rule: AMLRule — method sirf woh object accept karega jo AMLRule contract follow karta ho.
//void — method koi value return nahi karega.
//this.rules.set() — rule ko Map mein uski unique ID ke against store karega.
}

//this function is to execute registered rules
//1. to call evaluate(context) on every rule(input dena )
//2. to collect all the findings from each rule(output lena)
execute(context: RuleContext): RuleFinding[] {
const findings: RuleFinding[] = []; //Ye empty array is liye hai kyun ke abhi koi rule execute nahi hua, is liye findings bhi collect nahi hui.
for (const rule of this.rules.values()) {
const ruleFindings = rule.evaluate(context);
//rule.evaluate(context) : current rule ko execute karta hia
//context: is the transaction data that engine got as input
//ruleFindings are the findings returned by the rule after execution
findings.push(...ruleFindings);
}
return findings;
//Agar StructuringRule ko suspicious activity nahi milti, woh [] return karega.
//Agar activity milti hai, woh findings return karega.
}
} 

