const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");
const options = document.getElementById("options");
const convertForm = document.getElementById("convertForm");
const result = document.getElementById("result");
const formatHidden = document.getElementById("formatHidden");

// Drag & drop support
uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = "#7b2ff7";
});
uploadZone.addEventListener("dragleave", () => {
  uploadZone.style.borderColor = "#ccc";
});
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  handleFile(file);
});
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file) return;
  uploadZone.classList.add("hidden");
  fileInfo.classList.remove("hidden");

  fileName.textContent = file.name;
  fileType.textContent = `${file.type || "Fichier inconnu"} — ${(file.size / 1024).toFixed(1)} Ko`;

  // Aperçu si image
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.innerHTML = `<img src="${reader.result}" alt="aperçu" />`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = `<img src="https://img.icons8.com/color/96/file.png"/>`;
  }

  suggestConversions(file);
}

function suggestConversions(file) {
  const type = file.type;
  let formats = [];

  if (type.includes("pdf")) formats = ["jpg", "png", "txt"];
  else if (type.includes("image")) formats = ["png", "jpg", "webp", "pdf"];
  else if (type.includes("video")) formats = ["mp3", "gif"];
  else if (type.includes("audio")) formats = ["mp3", "wav"];
  else formats = ["pdf"];

  options.innerHTML = "<p><strong>Choisis le format de sortie :</strong></p>" +
    formats.map(f => `<button class="option-btn" data-format="${f}">${f.toUpperCase()}</button>`).join("");

  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      formatHidden.value = btn.dataset.format;
      convertForm.classList.remove("hidden");
    });
  });
}

convertForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.innerHTML = "⏳ Conversion en cours...";

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("format", formatHidden.value);

  const res = await fetch("/convert", { method: "POST", body: formData });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  result.innerHTML = `<a href="${url}" download="converted_file.${formatHidden.value}">⬇️ Télécharger le fichier converti</a>`;
});
