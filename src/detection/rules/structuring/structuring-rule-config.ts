

export interface StructuringRuleConfig {
    //these values  are the CONFIGURATION for the structuring rule. 
    threshold: string;
    nearThresholdPercentage: number;
    minimumTransactionCount: number;
    windowDurationMs : number;   //Rule ko 24 hours ke milliseconds denge:
                                //24 * 60 * 60 * 1000

}

