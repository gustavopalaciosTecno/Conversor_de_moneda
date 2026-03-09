## AGENTS

Proyecto: Conversor de monedas


Rol del agente: Desarrolador web experto con 12 años de experiencia.


Objetivo: crear una aplicación web que nos permita convertir el valor de cualquier moneda a otro, un típico conversor de monedas que además debe consumir un api rest externa para conseguir el valor de las monedas actualizado.

URL del api a consumir(no requiere autenticación ni api key):

https://cdn.moneyconvert.net/api/latest.json

Funcionalidades de la aplicación:
Seleccionar moneda de origen
Seleccionar moneda de destino
Introducir la cantidad
Conversión en tiempo real (sin tener que clicar ningún botón)
Consumo de api externa: (indicado arriba)
Manejo de errores de red (clonado de los valores del api por si falla la conexión o el servicio externo, copiar el fichero json al proyecto y sin fallan las peticiones ajax o incluso no hay conexión a internet tirar o consumir ese json local que hemos copiado)
Indicador de carga
Actualización automática de tasas en cada petición.
Historial de conversiones almacenado en el localstorage del navegador (estará plegado debajo del formulario de conversión y al darle clic aparecerá un listado de las últimas 10 conversiones)

Stack de tecnología:
 - HTML5
 - CSS3 (sin frameworks)
 - JavaScript (vanilla, sin frameworks)

Preferencias generales importantes:
- Todos los textos visibles en la aplicación web deben estar en Español.


Preferencias de diseño:
 -Básate en las imágenes del diseño que tienes en la carpeta design del proyecto y en las imágenes que te he enviado en la conversación	

Preferencias de estilos:
 - Colores (los del diseño)
 - Uso de medidas con rem, usando un font-size base de 10px.
  -Uso de HTML5 nativo y CSS3 nativo (sin frameworks)
  - Usa buenas prácticas de maquetación css y si es necesario usa flexbox y css grid layout.
 - Que la webapp sea responsive.


Preferencias de código:
- No añadas dependencias externa
- HTML debe ser semántico
- No uses alert. confirm, prompt, todo el feeddback debe ser visual en el dom.
- No uses innerHTML, todo el contenido deber ser insertado con appendChild, o previamente creando un elemento con document.createElement.
- Cuidado con olvidar prevenir el default con los eventos en submits o clicks.
- Prioriza el código legible y mantenible
- Prioriza que el código sea sencillo de entender.
- Si el agente duda, que revise las especificaciones del proyecto y sino que pregunte  al usuario.
 

Estructura de archivos:
- carpeta(design - que contiene los diseños )
- carpeta(assets)
   -carpeta(css)
   -carpeta(js)
   -carpeta(img)
- index.html  
- AGENTS.md
