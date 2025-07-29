from transformers import pipeline
from fastapi import FastAPI, Request
import uvicorn

app = FastAPI()
generator = pipeline("text-generation", model="gpt2")

@app.post("/generate")
async def generate(req: Request):
    data = await req.json()
    prompt = data.get("prompt", "")
    output = generator(prompt, max_length=4000)
    return {"response": output[0]["generated_text"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
