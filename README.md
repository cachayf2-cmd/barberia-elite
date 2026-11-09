# Barbería Élite

Landing local con HTML5, CSS3 y JavaScript vanilla, sin dependencias ni compilación.

## Abrir

Con Apache de XAMPP iniciado, visita `http://localhost/barberia-elite/`. También puedes abrir `index.html` directamente en un navegador moderno.

## Archivos

- `index.html`: navegación, portada, servicios, nosotros, galería, horarios, ubicación y contacto.
- `styles.css`: diseño carbón, dorado y blanco; adaptación móvil; estados de foco y movimiento reducido.
- `script.js`: menú móvil accesible, enlaces de reserva y validación del formulario para WhatsApp.
- `tests/functional.test.cjs`: pruebas funcionales sin dependencias, ejecutables con Node.js.
- `assets/`: favicon y SVG originales, conservados como alternativa visual.
- `assets/images/`: cuatro fotografías WebP locales y `CREDITOS.md`, con autores, fichas originales y condiciones de licencia verificadas.

## Datos de demostración

La marca, los servicios, precios en soles, horarios, dirección y correo son ficticios. El plano es conceptual y no enlaza a una dirección real. No hay reseñas, premios ni testimonios. No hay backend ni almacenamiento de reservas. El formulario prepara un enlace externo con los datos ingresados; no envía mensajes automáticamente.

## Activar WhatsApp

La única constante `WHATSAPP_NUMBER`, al comienzo de `script.js`, contiene `51998617639`, el número proporcionado por el propietario con código de Perú (51). Todos los botones y el formulario preparan enlaces de WhatsApp hacia ese destino. No se ha verificado si la cuenta está registrada o disponible.

Para cambiar el destino, edita esa constante con código de país y solo dígitos, sin `+`, espacios ni guiones. El usuario debe revisar y enviar el mensaje en WhatsApp; abrir el enlace no confirma una reserva. Los demás datos del sitio siguen siendo de demostración.

## Cómo probar las funciones

1. **Menú móvil:** reduce la ventana a 900 px o menos. Ábrelo con clic, Enter o Espacio. El foco pasa al primer enlace. Recorre los controles con Tab y Mayús+Tab: el foco permanece dentro del menú y su botón. Escape cierra y devuelve el foco al botón. Elegir una sección cierra el menú y lleva el foco al destino. Amplía la ventana con el menú abierto para comprobar que se recupera el desplazamiento.
2. **Navegación suave:** pulsa Servicios, Nosotros, Galería, Visítanos y Volver arriba. Comprueba que los títulos no queden bajo la cabecera fija. Activa la preferencia del sistema de reducir movimiento: el desplazamiento debe ser inmediato.
3. **Reservas y botón flotante:** pulsa Reserva tu cita, el botón de portada, las flechas de cada servicio, el botón de contacto y el flotante. Cada uno abre otra pestaña en `wa.me` hacia el número configurado. Las flechas incluyen su servicio en el parámetro `text`. Revisa el mensaje preparado sin enviarlo si solo estás probando.
4. **Formulario inválido:** intenta continuar con los campos vacíos, un nombre de un carácter, un teléfono con letras o una consulta menor de 10 caracteres. Deben aparecer errores junto a los campos y enfocarse el primer error, sin abrir WhatsApp. Solo espacios tampoco es válido.
5. **Formulario válido:** usa datos de prueba, por ejemplo Ana, +51 999 123 456, Corte de cabello y «Quisiera consultar horarios para el sábado». Al continuar, el enlace debe contener nombre, teléfono, servicio y consulta, conservando tildes y saltos de línea. No hace falta enviarlo. El formulario mantiene los datos y muestra que ninguna reserva está confirmada.
6. **Pestaña bloqueada:** bloquea las ventanas emergentes y envía datos válidos. Usa «Abrir el mensaje preparado en WhatsApp» para continuar manualmente. Edita un campo: el enlace anterior debe desaparecer hasta volver a validar.
7. **Hover y foco:** recorre enlaces, botones y campos con ratón y teclado. Comprueba los estados visuales y el contorno dorado. En móvil, verifica que el botón flotante siga accesible al desplazarte.
8. **Sin JavaScript:** desactívalo y recarga. Se muestra una indicación para activarlo; el formulario no transmite los datos al servidor.

Los enlaces externos usan `noopener noreferrer`. Los datos del formulario se incluyen en la URL de WhatsApp únicamente al continuar; no se almacenan localmente. Usa datos ficticios durante las pruebas.

## Verificación automatizada

Ejecuta `node --check script.js` y `node --test tests/functional.test.cjs` desde esta carpeta. Las nueve pruebas cubren construcción segura de enlaces, menú y foco, validación, preparación del mensaje, carga opcional de fotografía y recuperación de SVG ante errores. Usan un DOM simulado; complementan la revisión en un navegador real.

## Fotografías de portada y galería

La portada y la galería utilizan cuatro fotografías gratuitas de Pexels, descargadas después de verificar las fichas individuales y las condiciones de uso comercial. Consulta [autores, fuentes, licencias y optimización](assets/images/CREDITOS.md). Se muestran como referencias de stock, no como trabajos o instalaciones del negocio ficticio.

Las imágenes se sirven localmente desde `assets/images/`, en WebP: 760 × 900 px para la portada y 480 × 560 px para cada foto de galería. En total pesan aproximadamente 130 KiB. No se consultan servicios de imágenes externos al visitar la página.

Para reemplazar una foto, verifica su licencia y actualiza el archivo `src`, su descripción `alt` y el registro de créditos. Cada imagen conserva `data-fallback-src` y `data-fallback-alt` con su SVG y descripción de alternativa. Si la foto falta o no se puede decodificar, JavaScript recupera ese SVG; también detecta errores anteriores a la ejecución del script. Sin JavaScript se muestran las fotos normalmente, pero no hay sustitución automática ante errores.

El mecanismo previo `data-photo-src` / `data-photo-alt` del hero sigue disponible para cargar otra foto opcional antes de sustituir la imagen visible; permanece vacío por defecto. Ajusta `--hero-photo-position` en `.hero-art` para controlar el recorte (por ejemplo, `50% 35%`). El hero tiene prioridad de carga alta; las imágenes de galería mantienen lazy loading, dimensiones declaradas y decodificación asíncrona. El espacio reservado evita saltos de diseño al cambiar a SVG.

## Comprobación visual y SEO

- **360 y 390 px:** revisa que título, CTA, servicios, precios y formulario no se corten ni produzcan desplazamiento horizontal; que el flotante no tape controles enfocados; y que el texto superpuesto al hero sea legible.
- **768 px:** se usa el menú móvil para evitar comprimir la cabecera. Comprueba la galería de tres columnas, sus pies de imagen y el recorte del hero.
- **1440 px:** revisa la distribución en dos columnas del hero, nosotros y visita, y la alineación de servicios y navegación.
- **Teclado y zoom:** prueba el enlace «Saltar al contenido», todo el recorrido con Tab, Escape en el menú y zoom del navegador al 200 %. Verifica la preferencia de movimiento reducido y el uso con teclado virtual en un móvil real.
- **Fotografía:** con una foto autorizada, prueba el recorte y el contraste a los cuatro anchos. Prueba también una ruta inexistente para confirmar que la ilustración sigue visible.
- **SEO:** se conservan título, descripción, idioma y jerarquía de encabezados y se añaden metadatos Open Graph de texto. No se inventan dominio canónico, imagen social ni datos estructurados de un negocio real. Configúralos solo cuando exista una URL y contenido definitivos.
