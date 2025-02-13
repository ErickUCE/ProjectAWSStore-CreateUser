# Usa Node.js 22 como imagen base (basada en Debian)
FROM node:22

# Instalar paquetes necesarios para compilar bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos package.json y package-lock.json para instalar dependencias
COPY package.json package-lock.json ./

# Instala dependencias sin incluir las de desarrollo
RUN npm install --omit=dev

# Copia el resto del código fuente
COPY . .

# Reconstruir bcrypt para asegurar compatibilidad en Linux
RUN npm rebuild bcrypt --build-from-source

# Expone los puertos usados por el servicio
EXPOSE 5005 4005

# Comando para ejecutar el servidor desde src/
CMD ["node", "src/server.js"]
