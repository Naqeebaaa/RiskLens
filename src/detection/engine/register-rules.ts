import { RuleEngine } from "./rule-engine.js";
import { StructuringRule } from "../rules/structuring/structuring-rule.js";
import { SmurfingRule } from "../rules/smurfing/smurfing-rule.js";
import { RapidPassThroughRule } from "../rules/RapidFundMovement/rapid-pass-through-rule.js";
import { DormantAccountRule } from "../rules/DormantAccount/dormant-account-rule.js";
import {
  structuringConfig,
  smurfingConfig,
  rapidPassThroughConfig,
  dormantAccountConfig,
} from "./rule-config.js";



//this createRuleEngine() instantiate rules from configs and register them
//Ab jab bhi kisi component ko engine chahiye, usay 4 rules individually
// register karne ki zaroorat nahi. createRuleEngine() call karke configured engine mil jayega.
export function createRuleEngine(): RuleEngine {
  const ruleEngine = new RuleEngine(); //creates engine

  //registering every AML Rule into the engine
  ruleEngine.registerRule(new StructuringRule(structuringConfig));  //new StructuringRule(config) — rule ki instance banata hai with its configuration.
  ruleEngine.registerRule(new SmurfingRule(smurfingConfig));
  ruleEngine.registerRule(new RapidPassThroughRule(rapidPassThroughConfig));
  ruleEngine.registerRule(new DormantAccountRule(dormantAccountConfig));

  return ruleEngine;
}