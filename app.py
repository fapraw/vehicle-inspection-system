from flask import Flask, render_template

app = Flask(__name__)

items=[

{
"title":
"สภาพแผงข้างรถบรรทุกอ้อยต้องแข็งแรงเป็นแนวตรง",

"detail":
"- รถที่แผงข้างเป็นไม้ต้องไม่ผุหรือชำรุด\n- น็อตยึดแผงข้างต้องแน่นหนาและแข็งแรง"

},

]

@app.route("/")
def home():
    return render_template("index.html", items=inspection_items)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
