from fastapi import FASTAPI , Request
from transformers import pipeline
import uvicorn
app = FastAPI()
# Load the CodeGen-small model for code generation
code_generator = pipeline("text-generation", model="Salesforce/codegen-350M-mono") 
@app.post("/generate")
async def generate(req: Request):
    data = await req.json()
    prompt = data.get("prompt", "")
    if not prompt:
        return {"error": "Prompt is required"}
    
    # Generate code based on the prompt
    output = code_generator(prompt, max_length=50, num_return_sequences=1)
    return {"generated_code": output[0]["generated_text"]}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
    