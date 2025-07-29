from fastapi import FastAPI, Request
from transformers import pipeline
import uvicorn  
app = FastAPI()
import torch
import os
# load the Mistral-7B model for text generation
use4bit = False
try:
    totalmem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    if totalmem < 20:
        use4bit = True
except:
    # CPU only or no CUDA
    use4bit = True
print("Loading model...", "Quantized" if use4bit else "Full")
if use4bit:
    from transformers import BitsAndBytesConfig
    quant_config = BitsAndBytesConfig(load_in_4bit=True)
    text_generator = pipeline("text-generation", model="mistralai/Mistral-7B-v0.1", device_map="auto", quantization_config=quant_config)
else:
    text_generator = pipeline("text-generation", model="mistralai/Mistral-7B-v0.1", device_map="auto")
@app.post("/generate")
async def generate(req: Request):   
    data = await req.json()
    prompt = data.get("prompt", "")
    if not prompt:
        return {"error": "Prompt is required"}
    
    # Generate text based on the prompt
    output = text_generator(prompt, max_new_tokens=200, do_sample=True, temperature=0.7)
    return {"response": output[0]["generated_text"]}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")