use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Address}
use cardano/assets.{PolicyId, lovelace_of}
use cardano/transaction.{Output, Transaction} as tx

pub type Action {
  Mint
  Burn
}

validator gift_card(
  token_name: ByteArray,
  platform_fee: Int,
  platform_payment_credential: ByteArray,
) {
  mint(rdmr: Action, policy_id: PolicyId, transaction: Transaction) {
    let Transaction { mint, outputs, .. } = transaction
    let output_utxo_platform =
      find_output(outputs, platform_fee, platform_payment_credential)
    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    when rdmr is {
      Mint -> amount == 1 && asset_name == token_name && output_utxo_platform
      // Unlock asset
      Burn -> amount == -1 && asset_name == token_name && output_utxo_platform
    }
  }

  else(_) {
    fail
  }
}

fn find_output(outputs: List<Output>, fee: Int, addr_cred: ByteArray) {
  list.any(
    outputs,
    fn(output) {
      lovelace_of(output.value) >= fee && output.address.payment_credential == address.from_verification_key(
        addr_cred,
      ).payment_credential
    },
  )
}
