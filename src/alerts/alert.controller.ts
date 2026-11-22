// controller ki responsibility hogi:
// 1. getAlerts() service call karna.
// 2. Retrieved alerts ko HTTP response mein return karna.
// 3. Database error aaye to appropriate error response dena

import type { Request, Response } from "express";
import { getAlerts } from "./alert-retrieval.service.js";

export async function  getAlertsController(
  req: Request,
  res: Response
) {
    try{
        const alerts = await getAlerts();
        return res.status(200).json({
  "success": true,
  "count": alerts.length, // yani kitne alerts retrieve hue
  "data": alerts //actual alerts array
});
} catch(error){
  console.error("Failed to retrieve alerts:", error);
    return res.status(500).json({
      "success": false
    });
}
}