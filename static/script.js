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

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // Sécurise la récupération du nom
    const cd = res.headers.get("content-disposition");
    let filename = "converted_file.png";

    if (cd && cd.includes("filename=")) {
      try {
        filename = cd.split("filename=")[1].replace(/"/g, "");
      } catch (err) {
        console.warn("Erreur lecture filename:", err);
      }
    }

    link.download = filename;
    link.textContent = "⬇️ Télécharger le fichier converti";

    result.innerHTML = "";
    result.appendChild(link);
  } catch (err) {
    result.innerHTML = "❌ Erreur : " + err.message;
  }
});
