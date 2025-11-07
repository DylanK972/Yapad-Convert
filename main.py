from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import io, os, uuid

app = FastAPI(title="Yapad Convert")

# Dossier temporaire
os.makedirs("tmp", exist_ok=True)

# Servir les fichiers statiques (front)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.post("/convert")
async def convert_image(file: UploadFile, format: str = Form("png")):
    try:
        # Lire le fichier
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Générer un nom unique
        base_name = file.filename.rsplit('.', 1)[0]
        output_filename = f"{uuid.uuid4().hex}.{format.lower()}"
        output_path = os.path.join("tmp", output_filename)

        # Sauvegarder l’image convertie
        image.save(output_path, format=format.upper())

        # Nom propre pour le téléchargement
        download_name = f"{base_name}.{format.lower()}"

        return FileResponse(
            output_path,
            media_type=f"image/{format.lower()}",
            headers={"Content-Disposition": f'attachment; filename="{download_name}"'}
        )
    except Exception as e:
        return {"error": str(e)}
