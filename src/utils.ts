import CID from 'cids';
import consts from '@maidsafe/safe-node-app/src/consts';
import multihashes from 'multihashes';
import url from 'url';
import sodium from 'libsodium-wrappers-sumo';

/**
 * @returns Tuple array with secret in first index, public in second.
 */
export async function generateKeyPair(): Promise<[Buffer, Buffer]> {
  await sodium.ready;

  const keyPair = sodium.crypto_sign_keypair();

  return [
    Buffer.from(keyPair.privateKey),
    Buffer.from(keyPair.publicKey),
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

/**
 * Turn a mutable or immutable data address into an XOR URL.
 *
 * @param xor Name of mutable of immutable data.
 * @param [tag] Optionally the tag type if mutable data.
 * @returns An XOR URL.
 */
export function get_xor_url(xor: Buffer, tag?: number) {
  const encodedHash = multihashes.encode(xor, consts.CID_HASH_FN);
  const newCid = new CID(consts.CID_VERSION, consts.CID_DEFAULT_CODEC, encodedHash);
  const cidStr = newCid.toBaseEncodedString(consts.CID_BASE_ENCODING);

  return tag
    ? `safe://${cidStr}:${tag}`
    : `safe://${cidStr}`;
}

/**
 * Parse an XOR URL into its parts.
 *
 * @param safeUrl The XOR URL (e.g. safe://<cid>:<tag>).
 * @returns The extracted components of the XOR URL.
 */
export function parse_xor_url(safeUrl: string) {
  const urlObject = url.parse(safeUrl);

  const cid = new CID(urlObject.hostname);
  const encodedHash = multihashes.decode(cid.multihash);
  const address = encodedHash.digest;

  return {
    xor: encodedHash.digest as Buffer,
    tag: urlObject.port === undefined ? undefined : Number(urlObject.port),
  };
}
