# 📋 Despliegue en Render

## Prerequisitos
1. Cuenta en [Render.com](https://render.com)
2. Base de datos PostgreSQL (recomendado: [Neon](https://neon.tech) - gratis)
3. Repository pushado a GitHub

## Pasos

### 1. Crear/Conectar Base de Datos PostgreSQL
- Opción A: Usar [Neon](https://neon.tech) (recomendado - tiene free tier)
  - Crear proyecto en Neon
  - Copiar la cadena de conexión completa: `postgresql://user:password@...`

### 2. Desplegar en Render
1. Ir a [render.com/dashboard](https://render.com/dashboard)
2. Seleccionar "+ New" → "Web Service"
3. Conectar tu repositorio GitHub (`Marlon136/backend-syntax`)
4. Configurar:
   - **Name:** `syntax-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Node Version:** `24.x`

### 3. Agregar Variables de Entorno
En el panel de Render, ir a "Environment" y agregar:

```
DATABASE_URL=postgresql://... (tu cadena de Neon)
NODE_ENV=production
JWT_SECRET=tu_clave_jwt_segura_aqui
STRIPE_SECRET_KEY=sk_live_xxxxx (si usas Stripe)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (si usas Stripe)
FRONTEND_URL=https://tu-frontend.vercel.app
```

### 4. Deploy
Render se desplegará automáticamente cuando:
- Hagas push a `master`
- O selecciones "Deploy" manualmente en el dashboard

## Troubleshooting

**Error: "nest: not found"**
- ✓ Ya solucionado con `.npmrc`

**Error 134 (Process crashed)**
- Verificar que `DATABASE_URL` está configurada en Render
- Ver logs: Click en "Logs" en el dashboard de Render

**Database connection failed**
- Verificar que la cadena `DATABASE_URL` es correcta
- Verificar que PostgreSQL acepta conexiones remotas

## URLs
- **Backend:** `https://syntax-backend.onrender.com` (o la que Render asigne)
- **Health Check:** `GET https://syntax-backend.onrender.com/` 

## Notas
- El servicio free de Render puede tomar ~15 segundos para responder si estuvo inactivo
- Las variables de entorno se cargan automáticamente en tiempo de despliegue
- Para seedear la BD: ejecutar con `npm run prisma:migrate` manualmente si es necesario
