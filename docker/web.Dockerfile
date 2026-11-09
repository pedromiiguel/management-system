# Front-end estático (Vite) servido pelo nginx, com /api repassado ao serviço `api`.
# Build a partir da raiz do monorepo:
#   docker build -f docker/web.Dockerfile -t beverage-web .
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build --workspace apps/web

FROM nginx:1.27-alpine
COPY docker/web.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
