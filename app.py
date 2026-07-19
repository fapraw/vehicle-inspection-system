from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Inspection(db.Model):
    __tablename__ = "inspection"

    id = db.Column(db.Integer, primary_key=True)
    inspector = db.Column(db.String(100))
    license_plate = db.Column(db.String(20))
    vehicle = db.Column(db.String(100))
    result = db.Column(db.String(20))


with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
