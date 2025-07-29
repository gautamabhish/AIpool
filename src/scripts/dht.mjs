import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { kadDHT } from '@libp2p/kad-dht'
import { identify } from '@libp2p/identify'
import { ping } from '@libp2p/ping'
import { yamux } from '@chainsafe/libp2p-yamux'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { fromString, toString } from 'uint8arrays'
import { multiaddr } from '@multiformats/multiaddr';

let node

const BOOTSTRAP_MULTIADDR ="/ip4/10.246.113.206/tcp/15001/ws/p2p/12D3KooWRHmNpXMBBPoN7vy1d2QnGM7jQrzdR3Mx1hD9zeTyK1WG"

export async function startNode() {
  const peerId = await createEd25519PeerId()
    console.log('Peer ID:', peerId.toString())
  node = await createLibp2p({
    peerId,
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0/ws'], // no incoming connections needed
    },
    transports: [webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      ping: ping(),
      dht: kadDHT({ enabled: true, clientMode: false ,  bootstrapPeers: [ multiaddr(BOOTSTRAP_MULTIADDR) ]}),
    },
    connectionManager: {
      minConnections: 1,
      autoDial: true,
    },
    peerDiscovery: [],
  })
  
  await node.start()
 console.log('✅ Node started with ID:', node.peerId.toString())
  // await node.dial(multiaddr(BOOTSTRAP_MULTIADDR))

  console.log('✅ Connected to bootstrap')
}

export async function registerModel(modelName, address) {
  if (!node) await startNode()

  const key = fromString(`/aipool/${modelName}`)
  const value = fromString(address)

  await node.services.dht.put(key, value)
  console.log(`📡 Registered ${modelName} at ${address}`)
}

export async function findModelNode(modelName) {
  if (!node) await startNode()

  const key = fromString(`/aipool/${modelName}`)

  try {
    const value = await node.services.dht.get(key)
    const address = toString(value)
    console.log(`🔍 Found ${modelName} at ${address}`)
    return address
  } catch (e) {
    console.log(`❌ Model "${modelName}" not found.`)
    return null
  }
}
