FROM node:8-alpine AS builder
WORKDIR build/
ADD package.json .
ADD package-lock.json .
RUN npm install

ADD public/ public/
ADD src/ src/
ADD babel.config.js .
ADD .postcssrc.js .
ADD .env .
RUN npm run build

FROM nginx:1-alpine
COPY --from=builder /build/dist /usr/share/nginx/html