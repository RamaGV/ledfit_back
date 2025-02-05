from pymongo import MongoClient
import datetime
import random
from bson import ObjectId

# Conexión a la base de datos (ajusta la URI según tu configuración)
client = MongoClient("mongodb://localhost:27017")
db = client["hydroedge"]
medidas_collection = db["medidas"]

# Definimos los ObjectId correspondientes al sensor y al cultivo "Tomates 2025"
sensor_id = ObjectId("67889eee058dfecd98544cac")
cultivo_id = ObjectId("678860d7058dfecd98544ca9")

# Configuración:
num_medidas = 100                              # Número total de medidas a insertar
intervalo = datetime.timedelta(minutes=5)      # Intervalo de 5 minutos entre cada medida
fecha_inicio = datetime.datetime(2025, 1, 28, 12, 0)  # Fecha de inicio (ajusta según lo que necesites)

# Creamos una lista para acumular los nuevos documentos
nuevas_medidas = []

for i in range(num_medidas):
    # Calculamos la fecha para esta medida sumándole (i * 5 minutos) a la fecha de inicio
    fecha_medida = fecha_inicio + i * intervalo

    # Generamos un valor aleatorio para la temperatura (por ejemplo, entre 20 y 30 grados)
    valor = round(random.uniform(20, 30), 1)

    # Creamos el documento de medida
    documento = {
        "sensor_id": sensor_id,
        "cultivo_id": cultivo_id,
        "activo": True,
        "fecha": fecha_medida,
        "notas": "Medida automatizada de temperatura",
        "ubicacion": "Invernadero A",
        "valor": valor
    }

    nuevas_medidas.append(documento)

# Insertamos todas las medidas en la colección usando insert_many
resultado = medidas_collection.insert_many(nuevas_medidas)
print(f"Se insertaron {len(resultado.inserted_ids)} documentos en la colección 'medidas'.")
