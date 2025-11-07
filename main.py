from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from PIL import Image
from io import BytesIO
import uvicorn

app = FastAPI()

@app.post("/convert")
async def convert(file: UploadFile = File(...), format: str = Form(...), quality: int = 100):
    img = Image.open(file.file)
    output = BytesIO()

    save_kwargs = {"quality": quality, "optimize": True}
    if format.lower() in ["png", "webp"]:
        save_kwargs["quality"] = 100

    img.save(output, format=format.upper(), **save_kwargs)
    output.seek(0)
    return StreamingResponse(output, media_type=f"image/{format.lower()}")

@app.get("/")
async def home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()
