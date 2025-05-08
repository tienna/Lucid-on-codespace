import { Blockfrost, Lucid, Crypto, fromText, Data, Addresses } from "https://deno.land/x/lucid/mod.ts";
 
const lucid = new Lucid({
  provider: new Blockfrost(
    "https://cardano-preview.blockfrost.io/api/v0",
    "xxxx",
  ),
});


const seed = "xxxxx"
lucid.selectWalletFromSeed(seed, { addressType: "Base", index: 0 });


const address = await lucid.wallet.address(); // Bech32 address
console.log (Đ/c ví gửi: ${address})   //Hiện thị địa chỉ ví
// Deno.exit(0); // Thoát chương trình