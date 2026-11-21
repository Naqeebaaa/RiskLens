import { redis } from "../config/redis.js"

const CLAIM_TTL = 60;

export async function claimTransaction(
  transactionId: string,
  claimToken: string
): Promise<boolean> {
  const result = await redis.set(
    `processing:${transactionId}`,
    claimToken,
    "EX",
    CLAIM_TTL,
    "NX"
  );

  return result === "OK";
}
// - transactionId — kis transaction ko claim karna hai.
// - claimToken — is particular consumer attempt ki unique identity.
// - EX, 60 — claim 60 seconds baad expire hogi.
// - NX — agar key pehle se exist karti hai toh claim nahi milegi.
// - result === "OK" — claim successful hui toh true, warna false.
// Claim token kyun? Taake ek consumer doosre consumer ki claim ko galti se release na kar sake.







//Ye Redis mein permanent completed marker save karega (jab tak explicitly expire/delete na ho).
export async function markTransactionProcessed(
    transactionId: string
): Promise<void> {
    await redis.set(
        `processed:${transactionId}`,
        "1"
    );
}

export async function releaseTransactionClaim(
    transactionId: string,
    claimToken: string
): Promise<void> {
    const key = `processing:${transactionId}`;

    const script = `
       if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    end

    return 0
    `;

    await redis.eval(script, 1, key, claimToken);
//script :Lua script Redis will execute
//1:	Number of Redis keys used by the script
// key:	The actual Redis key
//claimToken: The token passed to the Lua script
}


//Lua script:Lua ek lightweight scripting language hai jo Redis ke andar execute ho sakti hai.
//Redis supports Lua scripts through EVAL. This script prevent consumer A from accidently deleting 
// the claim as one atomic operation
//  SET NX is useful for creating a claim only if it doesn't exist.
// Lua is useful for checking ownership and deleting the claim as one atomic operation.
// Different problems, different operations.




//we'll also make sure a completed transaction can never be claimed again, even after its temporary claim expires.
export async function isTransactionProcessed(
  transactionId: string
): Promise<boolean> {
  const result = await redis.exists(`processed:${transactionId}`);

  return result === 1;
}