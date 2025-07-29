// startModelServer.js
const { spawn } = require('child_process');
const path = require('path');

const runningServers = {}; // modelId → { pid, port }
let basePort = 5000;

 function startModelServer(modelId) {
  const scripts = {
    "codellama": "codellama_server.py",
    "starcoder": "starcoder_server.py",
    "codegen-small": "codegen_small_server.py",
    "llama2-13b-chat": "llama2_13b_chat_server.py",
    "mistral-7b": "mistral_7b_server.py",
    "gpt2": "gpt2_server.py",
    "bart-large-cnn": "bart_large_cnn_server.py",
    "t5-small": "t5_small_server.py",
    "blip2": "blip2_server.py",
    "vit-gpt2": "vit_gpt2_server.py"
  };

  if (!scripts[modelId]) {
    throw new Error(`Unknown model ID: ${modelId}`);
  }

  // If already running, return its port
  if (runningServers[modelId]) {
    return runningServers[modelId].port;
  }

  const port = basePort++; // assign next port
  const scriptPath = path.join(__dirname, "..", "models", scripts[modelId]);

  const proc = spawn("python3", [scriptPath, port], {
    detached: true,
    stdio: 'inherit'
  });


  console.log(`Started ${modelId} on port ${port}, PID ${proc.pid}`);
  runningServers[modelId] = { pid: proc.pid, port };
  proc.on('data', (data) => {
    console.log(`Model ${modelId} output: ${data}`);
  });
  proc.unref();
  return port;
}

module.exports = startModelServer;
