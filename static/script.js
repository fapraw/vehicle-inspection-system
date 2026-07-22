// ======================================
// แสดงวันที่และเวลา
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
// Multi Step Form
// ======================================

let currentStep = 1;
const totalStep = 3;

function showStep(step){

    document.querySelectorAll(".step").forEach(function(page){

        page.classList.remove("active");

    });

    document
        .getElementById("step"+step)
        .classList
        .add("active");

    currentStep = step;

    window.scrollTo({

        top:0,
        behavior:"smooth"

    });

}

function nextStep(){

    if(currentStep < totalStep){

        showStep(currentStep + 1);

    }

}

function prevStep(){

    if(currentStep > 1){

        showStep(currentStep - 1);

    }

}


// ======================================
// Preview รูปภาพ
// ======================================

function previewImage(input, number){

    const file = input.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const preview = document.getElementById("preview"+number);

        preview.src = e.target.result;

        preview.style.display = "block";

        const text = document.getElementById("placeholder"+number);

        if(text){

            text.style.display="none";

        }

    }

    reader.readAsDataURL(file);

}



// ======================================
// ส่งข้อมูล
// ======================================

window.onload = function(){

    const submitBtn = document.getElementById("submitBtn");

    if(submitBtn){

        submitBtn.addEventListener("click", function(){

            const accept = document.getElementById("accept");

            if(!accept.checked){

                alert("กรุณายอมรับเงื่อนไขก่อน");

                return;

            }

            alert("ส่งข้อมูลเรียบร้อย");

        });

    }

}