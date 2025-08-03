const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const runningServers = {};
let basePort = 5000;

const isWin = process.platform === "win32";
const pythonBinary = path.join(__dirname, "..", "..", "python","install", "bin", "python3.10"); // bundled Python
console.log("Using Python binary:", pythonBinary);
const modelsDir = path.join(__dirname, "..","main", "models");
console.log("Models directory:", modelsDir);
//list all files in models directory
fs.readdir(modelsDir, (err, files) => {
  if (err) {
    console.error("Error reading models directory:", err);
  } else {
    console.log("Files in models directory:", files);
  }
});
const venvDir = path.join(modelsDir, ".venv");
const requirementsPath = path.join(modelsDir, "requirements.txt");

function ensureSharedVenv() {
  const venvPython = path.join(venvDir, isWin ? "Scripts" : "bin", "python");
  const pipPath = path.join(venvDir, isWin ? "Scripts" : "bin", "pip");

  try {
    // Step 1: Create venv if it doesn't exist
    if (!fs.existsSync(venvPython)) {
      console.log("Creating shared virtualenv...");
      const result = spawnSync(pythonBinary, ["-m", "venv", venvDir], { stdio: "inherit" });

      console.log("Result of venv creation:", result);

      if (result.status !== 0) {
        throw new Error(`Failed to create shared venv (exit code: ${result.status})`);
      }
    }

    // Step 2: Install shared requirements
    console.log(requirementsPath)
    if (fs.existsSync(requirementsPath)) {
      console.log("Installing shared Python dependencies...");
      const install = spawnSync(pipPath, ["install", "-r", requirementsPath], { stdio: "inherit" });

      if (install.status !== 0) {
        throw new Error(`Failed to install dependencies (exit code: ${install.status})`);
      }
    }
  } catch (err) {
    console.error("❌ Error in ensureSharedVenv:", err.message || err);
    throw err; // rethrow so caller can also handle if needed
  }
}


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

  if (runningServers[modelId]) {
    return runningServers[modelId].port;
  }

  const port = basePort++;
  const scriptPath = path.join(modelsDir, scripts[modelId]);
  const venvPython = path.join(venvDir, isWin ? "Scripts" : "bin", "python");

  ensureSharedVenv();

  const proc = spawn(venvPython, [scriptPath, port.toString()], {
    detached: true,
    stdio: 'inherit'
  });

  console.log(`Started ${modelId} on port ${port}, PID ${proc.pid}`);
  runningServers[modelId] = { pid: proc.pid, port };

  proc.unref();
  return port;
}

module.exports = startModelServer;
