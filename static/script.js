const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const themeToggle = document.getElementById("themeToggle");
const downloadAllBtn = document.getElementById("downloadAll");
const actions = document.getElementById("actions");
const counter = document.getElementById("counter");

let uploadedFiles = [];
let convertedCount = 0;
let downloadLinks = [];

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

function handleFiles(files) {
  if (!files.length) return;
  uploadZone.classList.add("hidden");
  fileList.classList.remove("hidden");
  actions.classList.remove("hidden");
  uploadedFiles = Array.from(files);
  fileList.innerHTML = "";
  downloadLinks = [];
  uploadedFiles.forEach(showFileCard);
  updateDownloadButton();
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
  } else if (file.type.includes("pdf")) {
    preview.textContent = "📄";
  } else if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.loop = true;
    video.play();
    preview.appendChild(video);
  } else {
    preview.textContent = "📦";
  }

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
    btn.onclick = () => convertFile(file, fmt, card);
    btnContainer.appendChild(btn);
  });

  card.append(preview, info, btnContainer);
  fileList.appendChild(card);
}

function suggestFormats(type) {
  if (type.includes("pdf")) return ["jpg", "png"];
  if (type.includes("image")) return ["png", "jpg", "webp", "pdf"];
  if (type.includes("video")) return ["mp3", "gif"];
  if (type.includes("audio")) return ["mp3", "wav"];
  return ["pdf"];
}

async function convertFile(file, format, card) {
  const buttons = card.querySelectorAll(".option-btn");
  buttons.forEach(b => b.disabled = true);

  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressContainer.appendChild(progressBar);
  card.appendChild(progressContainer);

  let progress = 0;
  const fakeProgress = setInterval(() => {
    progress = Math.min(progress + Math.random() * 10, 95);
    progressBar.style.width = `${progress}%`;
  }, 200);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);

  const res = await fetch("/convert", { method: "POST", body: formData });
  clearInterval(fakeProgress);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  progressBar.style.width = "100%";

  const originalName = file.name.split('.').slice(0, -1).join('.');
  const newName = `${originalName}.${format}`;
  downloadLinks.push({ url, newName });
  updateDownloadButton();

  setTimeout(() => {
    progressContainer.remove();
    convertedCount++;
    counter.textContent = `${convertedCount} fichier${convertedCount > 1 ? "s" : ""} converti${convertedCount > 1 ? "s" : ""}`;
  }, 400);
}

function updateDownloadButton() {
  if (uploadedFiles.length <= 1) {
    downloadAllBtn.textContent = "Télécharger";
    downloadAllBtn.onclick = () => {
      if (downloadLinks[0]) {
        const a = document.createElement("a");
        a.href = downloadLinks[0].url;
        a.download = downloadLinks[0].newName;
        a.click();
      }
    };
  } else {
    downloadAllBtn.textContent = "Tout télécharger";
    downloadAllBtn.onclick = () => {
      downloadLinks.forEach(link => {
        const a = document.createElement("a");
        a.href = link.url;
        a.download = link.newName;
        a.click();
      });
    };
  }
}
