from flask import Flask, render_template
import os

# สร้าง Flask App
app = Flask(__name__)

# หน้าแรก
@app.route("/")
def home():
    return render_template("index.html")

# เริ่มต้นโปรแกรม
if __name__ == '__main__':
    # ใส่ host='0.0.0.0' เพื่อเปิดให้เครื่องอื่นเข้ามาใช้งานได้
    app.run(host='0.0.0.0', port=5000, debug=False)
