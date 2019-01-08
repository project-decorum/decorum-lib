import sodium from 'libsodium-wrappers-sumo';

/**
 * @returns Tuple array with secret in first index, public in second.
 */
export async function generateKeyPair(): Promise<[Buffer, Buffer]> {
  await sodium.ready;

  const keyPair = sodium.crypto_sign_keypair();

  return [
    new Buffer(keyPair.privateKey),
    new Buffer(keyPair.publicKey),
  ];
}

export async function getPublicKey(privKey: Buffer) {
  await sodium.ready;

  const pk = sodium.crypto_sign_ed25519_sk_to_pk(privKey);

  return Buffer.from(pk.buffer);
}

export async function sign(privKey: Buffer, data: Buffer) {
  await sodium.ready;

  return Buffer.from(sodium.crypto_sign_detached(data, privKey).buffer);
}

export async function verify(msg: Buffer, signature: Buffer, pubKey: Buffer) {
  await sodium.ready;

  return sodium.crypto_sign_verify_detached(signature, msg, pubKey);
}

export async function generateSymmetric() {
  await sodium.ready;

  return Buffer.from(sodium.randombytes_buf(32).buffer);
}
