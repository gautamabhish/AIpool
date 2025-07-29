const si = require('systeminformation');

async function suggestModels() {
  const mem = await si.mem();
  const cpu = await si.cpu();

  const totalRamGB = mem.total / 1024 / 1024 / 1024;
  const totalCores = cpu.cores;

  const bufferRamGB = 1;
  const bufferCores = 4;

  const availableRam = Math.floor(Math.max(totalRamGB - bufferRamGB, 0));
  const availableCores = Math.floor(Math.max(totalCores - bufferCores, 0));

  const models = {
    coding: [
      ["codellama",       20, 10, "high (≥20 GB RAM, ≥10 cores)"],
      ["starcoder",       10,  4, "medium (≥10 GB RAM, ≥4 cores)"],
      ["codegen-small",    4,  2, "low (≤10 GB RAM, ≤4 cores)"],
    ],
    chat: [
      ["llama2-13b-chat", 20, 10, "high (≥20 GB RAM, ≥10 cores)"],
      ["mistral-7b",      10,  4, "medium (≥10 GB RAM, ≥4 cores)"],
      ["gpt2",             4,  2, "low (≤10 GB RAM, ≤4 cores)"],
    ],
    summarization: [
      ["bart-large-cnn", 20, 4, "high (≥20 GB RAM)"],
      ["t5-small",        4, 2, "low (≤10 GB RAM)"],
    ],
    captioning: [
      ["blip2", 22, 8, "high (≥22 GB RAM, ≥8 cores)"],
      ["vit-gpt2", 4, 2, "low (≤10 GB RAM, ≤4 cores)"],
    ]
  };

  function bestFit(specs) {
    return specs
      .filter(([_, ram, cores]) => ram <= availableRam && cores <= availableCores)
      .sort((a, b) => b[1] - a[1] || b[2] - a[2])
      .map(([name, , , desc]) => ({ name, desc }));
  }

  return {
    ram: totalRamGB.toFixed(2),
    cores: totalCores,
    available: { ram: availableRam, cores: availableCores },
    suggestions: {
      coding: bestFit(models.coding),
      chat: bestFit(models.chat),
      summarization: bestFit(models.summarization),
      captioning: bestFit(models.captioning),
    }
  };
}

module.exports = suggestModels;
