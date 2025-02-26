import os

def get_all_files_text(base_dir, output_file):
    try:
        with open(output_file, 'w', encoding='utf-8') as output:
            for root, _, files in os.walk(base_dir):
                for file in files:
                    if file.endswith('.ts') or file.endswith('.js'):
                        file_path = os.path.join(root, file)
                        with open(file_path, 'r', encoding='utf-8') as f:
                            output.write(f"// --- Contenido de {file_path} ---\n")
                            output.write(f.read())
                            output.write("\n\n")
        print(f"Archivo consolidado creado: {output_file}")
    except Exception as e:
        print(f"Error al procesar los archivos: {e}")

# Configuración
base_dir = "/home/rama/Escritorio/Ledfit/ledfit_back/src"  # Cambia esto a la ruta de tu directorio "src"
output_file = "backend_consolidado.txt"  # Nombre del archivo de salida

get_all_files_text(base_dir, output_file)
