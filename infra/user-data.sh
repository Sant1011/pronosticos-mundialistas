#!/bin/bash
# User data para la instancia EC2 (Amazon Linux 2023).
# Instala Node, descarga la API desde el bucket privado de S3 y la deja
# corriendo como servicio en el puerto 80. No necesita SSH: por eso el
# Security Group puede tener una sola regla de entrada.
#
# Requisitos al lanzar la instancia:
#   - IAM instance profile: LabInstanceProfile (le da permiso de leer el bucket privado).
#   - El paquete de la API subido al bucket privado:
#       git archive --format=tar.gz -o api.tar.gz main api
set -euxo pipefail

BUCKET_CODIGO="pronosticos-mundialistas-zambrano-privado"
PAQUETE_API="api.tar.gz"
CORS_ORIGIN="http://pronosticos-mundialistas-zambrano-sitio.s3-website-us-east-1.amazonaws.com"

PUERTO=80
CARPETA=/opt/pronosticos-mundialistas

# 1. Node 24 (LTS)
curl -fsSL https://rpm.nodesource.com/setup_24.x | bash -
dnf install -y nodejs

# 2. Código de la API desde el bucket privado (la instancia lo lee con su rol IAM)
mkdir -p "$CARPETA"
aws s3 cp "s3://$BUCKET_CODIGO/$PAQUETE_API" /tmp/api.tar.gz
tar -xzf /tmp/api.tar.gz -C "$CARPETA"
cd "$CARPETA/api"
npm ci --omit=dev

cat > .env <<EOF
PORT=$PUERTO
CORS_ORIGIN=$CORS_ORIGIN
EOF
chown -R ec2-user:ec2-user "$CARPETA"

# 3. Servicio de systemd: arranca solo y se reinicia si se cae.
# Corre como ec2-user (no como root); CAP_NET_BIND_SERVICE le permite usar el puerto 80.
cat > /etc/systemd/system/pronosticos-api.service <<EOF
[Unit]
Description=API Pronósticos Mundialistas
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=$CARPETA/api
ExecStart=/usr/bin/node src/servidor.js
Restart=always
Environment=NODE_ENV=production
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pronosticos-api
