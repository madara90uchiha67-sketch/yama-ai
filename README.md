# YAMA AI — versión SaaS (Next.js)

Mismo diseño y experiencia de siempre, ahora con: backend seguro, cuentas de
usuario, base de datos, memoria en la nube, planes Free/Pro y pagos con
Stripe. Lista para Vercel.

⚠️ **Aviso honesto:** este proyecto no se compiló ni se probó en un entorno
real (el asistente que lo generó no tiene acceso a internet). Sigue esta
guía paso a paso — es muy probable que funcione, pero pueden aparecer
errores menores de dependencias que hay que resolver en tu máquina.

---

## 1. Base de datos (gratis para empezar)

1. Crea un proyecto en https://supabase.com (plan gratuito)
2. Ve a Project Settings → Database → copia la "Connection string" (modo
   "Transaction" / puerto 6543 si usas el pooler, o el directo 5432)
3. Pégala como `DATABASE_URL` en tu `.env`

## 2. Variables de entorno

```bash
cp .env.example .env
```

Completa cada valor (ver comentarios en el archivo). Para
`NEXTAUTH_SECRET` genera uno con:

```bash
openssl rand -base64 32
```

## 3. Instalar y preparar la base de datos

```bash
npm install
npx prisma db push
```

Esto crea todas las tablas (usuarios, conversaciones, memoria, uso) en tu
base de datos de Supabase.

## 4. Probar en local

```bash
npm run dev
```

Abre http://localhost:3000, crea una cuenta y prueba el chat (necesitas
tu `ANTHROPIC_API_KEY` configurada — créala en
https://console.anthropic.com).

## 5. Stripe (pagos de la versión Pro)

1. Crea una cuenta en https://dashboard.stripe.com
2. Products → Add product → "YAMA AI Pro" → precio recurrente mensual →
   copia el **Price ID** (`price_...`) → va en `STRIPE_PRICE_ID_PRO`
3. Developers → API keys → copia la clave secreta → `STRIPE_SECRET_KEY`
4. Developers → Webhooks → Add endpoint →
   `https://tu-dominio.vercel.app/api/billing/webhook` → eventos:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.created`, `customer.subscription.deleted` →
   copia el "Signing secret" → `STRIPE_WEBHOOK_SECRET`

## 6. Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub
2. En https://vercel.com → "Add New Project" → importa el repositorio
3. En "Environment Variables" pega TODAS las variables del `.env`
4. Deploy

Si el build falla, la causa casi siempre es una variable de entorno
faltante (revisa el log de Vercel, dice cuál).

## 7. Íconos de la PWA

Coloca tus propios íconos en:
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)

(Aún no están incluidos — sin ellos la instalación como PWA funciona pero
sin ícono personalizado.)

## 8. Instalar como app (PWA)

Una vez desplegado, cualquier persona puede entrar desde Chrome en Android
y tocar "Instalar app" / "Agregar a pantalla de inicio". Se abre como app
independiente, con ícono propio.

## 9. Camino a Android / iOS nativos

Esta misma versión (que ya es una PWA) se puede envolver más adelante con
Capacitor para generar un `.apk`/`.aab` (Android) o proyecto Xcode (iOS),
apuntando a tu dominio de Vercel ya desplegado. Es un paso aparte cuando
quieras publicarla en las tiendas — avísame cuando llegues ahí.

---

## Límites de uso (para controlar costos)

Editables en `lib/plans.ts`:

- **Free**: 15 mensajes/día, respuestas más cortas, 5 notas de memoria, 2
  análisis de estratega/día
- **Pro**: 300 mensajes/día, respuestas más largas, 200 notas, 50 análisis/día

## Lo que quedó fuera de esta primera versión (para que no falles a ciegas)

- El panel del creador (ideas guardadas, contenido creado, objetivos,
  negocios) todavía no está migrado a la base de datos — la memoria
  "de YAMA" (marca, público, estilo, notas) sí vive en la nube y viaja
  entre dispositivos, pero esas listas del panel son la siguiente pieza
  a mover si las quieres también sincronizadas.
- No hay recuperación de contraseña por email todavía (requiere un
  proveedor de correo tipo Resend o SendGrid) — se puede añadir después.
