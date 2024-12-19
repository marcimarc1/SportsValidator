FROM node:16-alpine as builder
WORKDIR /frontend
COPY /frontend /frontend
RUN npm install
RUN npm run build

CMD ["npm", "start"]