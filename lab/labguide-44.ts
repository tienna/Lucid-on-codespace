import { Blockfrost, Lucid, } from "https://deno.land/x/lucid/mod.ts";
import "jsr:@std/dotenv/load";

// Lấy các biến từ env
const Bob_mnonic = Deno.env.get("MNEMONIC");
const BLOCKFROST_ID = Deno.env.get("BLOCKFROST_ID");
const BLOCKFROST_NETWORK = Deno.env.get("BLOCKFROST_NETWORK")

const lucid = new Lucid({
    provider: new Blockfrost(
      BLOCKFROST_NETWORK,
      BLOCKFROST_ID,
    ),
  });

lucid.selectWalletFromSeed(Bob_mnonic);

/** Convert a Utf-8 encoded string to a Hex encoded string. */
export function fromText(text: string): string {
  return toHex(new TextEncoder().encode(text));
}


// Tạo minting policy. Chỉ những người sở hữu khóa chính sách mới có thể đúc hoặc đốt mã thông báo được tạo theo chính sách cụ thể này.
const { paymentCredential } = lucid.utils.getAddressDetails(
    await lucid.wallet.address(),
  );
  
  const mintingPolicy = lucid.utils.nativeScriptFromJson(
    {
      type: "all",
      scripts: [
        { type: "sig", keyHash: paymentCredential.hash },
        {
          type: "before",
          slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000),
        },
      ],
    },
  );

const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
const unit = policyId + fromText("LUCID");

// tạo giao dịch mint 100 token Lucid
const tx = await lucid.newTx()
  .mintAssets({ [unit]: 100n })
  .validTo(Date.now() + 200000)
  .attachMintingPolicy(mintingPolicy)
  .complete();
const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();
console.log(`Mã giao dịch là: ${txHash}`);





