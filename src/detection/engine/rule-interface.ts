//Interface = Rules / Agreement (contract) ke har rule ko kis structure ko follow karna lazmi hai.

import type { RuleContext } from "../types/rule-context.js";
import type { RuleFinding } from "../types/findings.js";

export interface AMLRule {
  id: string;
  name: string;
  description: string;

  evaluate(context: RuleContext): RuleFinding[];
  //evaluates returns an array because:Ek rule ek transaction par zero, one, ya multiple findings generate kar sakta hai. For example, future mein ek transaction multiple AML conditions trigger kar sakti hai.
  //Aur evaluate() synchronous rakha hai: rules ko database ya Redis directly access nahi karna chahiye. Engine pehle required data prepare karega, phir rule ko context dega.
}

