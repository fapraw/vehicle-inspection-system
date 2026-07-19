// ================================
// แสดงวันที่และเวลาอัตโนมัติ
// ================================

function updateDateTime() {

    const now = new Date();

    // วันที่
    const date = now.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    // เวลา
    const time = now.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    document.getElementById("currentDate").textContent = date;
    document.getElementById("currentTime").textContent = time;
}

// เรียกใช้ทันที
updateDateTime();

// อัปเดตทุก 1 วินาที
setInterval(updateDateTime, 1000);
function previewImage(input, number){

    const file = input.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const img = document.getElementById("preview"+number);

        img.src = e.target.result;

        img.style.display = "block";

        input.previousElementSibling.style.display = "none";

    }

    reader.readAsDataURL(file);

}

const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", function(){

    const accept = document.getElementById("accept");

    if(!accept.checked){

        alert("กรุณายอมรับเงื่อนไขก่อน");

        return;

    }

    alert("พร้อมส่งข้อมูล");

});

