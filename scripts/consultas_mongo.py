from pymongo import MongoClient
import datetime
from bson import ObjectId

# Clase para representar una consulta
class Consulta:
    def __init__(self, nota: str, coleccion: str, filtro: dict, actualizacion: dict):
        self.nota = nota  # Información sobre lo que hace la consulta
        self.coleccion = coleccion  # Nombre de la colección
        self.filtro = filtro  # Filtro para seleccionar documentos
        self.actualizacion = actualizacion  # Instrucción de actualización

    def ejecutar(self, coleccion):
        """
        Ejecuta la consulta en la colección dada.
        """
        try:
            print(f"Ejecutando consulta: {self.nota}")
            resultado = coleccion.update_many(self.filtro, self.actualizacion)
            print(f"Resultado: {resultado.modified_count} documentos modificados.\n")
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")


# Conexión a la base de datos
def connect_to_db():
    try:
        client = MongoClient("mongodb://localhost:27017")  # Ajusta la URI según tu configuración
        db = client["hydroedge"]
        print("Conexión exitosa a MongoDB")
        return db
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None


# Consultas
def consulta_1():
    return [
        Consulta(
            nota="Actualizar estructura de sensores y actuadores para alinearse con la nueva interfaz.",
            colleccion="cultivos",
            filtro={},
            actualizacion={
                "$set": {
                    "sensores": {
                        "$map": {
                            "input": "$sensores",
                            "as": "sensor",
                            "in": {
                                "sensor_id": "$$sensor.sensor_id",
                                "medida": "$$sensor.measure",
                                "ubicacion": "$$sensor.location",
                                "color": "$$sensor.color",
                                "notas": ""  # Campo agregado
                            }
                        }
                    },
                    "actuadores": {
                        "$map": {
                            "input": "$actuadores",
                            "as": "actuador",
                            "in": {
                                "actuador_id": "$$actuador.actuador_id",
                                "ubicacion": "$$actuador.location",
                                "activo": "$$actuador.status",
                                "valor": "$$actuador.value",
                                "min": "$$actuador.min",
                                "max": "$$actuador.max",
                                "fecha": "$$actuador.updated_at",
                                "notas": "$$actuador.notes",
                                "tipo": "$$actuador.type"
                            }
                        }
                    }
                }
            }
        )
    ]

def consulta_2():
        return [
        Consulta(
            nota="Restaurar la estructura original de sensores y actuadores con los nuevos nombres de atributos.",
            coleccion="cultivos",
            filtro={},
            actualizacion={
                "$set": {
                    "sensores": [
                        {
                            "sensor_id": ObjectId("67889eee058dfecd98544cab"),
                            "medida": 5.5,
                            "ubicacion": "Tanque A",
                            "color": "green",
                            "notas": ""
                        },
                        {
                            "sensor_id": ObjectId("67889eee058dfecd98544cac"),
                            "medida": 23.5,
                            "ubicacion": "Tanque A",
                            "color": "yellow",
                            "notas": ""
                        },
                        {
                            "sensor_id": ObjectId("67889eee058dfecd98544cad"),
                            "medida": 1.2,
                            "ubicacion": "Tanque A",
                            "color": "red",
                            "notas": ""
                        },
                        {
                            "sensor_id": ObjectId("6788a290058dfecd98544cae"),
                            "medida": 50,
                            "ubicacion": "Sala A",
                            "color": "blue",
                            "notas": ""
                        }
                    ],
                    "actuadores": [
                        {
                            "actuador_id": ObjectId("67935081f5d88de05c544cab"),
                            "ubicacion": "Tanque Principal",
                            "activo": True,
                            "valor": 0,
                            "min": 25,
                            "max": 80,
                            "fecha": "2025-01-24T08:50:15.279Z",
                            "notas": "Actuador para regular la bomba de flujo",
                            "tipo": "flujo"
                        },
                        {
                            "actuador_id": ObjectId("67935081f5d88de05c544cac"),
                            "ubicacion": "Tanque Principal",
                            "activo": True,
                            "valor": 0,
                            "min": 25,
                            "max": 80,
                            "fecha": "2025-01-24T08:50:15.280Z",
                            "notas": "Actuador para el nivel de agua",
                            "tipo": "agua"
                        },
                        {
                            "actuador_id": ObjectId("67935081f5d88de05c544cad"),
                            "ubicacion": "Tanque Principal",
                            "activo": True,
                            "valor": 0,
                            "min": 25,
                            "max": 80,
                            "fecha": "2025-01-24T08:50:15.280Z",
                            "notas": "Dosificador de pH+",
                            "tipo": "pH+"
                        },
                        {
                            "actuador_id": ObjectId("67935081f5d88de05c544cae"),
                            "ubicacion": "Tanque Principal",
                            "activo": True,
                            "valor": 0,
                            "min": 25,
                            "max": 80,
                            "fecha": "2025-01-24T08:50:15.280Z",
                            "notas": "Dosificador de pH-",
                            "tipo": "pH-"
                        }
                    ]
                }
            }
        )
    ]

