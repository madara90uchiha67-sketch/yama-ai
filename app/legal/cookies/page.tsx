export const metadata = { title: "Política de Cookies — YAMA AI" };

export default function CookiesPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "'Inter', ui-sans-serif, sans-serif", color: "#241F18", lineHeight: 1.6 }}>
      <h1 style={{ fontFamily: "'Iowan Old Style', Georgia, serif" }}>Política de Cookies de YAMA AI</h1>
      <p><em>Última actualización: {new Date().toLocaleDateString("es")}</em></p>

      <h2>1. Qué son las cookies</h2>
      <p>Las cookies son pequeños archivos que se guardan en tu navegador para recordar información entre visitas.</p>

      <h2>2. Qué cookies usamos</h2>
      <p>YAMA AI usa únicamente cookies esenciales para el funcionamiento del inicio de sesión (mantener tu sesión activa mientras usas la app). No usamos cookies de publicidad ni de rastreo de terceros.</p>

      <h2>3. Cómo desactivarlas</h2>
      <p>Como estas cookies son necesarias para que puedas iniciar sesión y usar la app, desactivarlas desde tu navegador impedirá que YAMA AI funcione correctamente.</p>

      <h2>4. Contacto</h2>
      <p>Para dudas sobre esta política, contáctanos por WhatsApp desde la Configuración de la app.</p>
    </div>
  );
}
