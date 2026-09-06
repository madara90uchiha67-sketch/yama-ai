export const metadata = { title: "Términos y Condiciones — YAMA AI" };

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "'Inter', ui-sans-serif, sans-serif", color: "#241F18", lineHeight: 1.6 }}>
      <h1 style={{ fontFamily: "'Iowan Old Style', Georgia, serif" }}>Términos y Condiciones de YAMA AI</h1>
      <p><em>Última actualización: {new Date().toLocaleDateString("es")}</em></p>

      <h2>1. Aceptación</h2>
      <p>Al crear una cuenta y usar YAMA AI, aceptas estos términos.</p>

      <h2>2. Descripción del servicio</h2>
      <p>YAMA AI es una herramienta de inteligencia artificial que ayuda a emprendedores y creadores de contenido a generar ideas, contenido, estrategias, y recibir sugerencias personalizadas.</p>

      <h2>3. Planes y pagos</h2>
      <p>YAMA AI ofrece un plan gratuito con límites de uso, y un plan Pro de pago mensual con beneficios adicionales. Los pagos se procesan a través de un proveedor externo. El plan Pro se renueva automáticamente cada mes hasta que se cancele.</p>

      <h2>4. Cancelación</h2>
      <p>Puedes cancelar tu suscripción Pro en cualquier momento. El acceso Pro se mantiene activo hasta el final del período ya pagado; no se realizan reembolsos por períodos parciales, salvo que la ley aplicable indique lo contrario.</p>

      <h2>5. Uso aceptable</h2>
      <p>No debes usar YAMA AI para generar contenido ilegal, dañino, o que infrinja los derechos de terceros. Nos reservamos el derecho de suspender cuentas que violen esta política.</p>

      <h2>6. Límites de responsabilidad</h2>
      <p>YAMA AI genera contenido con inteligencia artificial, que puede contener errores o imprecisiones. Eres responsable de revisar y validar cualquier contenido antes de usarlo en tu negocio.</p>

      <h2>7. Cambios en el servicio</h2>
      <p>Podemos actualizar funciones, precios o estos términos en cualquier momento. Te avisaremos de cambios importantes dentro de la app.</p>

      <h2>8. Contacto</h2>
      <p>Para dudas sobre estos términos, contáctanos por WhatsApp desde la Configuración de la app.</p>
    </div>
  );
}
