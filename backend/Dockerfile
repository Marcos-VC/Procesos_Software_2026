FROM node:22-alpine

WORKDIR /app
# .npmrc desactiva los scripts de instalación (ver el comentario dentro del fichero).
COPY backend/package.json backend/package-lock.json backend/.npmrc ./
RUN npm install

COPY backend/src ./src
COPY mocks /mocks

EXPOSE 3000
CMD ["npm", "start"]
