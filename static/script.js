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
// 3. Preview รูปภาพที่อัปโหลด/ถ่ายรูป
// ======================================

function previewImage(input, number) {
    const file = input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const preview = document.getElementById("preview" + number);
        const placeholder = document.getElementById("placeholder" + number);

        if (preview) {
            preview.src = e.target.result;
            preview.style.display = "block";
        }

        if (placeholder) {
            placeholder.style.display = "none";
        }
    };

    reader.readAsDataURL(file);
}

function chooseImage(id){

    let choice = confirm(
        "เลือกวิธีเพิ่มรูป\n\nกด OK = ถ่ายรูปจากกล้อง\nกด Cancel = เลือกรูปภาพ"
    );

    if(choice){
        // เปิดกล้อง
        document.getElementById("camera"+id).click();
    }
    else{
        // เปิด Gallery
        document.getElementById("gallery"+id).click();
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

            // 4.3 ตรวจสอบว่าเลือกผลการตรวจ (ยอมรับ/ไม่ยอมรับ) ครบทุกข้อหรือยัง
            const totalItems = 12; // จำนวนรายการตรวจทั้งหมด
            let missingItems = [];

            for (let i = 1; i <= totalItems; i++) {
                const statusChecked = document.querySelector(`input[name="status${i}"]:checked`);
                if (!statusChecked) {
                    missingItems.push(i);
                }
            }

            if (missingItems.length > 0) {
                alert(`⚠️ กรุณาเลือกระบุผลการตรวจให้ครบถ้วน (ยังไม่ได้ตรวจข้อ: ${missingItems.join(", ")})`);
                
                // พาไปยัง Step ที่ข้อแรกยังไม่ได้ลงผลตรวจ
                const firstMissing = missingItems[0];
                if (firstMissing <= 4) showStep(1);
                else if (firstMissing <= 8) showStep(2);
                else showStep(3);
                
                return;
            }

            // หากผ่านเงื่อนไขทั้งหมด
            alert("✅ ตรวจสอบและส่งข้อมูลเรียบร้อยแล้ว!");
            
            // หมายเหตุ: ตรงนี้สามารถเพิ่มโค้ดสำหรับ Submit Form ไปยัง Backend (Flask API) ได้ในอนาคต
        });
    }
};
