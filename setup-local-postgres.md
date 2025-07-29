# Solución temporal: Usar PostgreSQL local

Dado que Supabase tiene problemas de conectividad, puedes usar una de estas alternativas:

## Opción 1: Railway (Recomendado - Más rápido)
1. Ve a https://railway.app
2. Regístrate con GitHub  
3. Crea nuevo proyecto
4. Añade PostgreSQL service
5. Copia la DATABASE_URL que aparece
6. Pégala en el .env y ejecuta la migración

## Opción 2: Neon Database (También confiable)
1. Ve a https://neon.tech
2. Regístrate gratis
3. Crea nuevo proyecto
4. Copia CONNECTION STRING
5. Úsala en .env

## Opción 3: Aiven PostgreSQL
1. Ve a https://aiven.io
2. Plan gratuito disponible
3. Más estable que Supabase

Una vez que tengas cualquiera de estas URLs funcionando, ejecutamos:
```bash
npm run db:push
node migrate-to-postgres.js
```

¿Prefieres probar con Railway o Neon? Ambos se configuran en menos de 2 minutos.