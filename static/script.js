const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const themeToggle = document.getElementById("themeToggle");
const result = document.getElementById("result");
const convertedFiles = document.getElementById("convertedFiles");
const addMoreBtn = document.getElementById("addMore");

let uploadedFiles = [];

// === Mode clair/sombre ===
themeToggle.addEventListener("click", () => {
  const isDark = document.body.dataset.theme === "dark";
  document.body.dataset.theme = isDark ? "light" : "dark";
  themeToggle.textContent = isDark ? "Mode sombre" : "Mode clair";
});

// === Drag & drop ===
uploadZone.addEventListener("dragover", (e) => e.preventDefault());
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
addMoreBtn.addEventListener("click", resetToUpload);

function resetToUpload() {
  result.classList.add("hidden");
  uploadZone.classList.remove("hidden");
}

function handleFiles(files) {
  if (!files.length) return;
  uploadZone.classList.add("hidden");
  fileList.classList.remove("hidden");
  uploadedFiles = Array.from(files);
  fileList.innerHTML = "";
  uploadedFiles.forEach(showFileCard);
}

function showFileCard(file) {
  const card = document.createElement("div");
  card.className = "file-card";

  const preview = document.createElement("div");
  preview.className = "preview";

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = () => (img.src = reader.result);
    reader.readAsDataURL(file);
    preview.appendChild(img);
  } else preview.textContent = "📄";

  const info = document.createElement("div");
  info.className = "file-info";
  info.innerHTML = `
    <div class="file-name">${file.name}</div>
    <div class="file-type">${file.type || "Type inconnu"} — ${(file.size / 1024).toFixed(1)} Ko</div>
  `;

  const btnContainer = document.createElement("div");
  btnContainer.className = "format-options";
  suggestFormats(file.type).forEach(fmt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = fmt.toUpperCase();
    btn.onclick = () => convertFile(file, fmt);
    btnContainer.appendChild(btn);
  });

  card.append(preview, info, btnContainer);
  fileList.appendChild(card);
}

function suggestFormats(type) {
  if (type.includes("pdf")) return ["jpg", "png"];
  if (type.includes("image")) return ["png", "jpg", "webp", "pdf"];
  return ["pdf"];
}

async function convertFile(file, format) {
  fileList.classList.add("hidden");
  result.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);

  const res = await fetch("/convert", { method: "POST", body: formData });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const originalName = file.name.split('.').slice(0, -1).join('.');
  const newName = `${originalName}.${format}`;

  convertedFiles.innerHTML = "";
  const link = document.createElement("a");
  link.href = url;
  link.download = newName;
  link.textContent = "Télécharger";
  link.className = "download-btn";

  convertedFiles.appendChild(link);
}
