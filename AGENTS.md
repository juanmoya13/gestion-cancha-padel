<!-- BEGIN:nextjs-agent-rules -->

# OBLIGATORIO:
- Siempre debes leer la carpeta docs para entender el proyecto con su documentación.
- La documentación se debe seguir al pie de la letra.
## Reglas generales de arquitectura de software

### 1. Separación de responsabilidades
- Cada módulo, función o componente debe tener una única responsabilidad clara.
- La lógica de negocio debe estar separada de la capa de presentación.
- La infraestructura no debe filtrar detalles a la lógica de dominio.

---

### 2. Organización y límites arquitectónicos
- La estructura de carpetas debe reflejar capas o dominios, no detalles técnicos accidentales.
- Los límites entre módulos deben ser explícitos y respetados.
- No se permiten dependencias circulares entre capas.

---

### 3. Composición sobre complejidad
- Priorizar composición frente a herencia.
- Evitar abstracciones prematuras o innecesarias.
- Limitar la profundidad de anidación para reducir complejidad cognitiva.

---

### 4. Tamaño y enfoque del código
- Archivos y componentes deben ser pequeños y enfocados.
- Funciones extensas deben dividirse en unidades más simples.
- El código debe ser fácil de leer sin contexto adicional.

---

### 5. Tipado como contrato
- Los tipos e interfaces definen contratos estables entre módulos.
- El tipado debe ser estricto y expresivo.
- Los tipos deben separarse de la lógica de implementación.

---

### 6. Inmutabilidad y flujo de datos
- Preferir estructuras inmutables y funciones puras.
- El flujo de datos debe ser explícito y predecible.
- Evitar mutaciones implícitas o efectos colaterales ocultos.

---

### 7. Manejo explícito de errores
- Los errores deben manejarse de forma explícita y consistente.
- No se permiten fallos silenciosos.
- Los estados inválidos deben ser imposibles o claramente representados.

---

### 8. Validación en los bordes del sistema
- Toda entrada externa debe validarse.
- La validación debe ocurrir lo más cerca posible del origen del dato.
- No confiar en supuestos implícitos sobre datos externos.

---

### 9. Reutilización consciente
- Reutilizar comportamiento, no copiar estructuras.
- Extraer lógica común cuando exista duplicación semántica.
- Evitar acoplamientos innecesarios al reutilizar código.

---

### 10. Convenciones y consistencia
- Usar nombres semánticos y predecibles.
- Mantener convenciones uniformes de archivos, exports y dependencias.
- La consistencia es más importante que la preferencia personal.

---

### 11. Dependencias controladas
- Las dependencias externas deben estar justificadas.
- Evitar dependencias implícitas del entorno o runtime.
- Encapsular librerías externas detrás de interfaces propias.

---

### 12. Lógica de dominio aislada
- La lógica de negocio debe poder ejecutarse fuera del framework.
- El dominio no debe depender de APIs específicas de UI o plataforma.
- Facilitar testeo y evolución independiente del entorno.

---

### 13. Fronteras de ejecución claras
- Diferenciar claramente contextos de ejecución cuando existan.
- No mezclar APIs de distintos entornos sin un límite explícito.
- El código debe declarar sus restricciones de ejecución.

---

### 14. Data fetching y estado
- Centralizar estrategias de obtención y actualización de datos.
- Evitar duplicación de lógica de fetching.
- El estado debe tener una fuente de verdad clara.

---

### 15. Observabilidad y diagnóstico
- El código debe ser fácil de inspeccionar y depurar.
- Los errores deben incluir contexto suficiente.
- Facilitar el seguimiento del flujo de ejecución.

---

### 16. Evolución y mantenibilidad
- El diseño debe facilitar cambios futuros.
- Minimizar el impacto de modificaciones locales.
- Priorizar claridad y mantenibilidad sobre micro-optimizaciones.

---

### 17. Alineación con el framework
- Usar el framework como una herramienta, no como el dominio.
- Respetar su modelo mental sin filtrar detalles al core del sistema.
- Evitar soluciones que contradigan sus abstracciones principales.

---

### 18. Gobernanza del código
- Las reglas de arquitectura deben estar documentadas y versionadas.
- Todo código nuevo debe cumplir las reglas existentes.
- La arquitectura es un contrato vivo, no un documento estático.

- Las migraciones de supabase se crean en la carpeta de supabase para ejecutarlas con el CLI


<!-- END:nextjs-agent-rules -->
