import { Blockfrost, Lucid, fromText,} from "https://deno.land/x/lucid@0.10.7/mod.ts";

//Nhập vào API KEY cho mạng Preview
const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4XXXXX",),"Preview",);

// Nhập vào 24 ký tự ví của Bob
const Bob_mnonic = "điền 24 ký tự vào đây";
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





