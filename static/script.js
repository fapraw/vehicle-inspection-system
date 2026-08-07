// ======================================
// 0. ระบบจัดการ IndexedDB สำหรับเก็บรูปภาพ
// ======================================
const DB_NAME = "InspectionAppDB";
const STORE_NAME = "images";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveImageToDB(id, file) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(file, id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getImageFromDB(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function clearAllImageData() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// ======================================
// 1. แสดงวันที่และเวลา (Real-time)
// ======================================
function updateDateTime() {
    const now = new Date();

    const date = now.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const dateEl = document.getElementById("currentDate");
    const timeEl = document.getElementById("currentTime");

    if (dateEl) dateEl.textContent = date;
    if (timeEl) timeEl.textContent = time;
}

updateDateTime();
setInterval(updateDateTime, 1000);

// ======================================
// 2. จัดการประเภทรถ
// ======================================
function toggleCustomVehicleType(selectEl) {
    const customInput = document.getElementById("customVehicleType");
    if (!customInput) return;

    if (selectEl.value === "อื่น ๆ") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
        customInput.value = "";
    }
    saveFormData();
}

// ======================================
// 3. Multi Step Form & Dynamic Render
// ======================================
let activeItems = [];
const uploadedFileUrls = {};
const uploadedFileNames = {};

function goToInspectionStep() {
    const inspector = document.getElementById("inspector")?.value.trim();
    const plate = document.getElementById("plate")?.value.trim();
    const station = document.getElementById("station")?.value.trim();
    const selectType = document.getElementById("vehicleType")?.value;
    const customType = document.getElementById("customVehicleType")?.value.trim();

    const vehicleType = selectType === "อื่น ๆ" ? customType : selectType;

    let missingFields = [];
    if (!inspector) missingFields.push("ชื่อผู้ตรวจ");
    if (!selectType) missingFields.push("ประเภทรถ");
    if (selectType === "อื่น ๆ" && !customType) missingFields.push("การระบุประเภทรถเพิ่มเติม");
    if (!plate) missingFields.push("ทะเบียนรถ");
    if (!station) missingFields.push("สถานี/จุดตรวจ");

    if (missingFields.length > 0) {
        alert(`⚠️ กรุณากรอกข้อมูลหน้าแรกให้ครบถ้วนก่อนกดถัดไป:\n- ${missingFields.join("\n- ")}`);
        return;
    }

    renderInspectionItems(vehicleType);

    document.getElementById("step1")?.classList.remove("active");
    document.getElementById("step2")?.classList.add("active");

    saveFormData();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevStep() {
    document.getElementById("step2")?.classList.remove("active");
    document.getElementById("step1")?.classList.add("active");

    saveFormData();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderInspectionItems(vehicleType) {
    const container = document.getElementById("inspectionContainer");
    const titleElement = document.getElementById("inspectionTitle");
    if (!container) return;

    container.innerHTML = ""; 

    let targetIds = [];
    let groupTitle = "";

    if (vehicleType === "รถเทเลอร์" || vehicleType === "เทเลอร์") {
        targetIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else if (vehicleType === "รถพ่วง") {
        targetIds = [1, 2, 5, 4, 6, 7, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else if (vehicleType === "รถสิบล้อ") {
        targetIds = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else if (vehicleType === "รถหกล้อ") {
        targetIds = [1, 4, 5, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else {
        targetIds = [1, 4, 8, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    }

    // สมมติว่ามีตัวแปร allItems อยู่ในระบบภายนอก
    if (typeof allItems !== "undefined") {
        activeItems = allItems.filter(item => targetIds.includes(Number(item.id)));
    } else {
        activeItems = targetIds.map(id => ({ id: id, title: `รายการตรวจที่ ${id}`, details: [], warnings: [] }));
    }

    if (titleElement) {
        titleElement.innerText = groupTitle;
    }

    activeItems.forEach((item, index) => {
        const no = item.id;
        const displayNo = index + 1;

        let detailsHtml = "";
        if (item.details && item.details.length > 0) {
            detailsHtml = `
                <div class="inspection-details">
                    <ul>${item.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>`;
        }

        let warningsHtml = "";
        if (item.warnings && item.warnings.length > 0) {
            warningsHtml = `
                <div class="warning-box">
                    <strong>⚠️ ข้อควรระวัง</strong>
                    ${item.warnings.map(w => `<p>${w}</p>`).join('')}
                </div>`;
        }

        const cardHtml = `
            <div class="inspection-card" id="card${no}">
                <h3>${displayNo}. ${item.title}</h3>
                ${detailsHtml}
                ${warningsHtml}

                <div class="example-box">
                    <img src="/static/images/item${no}.png" class="example-image" alt="ตัวอย่าง" onerror="this.style.display='none'">
                </div>

                <div class="image-box">
                    <div class="upload-btn-group">
                        <label for="camera${no}" class="upload-btn">📷 ถ่ายรูป</label>
                        <input type="file" id="camera${no}" accept="image/*" capture="environment" onchange="handleImageUpload(this, ${no})" hidden>

                        <label for="gallery${no}" class="upload-btn upload-btn-gallery">🖼️ เลือกไฟล์</label>
                        <input type="file" id="gallery${no}" accept="image/*" onchange="handleImageUpload(this, ${no})" hidden>
                    </div>
                    <div id="fileInfo${no}" class="file-info-text">ยังไม่ได้เลือกไฟล์ภาพ</div>
                </div>

                <div class="status-buttons">
                    <input type="radio" id="accept${no}" name="status${no}" value="ยอมรับ" class="status-btn-check" onchange="saveFormData()" disabled>
                    <label for="accept${no}" class="btn-status btn-accept disabled-label">ผ่าน</label>

                    <input type="radio" id="reject${no}" name="status${no}" value="ไม่ยอมรับ" class="status-btn-check" onchange="saveFormData()" disabled>
                    <label for="reject${no}" class="btn-status btn-reject disabled-label">ไม่ผ่าน</label>
                </div>
            </div>`;

        container.insertAdjacentHTML("beforeend", cardHtml);

        if (uploadedFileUrls[no]) {
            restoreUploadedImageUI(no, uploadedFileNames[no] || "ไฟล์รูปภาพแล้ว");
            unlockStatusButtons(no);
        }
    });
}

// ======================================
// 4. จัดการรูปภาพและการปลดล็อคปุ่มสถานะ
// ======================================
async function handleImageUpload(input, number) {

    const file = input.files[0];

    console.log(file);
    console.log(file?.type);
    console.log(file?.name);
    console.log(file?.size);

    if (uploadedFileUrls[number]) {
        URL.revokeObjectURL(uploadedFileUrls[number]);
    }

    const fileUrl = URL.createObjectURL(file);

    uploadedFileUrls[number] = fileUrl;
    uploadedFileNames[number] = file.name;

    try {

        await saveImageToDB(number, file);

    } catch (err) {

        console.error("IndexedDB Error", err);

    }

    restoreUploadedImageUI(number, file.name);

    unlockStatusButtons(number);

    saveFormData();

}

function restoreUploadedImageUI(number, fileName = "ไฟล์รูปภาพแล้ว") {
    const fileInfo = document.getElementById("fileInfo" + number);
    if (fileInfo) {
        fileInfo.innerHTML = `
            <div class="file-attachment">
                <span class="file-name-text">📎 ${fileName}</span>
                <button type="button" class="view-file-btn" onclick="openImageModal(${number})">🔍 ดูรูปภาพ</button>
            </div>
        `;
    }
}

function unlockStatusButtons(number) {
    const radios = document.querySelectorAll(`input[name="status${number}"]`);
    radios.forEach(radio => {
        radio.disabled = false;
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) {
            label.classList.remove("disabled-label");
        }
    });
}

function openImageModal(number) {
    const fileUrl = uploadedFileUrls[number];
    if (!fileUrl) {
        alert("ไม่พบไฟล์รูปภาพ");
        return;
    }

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    if (modal && modalImg) {
        modalImg.src = fileUrl;
        modal.style.display = "flex";
    }
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// ======================================
// 5. การบันทึกและโหลดข้อมูลจาก LocalStorage/IndexedDB
// ======================================
function saveFormData() {
    const formData = {
        inspector: document.getElementById("inspector")?.value || "",
        vehicleType: document.getElementById("vehicleType")?.value || "",
        customVehicleType: document.getElementById("customVehicleType")?.value || "",
        plate: document.getElementById("plate")?.value || "",
        station: document.getElementById("station")?.value || "",
        acceptChecked: document.getElementById("accept")?.checked || false,
        isStep2Active: document.getElementById("step2")?.classList.contains("active") || false,
        fileNames: uploadedFileNames,
        statuses: {}
    };

    activeItems.forEach(item => {
        const checkedRadio = document.querySelector(`input[name="status${item.id}"]:checked`);
        if (checkedRadio) {
            formData.statuses[item.id] = checkedRadio.value;
        }
    });

    localStorage.setItem("inspectionFormData", JSON.stringify(formData));
}

async function restoreFormData() {
    const savedData = localStorage.getItem("inspectionFormData");
    if (!savedData) return;

    const formData = JSON.parse(savedData);

    if (document.getElementById("inspector")) document.getElementById("inspector").value = formData.inspector || "";
    if (document.getElementById("vehicleType")) {
        document.getElementById("vehicleType").value = formData.vehicleType || "";
        toggleCustomVehicleType(document.getElementById("vehicleType"));
    }
    if (document.getElementById("customVehicleType")) document.getElementById("customVehicleType").value = formData.customVehicleType || "";
    if (document.getElementById("plate")) document.getElementById("plate").value = formData.plate || "";
    if (document.getElementById("station")) document.getElementById("station").value = formData.station || "";
    if (document.getElementById("accept")) document.getElementById("accept").checked = formData.acceptChecked || false;

    const fileNames = formData.fileNames || {};
    for (const id in fileNames) {
        const fileBlob = await getImageFromDB(Number(id));
        if (fileBlob) {
            uploadedFileUrls[id] = URL.createObjectURL(fileBlob);
            uploadedFileNames[id] = fileNames[id];
        }
    }

    if (formData.isStep2Active) {
        const vehicleType = formData.vehicleType === "อื่น ๆ" ? formData.customVehicleType : formData.vehicleType;
        if (vehicleType) {
            renderInspectionItems(vehicleType);
            document.getElementById("step1")?.classList.remove("active");
            document.getElementById("step2")?.classList.add("active");

            if (formData.statuses) {
                Object.keys(formData.statuses).forEach(id => {
                    const val = formData.statuses[id];
                    const radio = document.querySelector(`input[name="status${id}"][value="${val}"]`);
                    if (radio) radio.checked = true;
                });
            }
        }
    }
}

function attachAutoSaveListeners() {
    const inputs = ["inspector", "plate", "station", "vehicleType", "customVehicleType", "accept"];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", saveFormData);
            el.addEventListener("change", saveFormData);
        }
    });
}

// ======================================
// 6. Helper & API Integration (ส่งข้อมูล GAS)
// ======================================
// ฟังก์ชันย่อขนาดรูปภาพก่อนส่งเข้า Google Apps Script เพื่อไม่ให้ติด Timeout
function compressAndConvertToBase64(blob, maxWidth = 1000, quality = 0.7) {
    return new Promise(async (resolve, reject) => {
        try {
            const bitmap = await createImageBitmap(blob);

            let width = bitmap.width;
            let height = bitmap.height;

            if (width > maxWidth) {
                height = Math.round(height * maxWidth / width);
                width = maxWidth;

            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(bitmap,0,0,width,height);

            resolve(
                canvas
                .toDataURL("image/jpeg",quality)
                .split(",")[1]
            );

        }

        catch(err){

            reject(err);

        }

    });

}

// แปลง PDF Blob เป็น Base64 ปกติ
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ฟังก์ชันส่งข้อมูลเข้า Google Apps Script
async function sendDataToGoogleAppsScript(formData, pdfBlob) {
    // ⚠️ ตรวจสอบว่าใช้ Web App URL ล่าสุดจากการ Deploy ใหม่แล้ว
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyJTJz4wJJ8sE9EhCKIuj6q64s89pCC6HnNBN4eTraED93nNqUSE8wE4pPGiN6n-bUD/exec";

    try {
        const dateClean = (document.getElementById("currentDate")?.innerText || "").replace(/\//g, '-');
        const plateClean = formData.plate.replace(/\s+/g, '_');

        const inspectionImages = [];
        for (const item of activeItems) {
            const i = item.id;
            const fileBlob = await getImageFromDB(Number(i));
            if (fileBlob) {
                // ย่อขนาดรูปภาพก่อนแปลงเป็น Base64
                const base64Data = await compressAndConvertToBase64(
                    fileBlob,
                    800,
                    0.6
                );
                const originalFileName = uploadedFileNames[i] || `item_${i}.jpg`;
                const fileExt = originalFileName.substring(originalFileName.lastIndexOf('.'));
                const formattedFileName = `item_${i}_${plateClean}_${dateClean}${fileExt}`;

                inspectionImages.push({
                    itemId: i,
                    fileName: formattedFileName,
                    mimeType:fileBlob.type,
                    base64: base64Data,
                    status: document.querySelector(`input[name="status${i}"]:checked`)?.value || "-"
                });
            }
        }

        const pdfBase64 = pdfBlob ? await blobToBase64(pdfBlob) : "";

        const payload = {
            inspector: formData.inspector,
            vehicleType: formData.vehicleType,
            plate: formData.plate,
            station: formData.station,
            inspectionDate: document.getElementById("currentDate")?.innerText || "-",
            inspectionTime: document.getElementById("currentTime")?.innerText || "-",
            pdfFileName: `Certificate_${plateClean}_${dateClean}.pdf`,
            pdfBase64: pdfBase64,
            images: inspectionImages
        };

        // ส่งแบบ no-cors เพื่อข้ามปัญหาเรื่อง CORS Policy ของเบราว์เซอร์
        const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    headers: {
        "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
});

const result = await response.json();

if (result.status !== "success") {
    throw new Error(result.error || "Upload Failed");
}

console.log("✅ ส่งข้อมูลสำเร็จ");
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดขณะส่งข้อมูลไป Google Apps Script:", error);
        throw error;
    }
}

async function generateAndDownloadPDF(formData) {
    const submitBtn = document.getElementById("submitBtn");

    const dateStr = document.getElementById("currentDate")?.innerText || "-";
    const timeStr = document.getElementById("currentTime")?.innerText || "-";

    if (document.getElementById("pdf-inspector")) document.getElementById("pdf-inspector").innerText = formData.inspector;
    if (document.getElementById("pdf-vehicle-type")) document.getElementById("pdf-vehicle-type").innerText = formData.vehicleType;
    if (document.getElementById("pdf-plate")) document.getElementById("pdf-plate").innerText = formData.plate;
    if (document.getElementById("pdf-station")) document.getElementById("pdf-station").innerText = formData.station;
    if (document.getElementById("pdf-date")) document.getElementById("pdf-date").innerText = dateStr;
    if (document.getElementById("pdf-time")) document.getElementById("pdf-time").innerText = timeStr;
    if (document.getElementById("pdf-scope-plate")) document.getElementById("pdf-scope-plate").innerText = formData.plate;

    const galleryContainer = document.getElementById("pdf-gallery");
    const imageLoadPromises = [];

    if (galleryContainer) {
        galleryContainer.innerHTML = "";

        activeItems.forEach(item => {
            const i = item.id;
            if (uploadedFileUrls[i]) {
                const imgElement = document.createElement("img");
                imgElement.className = "cert-img-thumb";
                
                const imgPromise = new Promise((resolve) => {
                    imgElement.onload = () => resolve();
                    imgElement.onerror = () => resolve();
                });
                imageLoadPromises.push(imgPromise);

                imgElement.src = uploadedFileUrls[i];
                galleryContainer.appendChild(imgElement);
            }
        });
    }

    await Promise.all(imageLoadPromises);

    const pdfWrapper = document.getElementById("pdf-wrapper");
    const element = document.getElementById("pdf-template");

    if (pdfWrapper) {
        pdfWrapper.style.position = "fixed";
        pdfWrapper.style.top = "0";
        pdfWrapper.style.left = "0";
        pdfWrapper.style.zIndex = "-9999";
        pdfWrapper.style.opacity = "1";
    }

    const dateClean = dateStr.replace(/\//g, '-');
    const opt = {
        margin:       0,
        filename:     `Certificate_${formData.plate}_${dateClean}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            scrollX: 0,
            scrollY: 0
            // ลบ width และ height ออก เพื่อให้ html2canvas คำนวณขนาดตาม Element จริงอัตโนมัติ
        },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
        // เพิ่มตัวเลือกสั่งห้ามแบ่งหน้าอัตโนมัติ
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ กำลังส่งข้อมูล และสร้าง PDF...";
        }

        // ข้อแนะนำเพิ่มเติม: เพื่อไม่ให้ระบบต้อง Render HTML เป็น Canvas ซ้ำ 2 รอบ
        // สามารถดึง worker ของ html2pdf มาใช้งานร่วมกันได้ครับ
        const worker = html2pdf().set(opt).from(element);

        // 1. สร้าง Blob ของ PDF
        const pdfBlob = await worker.output('blob');

        // 2. ดาวน์โหลด PDF ลงเครื่อง
        await worker.save();

        // 3. ส่งข้อมูลเข้า Google Sheet / Google Drive
        await sendDataToGoogleAppsScript(formData, pdfBlob);

        alert("✅ ตรวจสอบ ส่งข้อมูลเข้า Google Drive และดาวน์โหลดใบ Certificate เรียบร้อยแล้ว!");

        // 4. ล้างข้อมูลหลังส่งสำเร็จ
        localStorage.removeItem("inspectionFormData");
        await clearAllImageData();
        location.reload(); // รีโหลดเพื่อเริ่มต้นฟอร์มใหม่

    } catch (error) {
        console.error("PDF & Data Submission Error:", error);
        alert("⚠️ ดาวน์โหลด PDF สำเร็จ แต่เกิดข้อผิดพลาดในการส่งข้อมูลเข้า Google Sheet/Drive");
    } finally {
        if (pdfWrapper) {
            pdfWrapper.style.position = "absolute";
            pdfWrapper.style.left = "-9999px";
            pdfWrapper.style.top = "-9999px";
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "✅ ยืนยันการส่ง";
        }
    }
}

// ======================================
// 7. Event Handler หลักเมื่อกดปุ่มส่งข้อมูล
// ======================================
window.onload = async function() {
    attachAutoSaveListeners();
    await restoreFormData();

    const submitBtn = document.getElementById("submitBtn");

    if (submitBtn) {
        submitBtn.addEventListener("click", async function() {
            
            const inspector = document.getElementById("inspector")?.value.trim();
            const plate = document.getElementById("plate")?.value.trim();
            const station = document.getElementById("station")?.value.trim();
            
            const selectType = document.getElementById("vehicleType")?.value;
            const customType = document.getElementById("customVehicleType")?.value.trim();
            let vehicleType = selectType === "อื่น ๆ" ? customType : selectType;

            if (!inspector || !vehicleType || !plate || !station) {
                alert("⚠️ กรุณากรอกข้อมูลทั่วไป (ผู้ตรวจ, ประเภทรถ, ทะเบียนรถ, สถานี) ให้ครบถ้วน");
                prevStep();
                return;
            }

            let missingImages = [];
            let missingStatus = [];
            let rejectedItems = [];

            activeItems.forEach((item, index) => {
                const i = item.id;
                const displayNo = index + 1;
                
                const cameraInput = document.getElementById(`camera${i}`);
                const galleryInput = document.getElementById(`gallery${i}`);
                
                const hasCameraImg = cameraInput && cameraInput.files && cameraInput.files.length > 0;
                const hasGalleryImg = galleryInput && galleryInput.files && galleryInput.files.length > 0;
                const hasUploadedBefore = !!uploadedFileUrls[i];

                if (!hasCameraImg && !hasGalleryImg && !hasUploadedBefore) {
                    missingImages.push(displayNo);
                }

                const statusChecked = document.querySelector(`input[name="status${i}"]:checked`);
                if (!statusChecked) {
                    missingStatus.push(displayNo);
                } else if (statusChecked.value === "ไม่ยอมรับ") {
                    rejectedItems.push(displayNo);
                }
            });

            if (missingImages.length > 0) {
                alert(`⚠️ กรุณาเพิ่มรูปภาพให้ครบถ้วนก่อนส่งข้อมูล (ยังไม่ได้เพิ่มรูปข้อ: ${missingImages.join(", ")})`);
                return;
            }

            if (missingStatus.length > 0) {
                alert(`⚠️ กรุณาเลือกระบุผลการตรวจให้ครบถ้วน (ยังไม่ได้ตรวจข้อ: ${missingStatus.join(", ")})`);
                return;
            }

            if (rejectedItems.length > 0) {
                const acceptCheck = document.getElementById("accept");
                if (acceptCheck) acceptCheck.checked = false;
                saveFormData();

                alert(`❌ ไม่สามารถส่งข้อมูลได้ เนื่องจากมีรายการที่ไม่ผ่านการตรวจ\n\nรายการที่ไม่ผ่าน ได้แก่ ข้อ: ${rejectedItems.join(", ")}\n\n👉 กรุณาแก้ไขให้ผ่านก่อนดำเนินการต่อ`);
                return;
            }

            const accept = document.getElementById("accept");
            if (!accept || !accept.checked) {
                alert("⚠️ กรุณายืนยันการยอมรับเงื่อนไขก่อนส่งข้อมูล");
                return;
            }

            await generateAndDownloadPDF({
                inspector,
                vehicleType,
                plate,
                station
            });
        });
    }
};
document.addEventListener("DOMContentLoaded", function () {
    const termsContainer = document.querySelector(".terms-container");
    const acceptCheckbox = document.getElementById("accept");
    const acceptLabel = document.getElementById("acceptLabel");

    if (termsContainer && acceptCheckbox) {
        termsContainer.addEventListener("scroll", function () {
            // คำนวณว่าเลื่อนถึงล่างสุดแล้วหรือยัง (เผื่อระยะไว้เล็กน้อย 5px)
            const isScrolledToBottom = termsContainer.scrollHeight - termsContainer.scrollTop <= termsContainer.clientHeight + 5;

            if (isScrolledToBottom) {
                // เปิดให้สามารถกดติ๊กได้
                acceptCheckbox.disabled = false;
                acceptCheckbox.style.cursor = "pointer";
                
                if (acceptLabel) {
                    acceptLabel.style.cursor = "pointer";
                    acceptLabel.style.color = "#333";
                    acceptLabel.textContent = "ข้าพเจ้าได้อ่าน เข้าใจ และยินยอมรับเงื่อนไขข้อตกลงทั้งหมดข้างต้น";
                }
            }
        });
    }
});







