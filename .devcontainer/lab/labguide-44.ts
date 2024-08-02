import { Blockfrost, Lucid, fromText,} from "https://deno.land/x/lucid@0.10.7/mod.ts";
const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4QbiejGzlyhUgfvyXZNf8lDEIFjCHjP0",),"Preview",);

//===============Active Bob Wallet ==============================
const Bob_mnonic = "lottery novel civil green oppose whip offer correct mushroom cricket awkward vague shine another tree boss there perfect asset side release song wedding captain";
lucid.selectWalletFromSeed(Bob_mnonic);

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





