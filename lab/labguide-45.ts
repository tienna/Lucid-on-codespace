import { Blockfrost, Lucid, fromText,} from "https://deno.land/x/lucid@0.10.7/mod.ts";

//Nhập vào API KEY cho mạng Preview
const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4XXXXX",),"Preview",);

// Nhập vào 24 ký tự ví của Bob
const Bob_mnonic = "điền 24 ký tự vào đây";
lucid.selectWalletFromSeed(Bob_mnonic);


// Tạo minting policy. Chỉ những người sở hữu khóa chính sách mới có thể đúc hoặc đốt mã thông báo được tạo theo chính sách cụ thể này.
const rewardAddress = await lucid.wallet.rewardAddress();

// Đăng ký stake key tương ứng với ví
const tx = await lucid.newTx()
  .registerStake(rewardAddress)
  .complete();

const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();
 
// Delegate số lượng ADA có vào Pool có Pool_id=pool1j3x329u0uxh9s9vjvsad9kx37tzal8gndz6ttxumcz4nw947djw
const tx1 = await lucid.newTx()
  .delegateTo(rewardAddress, "pool1j3x329u0uxh9s9vjvsad9kx37tzal8gndz6ttxumcz4nw947djw")
  .complete();

const signedTx1 = await tx1.sign().complete();
const txHash1 = await signedTx1.submit();
console.log(`Mã giao dịch Delegate ADA là ${txHash1}}`)



