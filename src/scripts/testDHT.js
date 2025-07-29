let registerModel;
let findModelNode;

async function imp(){
     registerModel = (await import('./dht.mjs')).registerModel;
     findModelNode = (await import('./dht.mjs')).findModelNode;
}
await imp();
await registerModel("gpt2", "http://localhost:8000");
const res = await findModelNode("gpt2");
console.log(res);
