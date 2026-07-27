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
    // 🔒 ตรวจสอบการกรอกข้อมูลใน Step 1 ให้ครบถ้วนก่อนถัดไป
    const inspector = document.getElementById("inspector")?.value.trim();
    const plate = document.getElementById("plate")?.value.trim();
    const station = document.getElementById("station")?.value.trim();
    const selectType = document.getElementById("vehicleType")?.value;
    const customType = document.getElementById("customVehicleType")?.value.trim();

    // เช็คว่าประเภทรถเลือก "อื่น ๆ" แล้วพิมพ์ระบุไว้หรือไม่
    const vehicleType = selectType === "อื่น ๆ" ? customType : selectType;

    // เก็บรายการช่องที่ยังไม่ได้กรอกเพื่อแจ้งเตือน
    let missingFields = [];
    if (!inspector) missingFields.push("ชื่อผู้ตรวจ");
    if (!selectType) missingFields.push("ประเภทรถ");
    if (selectType === "อื่น ๆ" && !customType) missingFields.push("การระบุประเภทรถเพิ่มเติม");
    if (!plate) missingFields.push("ทะเบียนรถ");
    if (!station) missingFields.push("สถานี/จุดตรวจ");

    if (missingFields.length > 0) {
        alert(`⚠️ กรุณากรอกข้อมูลหน้าแรกให้ครบถ้วนก่อนกดถัดไป:\n- ${missingFields.join("\n- ")}`);
        return; // หยุดการทำงาน ไม่ให้ไป Step 2
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

    // กำหนดรายการตรวจ (IDs) และชื่อส่วนตามประเภทรถ (ตัดคำว่า "ชุดที่ X" ออกแล้ว)
    let targetIds = [];
    let groupTitle = "";

    if (vehicleType === "รถเทเลอร์" || vehicleType === "เทเลอร์") {
        targetIds = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else if (vehicleType === "รถพ่วง") {
        targetIds = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else if (vehicleType === "รถสิบล้อ") {
        targetIds = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else if (vehicleType === "รถหกล้อ") {
        targetIds = [1, 4, 5, 8, 9, 10, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    } else {
        // สำหรับ รถอีแต๋น และ อื่น ๆ
        targetIds = [1, 4, 8, 11, 12];
        groupTitle = `📋 รายการตรวจ (${vehicleType})`;
    }

    // กรองเอาเฉพาะไอเทมที่มี id ตรงกับที่กำหนด
    activeItems = allItems.filter(item => targetIds.includes(Number(item.id)));

    if (titleElement) {
        titleElement.innerText = groupTitle;
    }

    // สร้าง HTML สำหรับแต่ละรายการ
    activeItems.forEach((item, index) => {
        const no = item.id;          // id ดั้งเดิมสำหรับใช้ผูก ID ของ HTML elements และรูปภาพ
        const displayNo = index + 1; // ลำดับที่ใช้แสดงผลจริงบนหน้าจอ (เรียง 1, 2, 3, ...)

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
                    <input type="radio" id="accept${no}" name="status${no}" value="ยอมรับ" class="status-btn-check" disabled>
                    <label for="accept${no}" class="btn-status btn-accept disabled-label">ผ่าน</label>

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
            
            // 1. ดึงค่าข้อมูลทั่วไปหน้าแรก
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

            // 2. ตรวจสอบว่าแนบรูปและเลือกสถานะครบทุกข้อหรือยัง
            let missingImages = [];
            let missingStatus = [];
            let rejectedItems = []; // เก็บข้อที่ไม่ผ่าน

            activeItems.forEach((item, index) => {
                const i = item.id;
                const displayNo = index + 1; // ลำดับข้อที่แสดงบนหน้าจอ
                
                const cameraInput = document.getElementById(`camera${i}`);
                const galleryInput = document.getElementById(`gallery${i}`);
                
                const hasCameraImg = cameraInput && cameraInput.files && cameraInput.files.length > 0;
                const hasGalleryImg = galleryInput && galleryInput.files && galleryInput.files.length > 0;
                const hasUploadedBefore = !!uploadedFileUrls[i];

                // เช็คว่าแนบรูปหรือยัง
                if (!hasCameraImg && !hasGalleryImg && !hasUploadedBefore) {
                    missingImages.push(displayNo);
                }

                // เช็คผลการตรวจ
                const statusChecked = document.querySelector(`input[name="status${i}"]:checked`);
                if (!statusChecked) {
                    missingStatus.push(displayNo);
                } else if (statusChecked.value === "ไม่ยอมรับ") {
                    // ถ้าเลือกผลการตรวจเป็น "ไม่ผ่าน" (ไม่ยอมรับ)
                    rejectedItems.push(displayNo);
                }
            });

            // แจ้งเตือนกรณีแนบรูปไม่ครบ
            if (missingImages.length > 0) {
                alert(`⚠️ กรุณาเพิ่มรูปภาพให้ครบถ้วนก่อนส่งข้อมูล (ยังไม่ได้เพิ่มรูปข้อ: ${missingImages.join(", ")})`);
                return;
            }

            // แจ้งเตือนกรณีเลือกสถานะไม่ครบ
            if (missingStatus.length > 0) {
                alert(`⚠️ กรุณาเลือกระบุผลการตรวจให้ครบถ้วน (ยังไม่ได้ตรวจข้อ: ${missingStatus.join(", ")})`);
                return;
            }

            // ⛔ 3. เพิ่มเงื่อนไข: หากมีข้อที่ไม่ผ่าน ห้ามยอมรับเงื่อนไขและส่งฟอร์ม
            if (rejectedItems.length > 0) {
                const acceptCheck = document.getElementById("accept");
                if (acceptCheck) acceptCheck.checked = false; // เอาเครื่องหมายถูกออกทันที

                alert(`❌ ไม่สามารถส่งข้อมูลได้ เนื่องจากมีรายการที่ไม่ผ่านการตรวจ\n\nรายการที่ไม่ผ่าน ได้แก่ ข้อ: ${rejectedItems.join(", ")}\n\n👉 กรุณาแก้ไขให้ผ่านก่อนดำเนินการต่อ`);
                return;
            }

            // 4. ตรวจสอบการติ๊กยอมรับเงื่อนไข
            const accept = document.getElementById("accept");
            if (!accept || !accept.checked) {
                alert("⚠️ กรุณายืนยันการยอมรับเงื่อนไขก่อนส่งข้อมูล");
                return;
            }

            // 5. หากผ่านเงื่อนไขทั้งหมด ทำการสร้างและดาวน์โหลด PDF Certificate
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
