# 🔧 Configuración de Variables de Entorno en Vercel

## ⚠️ PROBLEMA IDENTIFICADO
Vercel no puede conectarse a Supabase: `Can't reach database server at aws-0-sa-east-1.pooler.supabase.com:5432`

## 🎯 SOLUCIÓN INMEDIATA

### 1. **Ir a Vercel Dashboard**
```
https://vercel.com/dashboard
→ Seleccionar proyecto "booking-now"
→ Settings → Environment Variables
```

### 2. **Configurar Variables Críticas**

**DATABASE_URL** (CRÍTICA - Usar connection string optimizada):
```
postgresql://postgres.nwdehgvrqtmljioxfxxj:241ACF1831CC91FF@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&pool_timeout=0&connect_timeout=20&sslmode=require
```

**NEXTAUTH_URL** (Cambiar por tu dominio de Vercel):
```
https://tu-proyecto.vercel.app
```

**NEXTAUTH_SECRET**:
```
rXyzVb3wa6Y8vdaXJLmpPteRNxGixXeK
```

**RESEND_API_KEY**:
```
re_YhtNtaYq_9DhrTa8JRuUK6NQxmgruFn8V
```

**NEXT_PUBLIC_SUPABASE_URL**:
```
https://nwdehgvrqtmljioxfxxj.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGVoZ3ZycXRtbGppb3hmeHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTg4MzgsImV4cCI6MjA2OTM5NDgzOH0.Wc4Y2Jea03ShYhIScru8ye5iSkbhAWEhg2XiGDXD528
```

### 3. **Configurar para TODAS las variables:**
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. **Verificar Configuración de Supabase**

Ir a Supabase Dashboard:
```
https://supabase.com/dashboard/project/nwdehgvrqtmljioxfxxj/settings/database
```

**Verificar:**
- ✅ Connection pooler está habilitado
- ✅ Port 5432 está disponible
- ✅ SSL está habilitado
- ✅ No hay restricciones de IP

### 5. **Connection String Alternativas**

Si la primera no funciona, probar:

**Opción 2 (Direct connection):**
```
postgresql://postgres.nwdehgvrqtmljioxfxxj:241ACF1831CC91FF@db.nwdehgvrqtmljioxfxxj.supabase.co:5432/postgres?sslmode=require&connect_timeout=20
```

**Opción 3 (Con parámetros de timeout):**
```
postgresql://postgres.nwdehgvrqtmljioxfxxj:241ACF1831CC91FF@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30&pool_timeout=30&statement_timeout=30000
```

## 🚀 **Después de Configurar**

### 1. **Redeploy**
```bash
# En Vercel Dashboard:
Deployments → ... → Redeploy
```

### 2. **Probar Healthcheck**
```bash
curl https://tu-proyecto.vercel.app/api/health
```

### 3. **Probar Notificaciones**
```bash
curl https://tu-proyecto.vercel.app/api/tenant/notifications
```

## 🔍 **Si Sigue Fallando**

### Verificar en Supabase:
1. **Network restrictions** → Permitir todas las IPs
2. **Database → Settings → Connection** → Verificar que esté activo
3. **Pooler mode** → Session (recomendado para Vercel)

### Contactar Soporte:
- Si Supabase bloquea conexiones desde Vercel
- Verificar límites de conexión del plan

## ⚡ **Testing Local vs Vercel**

**Local funciona** porque usa `.env` local
**Vercel falla** porque las variables no están correctamente configuradas en el dashboard

**CONFIGURAR VARIABLES EN VERCEL ES CRÍTICO** 🚨