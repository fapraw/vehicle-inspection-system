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
// 2. จัดการประเภทรถ (แสดงช่องระบุเพิ่มถ้าเลือก "อื่น ๆ")
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
}


// ======================================
// 3. Multi Step Form & Dynamic Render
// ======================================

let activeItems = []; // เก็บรายการตรวจของประเภทรถที่กำลังเลือกอยู่

function goToInspectionStep() {
    const selectType = document.getElementById("vehicleType")?.value;
    const customType = document.getElementById("customVehicleType")?.value.trim();
    const vehicleType = selectType === "อื่น ๆ" ? customType : selectType;

    if (!vehicleType) {
        alert("⚠️ กรุณาเลือกประเภทรถก่อนดำเนินการต่อ");
        return;
    }

    // Render รายการตรวจตามประเภทรถ
    renderInspectionItems(vehicleType);

    // เปลี่ยนหน้าไป Step 2
    document.getElementById("step1")?.classList.remove("active");
    document.getElementById("step2")?.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevStep() {
    document.getElementById("step2")?.classList.remove("active");
    document.getElementById("step1")?.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderInspectionItems(vehicleType) {
    const container = document.getElementById("inspectionContainer");
    const titleElement = document.getElementById("inspectionTitle");
    if (!container) return;

    container.innerHTML = ""; // ล้างข้อมูลเก่า

    // กรองชุดข้อมูลจากประเภทรถ
    if (vehicleType === "รถพ่วง" || vehicleType === "รถสาลี") {
        activeItems = allItems.slice(0, 4); // ชุด 1 (รายการ 1-4)
        if (titleElement) titleElement.innerText = "📋 รายการตรวจ ชุดที่ 1 (รายการ 1-4)";
    } else if (vehicleType === "รถสิบล้อ" || vehicleType === "รถอีแต๋น") {
        activeItems = allItems.slice(4, 8); // ชุด 2 (รายการ 5-8)
        if (titleElement) titleElement.innerText = "📋 รายการตรวจ ชุดที่ 2 (รายการ 5-8)";
    } else if (vehicleType === "รถเทเลอร์" || vehicleType === "รถหกล้อ") {
        activeItems = allItems.slice(8, 12); // ชุด 3 (รายการ 9-12)
        if (titleElement) titleElement.innerText = "📋 รายการตรวจ ชุดที่ 3 (รายการ 9-12)";
    } else {
        activeItems = allItems; // แสดงทั้งหมดกรณีอื่น ๆ
        if (titleElement) titleElement.innerText = "📋 รายการตรวจทั้งหมด";
    }

    // สร้าง HTML สำหรับแต่ละรายการ
    activeItems.forEach(item => {
        const no = item.id;

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
                <h3>${no}. ${item.title}</h3>
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
                    <input type="radio" id="accept${no}" name="status${no}" value="ยอมรับ" class="status-btn-check" disabled>
                    <label for="accept${no}" class="btn-status btn-accept disabled-label">ผ่าน</label>

                    <input type="radio" id="na${no}" name="status${no}" value="ไม่เกี่ยวข้อง" class="status-btn-check" disabled>
                    <label for="na${no}" class="btn-status btn-na disabled-label">ไม่เกี่ยวข้อง</label>

                    <input type="radio" id="reject${no}" name="status${no}" value="ไม่ยอมรับ" class="status-btn-check" disabled>
                    <label for="reject${no}" class="btn-status btn-reject disabled-label">ไม่ผ่าน</label>
                </div>
            </div>`;

        container.insertAdjacentHTML("beforeend", cardHtml);

        // คืนค่าที่เคยเลือกไว้เดิม (ถ้ามี)
        if (uploadedFileUrls[no]) {
            restoreUploadedImageUI(no);
            unlockStatusButtons(no);
        }
    });
}


// ======================================
// 4. จัดการรูปภาพและการปลดล็อคปุ่มสถานะ
// ======================================

const uploadedFileUrls = {};

function handleImageUpload(input, number) {
    const file = input.files[0];
    if (!file) return;

    if (uploadedFileUrls[number]) {
        URL.revokeObjectURL(uploadedFileUrls[number]);
    }
    const fileUrl = URL.createObjectURL(file);
    uploadedFileUrls[number] = fileUrl;

    restoreUploadedImageUI(number, file.name);
    unlockStatusButtons(number);
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
// 5. การตรวจสอบข้อมูลและการส่งฟอร์ม + สร้าง PDF Certificate
// ======================================

window.onload = function() {
    const submitBtn = document.getElementById("submitBtn");

    if (submitBtn) {
        submitBtn.addEventListener("click", async function() {
            
            const accept = document.getElementById("accept");
            if (!accept || !accept.checked) {
                alert("⚠️ กรุณายืนยันการยอมรับเงื่อนไขก่อนส่งข้อมูล");
                return;
            }

            // ดึงค่าข้อมูลทั่วไป
            const inspector = document.getElementById("inspector")?.value.trim();
            const plate = document.getElementById("plate")?.value.trim();
            const station = document.getElementById("station")?.value.trim();
            
            // ดึงค่าประเภทรถ
            const selectType = document.getElementById("vehicleType")?.value;
            const customType = document.getElementById("customVehicleType")?.value.trim();
            let vehicleType = selectType === "อื่น ๆ" ? customType : selectType;

            if (!inspector || !vehicleType || !plate || !station) {
                alert("⚠️ กรุณากรอกข้อมูลทั่วไป (ผู้ตรวจ, ประเภทรถ, ทะเบียนรถ, สถานี) ให้ครบถ้วน");
                prevStep();
                return;
            }

            // ตรวจสอบรูปภาพและการเลือกสถานะเฉพาะรายการที่ active
            let missingImages = [];
            let missingStatus = [];

            activeItems.forEach(item => {
                const i = item.id;
                const cameraInput = document.getElementById(`camera${i}`);
                const galleryInput = document.getElementById(`gallery${i}`);
                
                const hasCameraImg = cameraInput && cameraInput.files && cameraInput.files.length > 0;
                const hasGalleryImg = galleryInput && galleryInput.files && galleryInput.files.length > 0;
                const hasUploadedBefore = !!uploadedFileUrls[i];

                if (!hasCameraImg && !hasGalleryImg && !hasUploadedBefore) {
                    missingImages.push(i);
                }

                const statusChecked = document.querySelector(`input[name="status${i}"]:checked`);
                if (!statusChecked) {
                    missingStatus.push(i);
                }
            });

            if (missingImages.length > 0) {
                alert(`⚠️ กรุณาเพิ่มรูปภาพให้ครบถ้วนก่อนเลือกสถานะ (ยังไม่ได้เพิ่มรูปข้อ: ${missingImages.join(", ")})`);
                return;
            }

            if (missingStatus.length > 0) {
                alert(`⚠️ กรุณาเลือกระบุผลการตรวจให้ครบถ้วน (ยังไม่ได้ตรวจข้อ: ${missingStatus.join(", ")})`);
                return;
            }

            // สร้างและดาวน์โหลด PDF Certificate
            await generateAndDownloadPDF({
                inspector,
                vehicleType,
                plate,
                station
            });
        });
    }
};


// ======================================
// 6. ฟังก์ชันสร้างและดาวน์โหลด PDF Certificate
// ======================================

async function generateAndDownloadPDF(formData) {
    const submitBtn = document.getElementById("submitBtn");

    const dateStr = document.getElementById("currentDate")?.innerText || "-";
    const timeStr = document.getElementById("currentTime")?.innerText || "-";

    // ใส่ข้อมูลลงใน Certificate
    if (document.getElementById("pdf-inspector")) document.getElementById("pdf-inspector").innerText = formData.inspector;
    if (document.getElementById("pdf-vehicle-type")) document.getElementById("pdf-vehicle-type").innerText = formData.vehicleType;
    if (document.getElementById("pdf-plate")) document.getElementById("pdf-plate").innerText = formData.plate;
    if (document.getElementById("pdf-station")) document.getElementById("pdf-station").innerText = formData.station;
    if (document.getElementById("pdf-date")) document.getElementById("pdf-date").innerText = dateStr;
    if (document.getElementById("pdf-time")) document.getElementById("pdf-time").innerText = timeStr;
    if (document.getElementById("pdf-scope-plate")) document.getElementById("pdf-scope-plate").innerText = formData.plate;

    // ใส่รูปถ่ายใน Scope Of Inspection (ดึงเฉพาะรูปของ activeItems)
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

    const opt = {
        margin:       0,
        filename:     `Certificate_${formData.plate}_${dateStr.replace(/\//g, '-')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            width: 793,
            height: 1122,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ กำลังสร้างใบ Certificate...";
        }

        await html2pdf().set(opt).from(element).save();

        alert("✅ ตรวจสอบ ส่งข้อมูล และดาวน์โหลดใบ Certificate เรียบร้อยแล้ว!");
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("❌ เกิดข้อผิดพลาดในการดาวน์โหลด PDF กรุณาลองใหม่อีกครั้ง");
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