var bs58 = require('bs58');

function ipfsHashToBytes32(ipfs_hash) {
    var h = bs58.decode(ipfs_hash).toString('hex').replace(/^1220/, '');
    if (h.length != 64) {
        console.log('invalid ipfs format', ipfs_hash, h);
        return null;
    }
    return '0x' + h;
}

function bytes32ToIPFSHash(hash_hex) {
    //console.log('bytes32ToIPFSHash starts with hash_buffer', hash_hex.replace(/^0x/, ''));
    var buf = new Buffer(hash_hex.replace(/^0x/, '1220'), 'hex')
    return bs58.encode(buf)
}

module.exports.ipfsHashToBytes32 = ipfsHashToBytes32;
module.exports.bytes32ToIPFSHash = bytes32ToIPFSHash;