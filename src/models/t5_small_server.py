from fastapi import FastAPI, Request
from transformers import pipeline
import uvicorn
app = FastAPI()
# Load the T5-small model for text generation
text_generator = pipeline("text2text-generation", model="t5-small") 
@app.post("/generate")
async def generate(req: Request):
    data = await req.json()
    prompt = data.get("prompt", "")
    if not prompt:
        return {"error": "Prompt is required"}
    
    # Generate text based on the prompt
    output = text_generator(prompt, max_length=50, num_return_sequences=1)
    return {"generated_text": output[0]["generated_text"]}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)