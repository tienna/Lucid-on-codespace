use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction} as tx

pub type Redeemer {
  msg: ByteArray,
}

validator parameters(admin_pkh: VerificationKeyHash) {
  spend(
    _datum_opt: Option<VerificationKeyHash>,
    redeemer: Redeemer,
    _input: OutputReference,
    tx: Transaction,
  ) {
    let must_say_hello = redeemer.msg == "Hello, Parameters!"
    let must_be_signed = list.has(tx.extra_signatories, admin_pkh)
    must_say_hello && must_be_signed
  }

  else(_) {
    fail
  }
}
