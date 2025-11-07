from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from io import BytesIO
import uvicorn

app = FastAPI()

# Servir les fichiers statiques (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/convert")
async def convert(file: UploadFile = File(...), format: str = Form(...)):
    img = Image.open(file.file)
    output = BytesIO()

    # Conversion sans perte
    save_kwargs = {"quality": 100}
    if format.lower() in ["png", "webp"]:
        save_kwargs.pop("quality", None)

    img.save(output, format=format.upper(), **save_kwargs)
    output.seek(0)
    return StreamingResponse(output, media_type=f"image/{format.lower()}")
