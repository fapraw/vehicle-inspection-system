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

// เรียกใช้งานครั้งแรกทันที และอัปเดตทุกๆ 1 วินาที
updateDateTime();
setInterval(updateDateTime, 1000);


// ======================================
// 2. Multi Step Form (ระบบเปลี่ยนหน้า)
// ======================================

let currentStep = 1;
const totalStep = 3;

function showStep(step) {
    // ซ่อนทุก Step
    document.querySelectorAll(".step").forEach(function(page) {
        page.classList.remove("active");
    });

    // แสดง Step ที่เลือก
    const activeStep = document.getElementById("step" + step);
    if (activeStep) {
        activeStep.classList.add("active");
    }

    currentStep = step;

    // เลื่อนหน้าจอขึ้นไปด้านบนสุดแบบนุ่มนวล
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function nextStep() {
    if (currentStep < totalStep) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}


// ======================================
// 3. จัดการรูปภาพและการปลดล็อคปุ่มสถานะ
// ======================================

const uploadedFileUrls = {};

function handleImageUpload(input, number) {
    const file = input.files[0];
    if (!file) return;

    // 1. สร้าง Object URL จากไฟล์
    if (uploadedFileUrls[number]) {
        URL.revokeObjectURL(uploadedFileUrls[number]);
    }
    const fileUrl = URL.createObjectURL(file);
    uploadedFileUrls[number] = fileUrl;

    // 2. แสดงชื่อไฟล์ + ปุ่มกดดูรูปภาพ
    const fileInfo = document.getElementById("fileInfo" + number);
    if (fileInfo) {
        fileInfo.innerHTML = `
            <div class="file-attachment">
                <span class="file-name-text">📎 ${file.name}</span>
                <button type="button" class="view-file-btn" onclick="openImageModal(${number})">🔍 ดูรูปภาพ</button>
            </div>
        `;
    }

    // 3. ปลดล็อคปุ่มเลือกสถานะ
    unlockStatusButtons(number);
}

function unlockStatusButtons(number) {
    const radios = document.querySelectorAll(`input[name="status${number}"]`);
    radios.forEach(radio => {
        radio.disabled = false;
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) {
            label.classList.remove('disabled-label');
        }
    });
}

// ======================================
// ระบบเปิด-ปิด Modal ดูรูปภาพ
// ======================================

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
    } else {
        console.error("หา Element #imageModal หรือ #modalImage ไม่เจอในหน้า HTML");
    }
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// ======================================
// 4. การตรวจสอบข้อมูลและการส่งฟอร์ม (Form Submission)
// ======================================

window.onload = function() {
    const submitBtn = document.getElementById("submitBtn");

    if (submitBtn) {
        submitBtn.addEventListener("click", function() {
            
            // 4.1 ตรวจสอบการยอมรับเงื่อนไข
            const accept = document.getElementById("accept");
            if (!accept || !accept.checked) {
                alert("⚠️ กรุณายืนยันการยอมรับเงื่อนไขก่อนส่งข้อมูล");
                return;
            }

            // 4.2 ตรวจสอบข้อมูลทั่วไป (Company, Plate, Station, Inspector)
            const company = document.getElementById("company")?.value.trim();
            const plate = document.getElementById("plate")?.value.trim();
            const station = document.getElementById("station")?.value.trim();
            const inspector = document.getElementById("inspector")?.value.trim();

            if (!company || !plate || !station || !inspector) {
                alert("⚠️ กรุณากรอกข้อมูลทั่วไป (บริษัท, ทะเบียนรถ, สถานี, ผู้ตรวจ) ให้ครบถ้วน");
                showStep(1); // เด้งกลับไปหน้าแรกเพื่อให้ผู้ใช้กรอก
                return;
            }

            // 4.3 ตรวจสอบรูปภาพและการเลือกผลการตรวจ (ยอมรับ / ไม่เกี่ยวข้อง / ไม่ยอมรับ)
            const totalItems = 12; // จำนวนรายการตรวจทั้งหมด
            let missingImages = [];
            let missingStatus = [];

            for (let i = 1; i <= totalItems; i++) {
                // เช็คว่ามีรูปถ่าย/เลือกรูปหรือยัง
                const cameraInput = document.getElementById(`camera${i}`) || document.getElementById(`photo${i}`);
                const galleryInput = document.getElementById(`gallery${i}`);
                
                const hasCameraImg = cameraInput && cameraInput.files && cameraInput.files.length > 0;
                const hasGalleryImg = galleryInput && galleryInput.files && galleryInput.files.length > 0;

                if (!hasCameraImg && !hasGalleryImg) {
                    missingImages.push(i);
                }

                // เช็คว่าเลือกสถานะหรือยัง
                const statusChecked = document.querySelector(`input[name="status${i}"]:checked`);
                if (!statusChecked) {
                    missingStatus.push(i);
                }
            }

            // ถ้ามีข้อที่ยังไม่ได้อัปโหลดรูปภาพ
            if (missingImages.length > 0) {
                alert(`⚠️ กรุณาเพิ่มรูปภาพให้ครบถ้วนก่อนเลือกสถานะ (ยังไม่ได้เพิ่มรูปข้อ: ${missingImages.join(", ")})`);
                navigateToItemStep(missingImages[0]);
                return;
            }

            // ถ้ามีข้อที่ยังไม่ได้ระบุสถานะ
            if (missingStatus.length > 0) {
                alert(`⚠️ กรุณาเลือกระบุผลการตรวจให้ครบถ้วน (ยังไม่ได้ตรวจข้อ: ${missingStatus.join(", ")})`);
                navigateToItemStep(missingStatus[0]);
                return;
            }

            // หากผ่านเงื่อนไขทั้งหมด
            alert("✅ ตรวจสอบและส่งข้อมูลเรียบร้อยแล้ว!");
        });
    }
};

// ฟังก์ชันช่วยเปลี่ยนหน้าไปยัง Step ของข้อที่ขาดข้อมูล
function navigateToItemStep(itemNumber) {
    if (itemNumber <= 4) showStep(1);
    else if (itemNumber <= 8) showStep(2);
    else showStep(3);
}