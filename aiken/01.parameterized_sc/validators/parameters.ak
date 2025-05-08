use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction} as tx

pub type Redeemer {
  msg: ByteArray,
}

validator validate(owner: VerificationKeyHash) {
  spend(
    _datum: Option<Redeemer>,
    redeemer: Redeemer,
    _input: OutputReference,
    _tx: Transaction,
  ) {
    let must_say_hello = redeemer.msg == "Unlokc for me"
    must_say_hello
  }

  else(_) {
    fail
  }
}
