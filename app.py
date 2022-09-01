from flask import Flask, render_template, request, Response
from flask_pymongo import PyMongo
from bson import json_util
import os

# Configuramos la ruta para los layouts
app = Flask(__name__, template_folder='templates')
# Configuramos la ruta para los archivos estáticos
app._static_folder = os.path.abspath("templates/static/")

# Conexion con la base de datos
app.config['MONGO_DBNAME'] = 'callcenter'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/callcenter'
# Pasamos la configuración de nuestra app a Pymongo
mongo = PyMongo(app)

@app.route("/", methods=["POST", "GET"])
def callcenter():
    # Verificamos que la peticion sea GET y retornamos la plantilla
    if request.method == "GET": 
        return render_template("/layouts/callcenter.html")

    #Verificamos que la petición sea POST
    if request.method == "POST":
        # Almacenos la collecion en una variable
        users = mongo.db.Users
        # Recibimos y alamcenamos la cédula
        dni = request.form["dni"]
        # Buscamos el usuario usando la cédula
        found_user = users.find_one({"dni": dni})
        # Transformamos el resultado de la busqueda a un formato json
        data = json_util.dumps(found_user)
        # Enviamos la respuesta con los datos del usuario buscado
        return Response(data, mimetype="application/json")

# Configuración de ejecución del servidor
if __name__ == '__main__':
    app.run(debug=True, port=4000)