def consulta_3():
    return [
        Consulta(
            nota="Actualizo atributo type por tipo en sensores",
            coleccion="sensores",
            filtro={},
            actualizacion={
                "$rename": {
                    "type": "tipo"
                }
            }
        )
    ]

def consulta_4():
    return [
        Consulta(
            nota="Actualizo atributo type por tipo en actuadores",
            coleccion="actuadores",
            filtro={},
            actualizacion={
                "$rename": {
                    "type": "tipo"
                }
            }
        )
    ]

def consulta_5():
    return [
        Consulta(
            nota="Actualizo atributo colección de medidas",
            coleccion="medidas",
            filtro={},
            actualizacion={
                "$rename": {
                    "timestamp": "fecha",
                    "measurement": "medida",
                    "location" : "ubicacion",
                    "notes": "notas",
                    "valid": "activo"
                }
            }
        )
    ]

def consulta_6():
    """
    Crea (o actualiza por upsert) 3 medidas para cada uno de los 4 actuadores 
    en la colección 'medidas_actuadores'.
    """
    from bson import ObjectId
    from datetime import datetime

    documentos = [
        # --- Actuador 'flujo' (_id=67935081f5d88de05c544cab) ---
        {
            "_id": ObjectId("6795aef554b378ff24544c80"),
            "actuador_id": ObjectId("67935081f5d88de05c544cab"), # 'flujo'
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"), # 'Tomates 2025'
            "fecha": datetime(2025, 1, 17, 12, 0, 0),
            "activo": True,
            "valor": 45,
            "ubicacion": "Tanque A",
            "notas": "Flujo ajustado a 45 mL/s"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c81"),
            "actuador_id": ObjectId("67935081f5d88de05c544cab"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 14, 0, 0),
            "activo": True,
            "valor": 70,
            "ubicacion": "Tanque A",
            "notas": "Aumento temporal del flujo"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c82"),
            "actuador_id": ObjectId("67935081f5d88de05c544cab"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 16, 0, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque A",
            "notas": "Flujo apagado tras el riego"
        },

        # --- Actuador 'agua' (_id=67935081f5d88de05c544cac) ---
        {
            "_id": ObjectId("6795aef554b378ff24544c83"),
            "actuador_id": ObjectId("67935081f5d88de05c544cac"), # 'agua'
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 12, 10, 0),
            "activo": True,
            "valor": 50,
            "ubicacion": "Tanque Principal",
            "notas": "Se estableció agua al 50%"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c84"),
            "actuador_id": ObjectId("67935081f5d88de05c544cac"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 14, 10, 0),
            "activo": True,
            "valor": 70,
            "ubicacion": "Tanque Principal",
            "notas": "Aumento del agua al 70%"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c85"),
            "actuador_id": ObjectId("67935081f5d88de05c544cac"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 16, 10, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Agua apagada para mantenimiento"
        },

        # --- Actuador 'pH+' (_id=67935081f5d88de05c544cad) ---
        {
            "_id": ObjectId("6795aef554b378ff24544c86"),
            "actuador_id": ObjectId("67935081f5d88de05c544cad"), # 'pH+'
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 12, 20, 0),
            "activo": True,
            "valor": 30,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH+ encendido al 30%"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c87"),
            "actuador_id": ObjectId("67935081f5d88de05c544cad"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 14, 20, 0),
            "activo": True,
            "valor": 50,
            "ubicacion": "Tanque Principal",
            "notas": "Se aumentó pH+ al 50%"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c88"),
            "actuador_id": ObjectId("67935081f5d88de05c544cad"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 16, 20, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH+ desactivado"
        },

        # --- Actuador 'pH-' (_id=67935081f5d88de05c544cae) ---
        {
            "_id": ObjectId("6795aef554b378ff24544c89"),
            "actuador_id": ObjectId("67935081f5d88de05c544cae"), # 'pH-'
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 12, 30, 0),
            "activo": True,
            "valor": 25,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH- encendido al 25%"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c8a"),
            "actuador_id": ObjectId("67935081f5d88de05c544cae"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 14, 30, 0),
            "activo": True,
            "valor": 45,
            "ubicacion": "Tanque Principal",
            "notas": "Se incrementó pH- a 45%"
        },
        {
            "_id": ObjectId("6795aef554b378ff24544c8b"),
            "actuador_id": ObjectId("67935081f5d88de05c544cae"),
            "cultivo_id": ObjectId("678860d7058dfecd98544ca9"),
            "fecha": datetime(2025, 1, 17, 16, 30, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH- apagado"
        },
    ]

    consultas = []
    for doc in documentos:
        consultas.append(
            Consulta(
                nota=f"Crear/upsert doc en 'medidas_actuadores' _id={doc['_id']}",
                coleccion="medidas_actuadores",
                filtro={"_id": doc["_id"]},
                actualizacion={"$set": doc}
            )
        )
    return consultas

