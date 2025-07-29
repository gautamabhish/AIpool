from fastapi import FastAPI, Request
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import uvicorn
import os

app = FastAPI()

MODEL_NAME = "codellama/CodeLlama-7b-hf"  # You can switch to 13b or 34b if you have the resources

# Check RAM/GPU and quantize if needed
use_4bit = False
try:
    total_mem_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    if total_mem_gb < 20:
        use_4bit = True
except:
    # CPU only or no CUDA
    use_4bit = True

print("Loading model...", "Quantized" if use_4bit else "Full")

if use_4bit:
    from transformers import BitsAndBytesConfig
    quant_config = BitsAndBytesConfig(load_in_4bit=True)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        device_map="auto",
        quantization_config=quant_config
    )
else:
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        device_map="auto"
    )

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

@app.post("/generate")
async def generate(req: Request):
    data = await req.json()
    prompt = data.get("prompt", "")
    output = generator(prompt, max_new_tokens=200, do_sample=True, temperature=0.7)
    return {"response": output[0]["generated_text"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
