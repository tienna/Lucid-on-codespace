use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  owner: VerificationKeyHash,
}

pub type Redeemer {
  msg: ByteArray,
}

validator hello_parameterized(owner: VerificationKeyHash) {
  spend(
    _datum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    let must_say_hello = redeemer.msg == "Hello, BK03"  
    let must_be_signed = list.has(self.extra_signatories, owner)
    must_say_hello? && must_be_signed?
  }

  else(_) {
    fail
  }
}