def consulta_7():
    """
    Crea (o actualiza por upsert) 3 medidas para cada uno de los 4 sensores 
    pertenecientes al cultivo con _id = 678860d7058dfecd98544caa (Sala A).
    """
    from bson import ObjectId
    from datetime import datetime

    # ID del cultivo para Sala A
    cultivo_id_sala_a = ObjectId("678860d7058dfecd98544caa")

    # IDs de los sensores asociados a este cultivo
    # (según tu colección de sensores)
    sensor_ph       = ObjectId("67889eee058dfecd98544cab")  # pH
    sensor_temp     = ObjectId("67889eee058dfecd98544cac")  # Temp
    sensor_ec       = ObjectId("67889eee058dfecd98544cad")  # EC
    sensor_humidity = ObjectId("6788a290058dfecd98544cae")  # Hum

    # Generamos la lista de documentos a insertar (o actualizar con upsert)
    documentos = [
        # --- Sensor pH (67889eee058dfecd98544cab) ---
        {
            "_id": ObjectId("6795aff554b378ff24544c70"),
            "sensor_id": sensor_ph,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 8, 0, 0),
            "medida": 6.0,
            "notas": "Lectura de pH - primera hora",
            "ubicacion": "Tanque A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c71"),
            "sensor_id": sensor_ph,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 10, 0, 0),
            "medida": 6.2,
            "notas": "Lectura de pH - media mañana",
            "ubicacion": "Tanque A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c72"),
            "sensor_id": sensor_ph,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 12, 0, 0),
            "medida": 6.3,
            "notas": "Lectura de pH - mediodía",
            "ubicacion": "Tanque A"
        },

        # --- Sensor Temp (67889eee058dfecd98544cac) ---
        {
            "_id": ObjectId("6795aff554b378ff24544c73"),
            "sensor_id": sensor_temp,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 8, 0, 0),
            "medida": 22.5,
            "notas": "Temperatura temprano en la mañana",
            "ubicacion": "Tanque A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c74"),
            "sensor_id": sensor_temp,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 10, 0, 0),
            "medida": 24.0,
            "notas": "Temperatura subiendo a media mañana",
            "ubicacion": "Tanque A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c75"),
            "sensor_id": sensor_temp,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 12, 0, 0),
            "medida": 25.2,
            "notas": "Temperatura al mediodía",
            "ubicacion": "Tanque A"
        },

        # --- Sensor EC (67889eee058dfecd98544cad) ---
        {
            "_id": ObjectId("6795aff554b378ff24544c76"),
            "sensor_id": sensor_ec,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 8, 0, 0),
            "medida": 1.4,
            "notas": "Conductividad inicial",
            "ubicacion": "Tanque A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c77"),
            "sensor_id": sensor_ec,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 10, 0, 0),
            "medida": 1.6,
            "notas": "Conductividad a media mañana",
            "ubicacion": "Tanque A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c78"),
            "sensor_id": sensor_ec,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 12, 0, 0),
            "medida": 1.7,
            "notas": "Conductividad al mediodía",
            "ubicacion": "Tanque A"
        },

        # --- Sensor Hum (6788a290058dfecd98544cae) ---
        {
            "_id": ObjectId("6795aff554b378ff24544c79"),
            "sensor_id": sensor_humidity,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 8, 0, 0),
            "medida": 60,
            "notas": "Humedad a primera hora",
            "ubicacion": "Sala A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c7a"),
            "sensor_id": sensor_humidity,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 10, 0, 0),
            "medida": 63,
            "notas": "Humedad a media mañana",
            "ubicacion": "Sala A"
        },
        {
            "_id": ObjectId("6795aff554b378ff24544c7b"),
            "sensor_id": sensor_humidity,
            "cultivo_id": cultivo_id_sala_a,
            "activo": True,
            "fecha": datetime(2025, 1, 28, 12, 0, 0),
            "medida": 65,
            "notas": "Humedad al mediodía",
            "ubicacion": "Sala A"
        },
    ]

    # Construimos la lista de consultas de upsert.
    try:
        db["medidas"].insert_many(documentos)
        print("Documentos insertados exitosamente.")
    except Exception as e:
        print(f"Error al insertar documentos: {e}")

