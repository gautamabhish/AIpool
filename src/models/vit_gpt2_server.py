from fastapi import FastAPI, Request
from transformers import pipeline
import uvicorn
app = FastAPI()
# load the ViT-GPT2 model for image captioning
captioner = pipeline("image-captioning", model="google/vit-gpt2-image-captioning")
@app.post("/generate")
async def generate(req: Request):
    data = await req.json()
    image_url = data.get("image_url", "")
    if not image_url:
        return {"error": "Image URL is required"}
    
    # Generate caption for the image
    output = captioner(image_url)
    return {"caption": output[0]["caption"]}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
    