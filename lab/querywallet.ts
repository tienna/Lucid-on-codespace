import { Blockfrost, Lucid } from "https://deno.land/x/lucid/mod.ts";

const lucid = await Lucid.new(
    new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0", "preview4QbiejGzlyhUgfvyXZNf8lDEIFjCHjP0",
    ),
    "Preview",
);

//const privateKey = lucid.utils.generatePrivateKey(); // Bech32 encoded private key
//await Deno.writeTextFile('./privateKey', privateKey);
const privateKey = await Deno.readTextFile("./privateKey");
lucid.selectWalletFromPrivateKey(privateKey);
console.log (await lucid.wallet.address())


const utxos = await lucid.wallet.getUtxos()
console.log(utxos)