def consulta_8(db):
    """
    Inserta 3 medidas de actuadores para cada uno de los 4 actuadores
    en el cultivo con _id = 678860d7058dfecd98544caa ('Sala A').

    Se usan _id únicos para cada documento.
    Si alguno de esos _id ya existiera, se lanzará un DuplicateKeyError.
    """

    # ID del cultivo 'Sala A'
    cultivo_sala_a_id = ObjectId("678860d7058dfecd98544caa")

    # IDs de actuadores (según tu colección de actuadores)
    # ----------------------------------------------------
    # 'flujo'    => 67935081f5d88de05c544cab
    # 'agua'     => 67935081f5d88de05c544cac
    # 'pH+'      => 67935081f5d88de05c544cad
    # 'pH-'      => 67935081f5d88de05c544cae
    # (Ver el array "actuadores" en la definición del cultivo "Sala A")
    actuador_flujo_id = ObjectId("67935081f5d88de05c544cab")
    actuador_agua_id  = ObjectId("67935081f5d88de05c544cac")
    actuador_ph_mas   = ObjectId("67935081f5d88de05c544cad")
    actuador_ph_menos = ObjectId("67935081f5d88de05c544cae")

    # Construimos la lista de documentos a insertar.
    # 3 mediciones para cada uno de los 4 actuadores => 12 documentos.
    documentos = [

        # === Actuador 'flujo' ===
        {
            "_id": ObjectId("6795afb554b378ff24544c90"),
            "actuador_id": actuador_flujo_id,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 8, 0, 0),
            "activo": True,
            "valor": 40,
            "ubicacion": "Tanque Principal",
            "notas": "Flujo encendido al 40% a primera hora"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c91"),
            "actuador_id": actuador_flujo_id,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 10, 0, 0),
            "activo": True,
            "valor": 65,
            "ubicacion": "Tanque Principal",
            "notas": "Flujo aumentado al 65% a media mañana"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c92"),
            "actuador_id": actuador_flujo_id,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 12, 0, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Flujo apagado al mediodía"
        },

        # === Actuador 'agua' ===
        {
            "_id": ObjectId("6795afb554b378ff24544c93"),
            "actuador_id": actuador_agua_id,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 8, 0, 0),
            "activo": True,
            "valor": 50,
            "ubicacion": "Tanque Principal",
            "notas": "Agua al 50% en la mañana"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c94"),
            "actuador_id": actuador_agua_id,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 10, 0, 0),
            "activo": True,
            "valor": 70,
            "ubicacion": "Tanque Principal",
            "notas": "Agua subida al 70% a media mañana"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c95"),
            "actuador_id": actuador_agua_id,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 12, 0, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Agua apagada al mediodía"
        },

        # === Actuador 'pH+' ===
        {
            "_id": ObjectId("6795afb554b378ff24544c96"),
            "actuador_id": actuador_ph_mas,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 8, 0, 0),
            "activo": True,
            "valor": 20,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH+ encendido al 20%"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c97"),
            "actuador_id": actuador_ph_mas,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 10, 0, 0),
            "activo": True,
            "valor": 40,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH+ al 40% a media mañana"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c98"),
            "actuador_id": actuador_ph_mas,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 12, 0, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH+ apagado al mediodía"
        },

        # === Actuador 'pH-' ===
        {
            "_id": ObjectId("6795afb554b378ff24544c99"),
            "actuador_id": actuador_ph_menos,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 8, 0, 0),
            "activo": True,
            "valor": 15,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH- encendido al 15%"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c9a"),
            "actuador_id": actuador_ph_menos,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 10, 0, 0),
            "activo": True,
            "valor": 35,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH- al 35% a media mañana"
        },
        {
            "_id": ObjectId("6795afb554b378ff24544c9b"),
            "actuador_id": actuador_ph_menos,
            "cultivo_id": cultivo_sala_a_id,
            "fecha": datetime.datetime(2025, 1, 28, 12, 0, 0),
            "activo": False,
            "valor": 0,
            "ubicacion": "Tanque Principal",
            "notas": "Dosificador pH- apagado al mediodía"
        },
    ]

    # Insertamos todos los documentos de una sola vez
    try:
        resultado = db["medidas_actuadores"].insert_many(documentos)
        print("¡Documentos de actuadores insertados exitosamente!")
        print("IDs insertados:", resultado.inserted_ids)
    except Exception as e:
        print("Error al insertar documentos de actuadores:", e)

