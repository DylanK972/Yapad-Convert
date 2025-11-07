const form = document.getElementById("convertForm");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.innerHTML = "⏳ Conversion en cours...";

  const formData = new FormData(form);

  try {
    const res = await fetch("/convert", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Erreur de conversion");

    // Récupère le nom du fichier pour téléchargement
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = res.headers.get("content-disposition");
    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1].replace(/"/g, "")
      : "converted_file";

    link.download = filename;
    link.textContent = "⬇️ Télécharger le fichier converti";
    result.innerHTML = "";
    result.appendChild(link);
  } catch (err) {
    result.innerHTML = "❌ Erreur : " + err.message;
  }
});
