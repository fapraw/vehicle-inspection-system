from flask import Flask, render_template

app = Flask(__name__)

inspection_items = [
    {"title":"สภาพแผงข้างรถบรรทุกอ้อยต้องแข็งแรงเป็นแนวตรง ,
            รถที่แผงข้างเป็นไม้ต้องไม่ผุหรือชำรุด น๊อตยึดแผงข้างต้องแน่นหนาและแข็งแรง"},
    {"title":"สภาพด้านหน้ารถ"},
    {"title":"สภาพด้านหลังรถ"},
    {"title":"ล้อหน้า"},
    {"title":"ล้อหลัง"},
    {"title":"ไฟหน้า"},
    {"title":"ไฟท้าย"},
    {"title":"กระจก"},
    {"title":"เบรก"},
    {"title":"แบตเตอรี่"},
    {"title":"น้ำมันเครื่อง"},
    {"title":"อุปกรณ์ฉุกเฉิน"}
]

@app.route("/")
def home():
    return render_template("index.html", items=inspection_items)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