def consulta_9(db):
    """
    Renombra "type" => "tipo" y agrega "tipo" donde falte,
    en la colección 'recetas', dentro de:
      - etapas[].condiciones_ideales[]
      - etapas[].parametros_de_actuadores[]
    Ajusta la lógica de relleno según tus necesidades.
    """

    # Mapeos (ajústalo si tus índices o valores difieren)
    condiciones_mapping = {
        "0": "pH",
        "1": "EC",
        "2": "Temp",
        "3": "Hum"
    }
    actuadores_mapping = {
        "0": "flujo",
        "1": "agua",
        "2": "pH+",
        "3": "pH-"
    }

    # Leemos todas las recetas
    recetas = list(db.recetas.find({}))

    for receta in recetas:
        etapas = receta.get("etapas", [])
        updated_etapas = []

        for etapa in etapas:
            # 1) Renombrar y/o agregar "tipo" en condiciones_ideales
            if "condiciones_ideales" in etapa:
                condiciones = etapa["condiciones_ideales"]
                # condiciones es un objeto { "0": {...}, "1": {...}, etc. }
                for key, cond in condiciones.items():
                    # si existe cond["type"], lo renombramos a cond["tipo"]
                    if "type" in cond:
                        cond["tipo"] = cond["type"]
                        del cond["type"]  # elimina la vieja clave

                    # si NO existe ni "type" ni "tipo", lo agregamos según mapping
                    elif "tipo" not in cond:
                        # Asigna un valor por defecto en base al índice
                        cond["tipo"] = condiciones_mapping.get(key, "Desconocido")

                etapa["condiciones_ideales"] = condiciones

            # 2) Renombrar y/o agregar "tipo" en parametros_de_actuadores
            if "parametros_de_actuadores" in etapa:
                parametros = etapa["parametros_de_actuadores"]
                # parámetros es un objeto { "0": {...}, "1": {...}, etc. }
                for key, param in parametros.items():
                    # si existe param["type"], lo renombramos a param["tipo"]
                    if "type" in param:
                        param["tipo"] = param["type"]
                        del param["type"]  # elimina la vieja clave

                    # si NO existe ni "type" ni "tipo", lo agregamos según mapping
                    elif "tipo" not in param:
                        param["tipo"] = actuadores_mapping.get(key, "Desconocido")

                etapa["parametros_de_actuadores"] = parametros

            updated_etapas.append(etapa)

        # Actualizamos el array de etapas en el documento
        db.recetas.update_one(
            {"_id": receta["_id"]},
            {"$set": {"etapas": updated_etapas}}
        )

    print("Recetas actualizadas correctamente.")


if __name__ == "__main__":
    db = connect_to_db()
    if db:
        consulta_9(db)
