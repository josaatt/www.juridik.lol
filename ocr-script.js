let currentImage = null;
let cameraStream = null;

// Hantera filval
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            showPreview(currentImage);
        };
        reader.readAsDataURL(file);
    }
}

// Visa förhandsgranskning
function showPreview(imageSrc) {
    document.getElementById('preview').src = imageSrc;
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('cameraSection').style.display = 'none';
}

// Öppna kamera
async function openCamera() {
    const cameraSection = document.getElementById('cameraSection');
    const video = document.getElementById('camera');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });
        video.srcObject = cameraStream;
        cameraSection.style.display = 'block';
    } catch (error) {
        alert('Kunde inte komma åt kameran: ' + error.message);
    }
}

// Ta foto
function capturePhoto() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    currentImage = canvas.toDataURL('image/png');
    closeCamera();
    showPreview(currentImage);
}

// Stäng kamera
function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('cameraSection').style.display = 'none';
}

// Återställ uppladdning
function resetUpload() {
    currentImage = null;
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('fileInput').value = '';
}

// Bearbeta bild med OCR
async function processImage() {
    if (!currentImage) {
        alert('Ingen bild vald');
        return;
    }

    // Visa progress
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';

    try {
        const worker = await Tesseract.createWorker('swe', 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    updateProgress(m.progress * 100, 'Igenkänner text...');
                } else if (m.status === 'loading tesseract core') {
                    updateProgress(10, 'Laddar OCR-motor...');
                } else if (m.status === 'initializing tesseract') {
                    updateProgress(20, 'Initialiserar...');
                } else if (m.status === 'loading language traineddata') {
                    updateProgress(30, 'Laddar svenskt språkpaket...');
                } else if (m.status === 'initializing api') {
                    updateProgress(40, 'Förbereder...');
                }
            }
        });

        // Förbättra bildkvalitet för OCR
        await worker.setParameters({
            tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        });

        const { data: { text, confidence } } = await worker.recognize(currentImage);
        await worker.terminate();

        // Visa resultat
        showResult(text, confidence);

    } catch (error) {
        alert('OCR-fel: ' + error.message);
        document.getElementById('progressSection').style.display = 'none';
    }
}

// Uppdatera progress
function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
    document.getElementById('progressText').textContent = text;
}

// Visa resultat
function showResult(text, confidence) {
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('ocrResult').textContent = text;
    document.getElementById('confidence').textContent = `Säkerhet: ${Math.round(confidence)}%`;

    // Scrolla till resultat
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// Kopiera text
function copyText() {
    const text = document.getElementById('ocrResult').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Kopierat!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        alert('Kunde inte kopiera: ' + err);
    });
}

// Ladda ner text
function downloadText() {
    const text = document.getElementById('ocrResult').textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-resultat-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Stäng kamera när sidan laddas ur
window.addEventListener('beforeunload', closeCamera);
