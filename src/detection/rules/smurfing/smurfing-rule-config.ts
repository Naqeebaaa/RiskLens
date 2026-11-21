//Purpose of Rule: Temporal and Spatial Smurfing:
//, Pattern 2 detects deposits into the same customer account from multiple locations within four hours.
// Ab RiskLens kya karega?
// 1. Customer ke account ki previous cash deposits retrieve karega.
// 2. Last 4 hours ki deposits dekhega.
// 3. Check karega ke minimum 4 deposits hui hain.
// 4. Check karega ke deposits minimum 3 different locations par hui hain.
// RiskLens ek finding generate karega:
// "Potential temporal and spatial smurfing detected: 4 cash deposits across 3 unique locations within 4 hours."
// Important: Iska matlab customer money laundering kar raha hai, ye prove nahi hota. Ye sirf suspicious activity ka indicator hai jo human analyst investigate karega.
// Rule ka core idea: Same account + repeated cash deposits + multiple locations + short time window



export interface SmurfingRuleConfig{
    windowDurationMs: number;
minimumTransactionCount: number;
minimumUniqueLocations: number;
currency: string
}