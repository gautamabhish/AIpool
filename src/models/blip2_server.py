from fastapi import FastAPI , Request
from transformers import pipeline
import uvicorn
app = FastAPI()
import torch
import os
# Load the BLIP-2 model for image captioning
captioner = pipeline("image-captioning", model="Salesforce/blip2-opt-2.7b")

use4bit = False

try:
    total_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    if total_memory < 20:
        use4bit = True
except:
    # CPU only or no CUDA
    use4bit = True  
print("Loading model...", "Quantized" if use4bit else "Full")
if use4bit:
    from transformers import BitsAndBytesConfig
    quant_config = BitsAndBytesConfig(load_in_4bit=True)
    captioner = pipeline("image-captioning", model="Salesforce/blip2-opt-2.7b", device_map="auto", quantization_config=quant_config)
else:
    captioner = pipeline("image-captioning", model="Salesforce/blip2-opt-2.7b", device_map="auto")
@app.post("/generate")
async def generate(req: Request):
    data = await req.json()
    image_url = data.get("image_url", "")
    if not image_url:
        return {"error": "Image URL is required"}
    
    # Generate caption based on the image URL
    output = captioner(image_url, max_new_tokens=50, do_sample=True, temperature=0.7)
    return {"response": output[0]["caption"]}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")