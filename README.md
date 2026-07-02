# fluentvoiceai-app

# 🎙️ FluentVoice AI — AI-Powered English Language Tutor (PWA)

> ⚠️ **ESTADO DEL PROYECTO: En Progreso (Work in Progress)**
> *Este repositorio se encuentra actualmente en desarrollo activo. La arquitectura base, el enrutamiento y la maquetación UI/UX full-stack ya están implementados, listos para la integración final de credenciales de producción.*

---

## 📋 Descripción General

**FluentVoice AI** es una Aplicación Web Progresiva (PWA) de nivel premium diseñada para revolucionar el aprendizaje autónomo del idioma inglés mediante la práctica conversacional en tiempo real. La plataforma ofrece una interfaz minimalista, limpia y fluida donde el usuario interactúa con un tutor de Inteligencia Artificial mediante voz y texto.

El núcleo del sistema combina modelos de lenguaje alojados en **Groq**, persistencia relacional en tiempo real con **Supabase**, y un motor híbrido de procesamiento de voz nativo que elimina la fricción de uso habitual en plataformas de idiomas tradicionales.

---

## ⚡ Stack Técnico Completo

* **Framework:** Next.js 14 (App Router) optimizado con *Code Splitting* y *Lazy Loading*.
* **Estilos y Componentes:** Tailwind CSS combinando primitivos de Radix UI y componentes reutilizables de **shadcn/ui**.
* **Animaciones:** Framer Motion para microinteracciones fluidas y estados dinámicos del avatar.
* **Gráficas de Progreso:** Recharts para el renderizado de estadísticas analíticas en tiempo real.
* **Base de Datos y Backend:** **Supabase (PostgreSQL)** administrando autenticación, almacenamiento relacional y persistencia de sesiones de chat.
* **Motor de IA (LLM):** **Groq API** ejecutando el modelo ultraveloz de baja latencia **`llama-3.3-70b-versatile`**.
* **Speech-to-Text (STT):** Web Speech API nativa (`webkitSpeechRecognition`) parametrizada para capturas en inglés de EE. UU. (`en-US`).
* **Text-to-Speech (TTS):** Síntesis de voz nativa del navegador optimizada para locución bilingüe encadenada.

---

## 🛠️ Arquitectura y Características Clave

### 1. Integración con Groq API (`llama-3.3-70b-versatile`)
Ubicada en la ruta `app/api/chat/route.ts`, la API del chat cuenta con ingeniería de prompts avanzada y una lógica de negocio robusta:
* **Prompt del Sistema Estructurado:** Fuerza al modelo a actuar como un tutor nativo empático que prioriza correcciones gramaticales proactivas al inicio de cada mensaje y mantiene respuestas conversacionales cortas (de 1 a 3 oraciones).
* **Manejo Inteligente de Fallbacks:** Si la API Key de Groq no se encuentra configurada en el entorno local, el endpoint conmuta de manera transparente a un sistema de respuestas semánticas simuladas para evitar que el front-end falle durante pruebas de UI.
* **Detección de Spanglish:** El modelo detecta automáticamente si el usuario mezcla palabras en español por frustración o vocabulario limitado, interpretando el contexto y brindando la palabra correcta en inglés.
* **Análisis de Progreso en Bloques:** Cada 5 interacciones (`interactionCount % 5 === 0`), el prompt del sistema se reestructura dinámicamente en el backend para obligar a la IA a inyectar un breve resumen de progreso y consejos técnicos en español al final del mensaje.

### 2. Motor de Voz Dual Sincronizado
Ubicado en el componente de cliente `@/components/conversation/conversation-content.tsx`, el sistema gestiona la voz de forma avanzada:
* **Locución Mixta Quirúrgica (`speakMessageMixed`):** Dado que el tutor de IA mezcla explicaciones en inglés con tips en español, el componente utiliza expresiones regulares para detectar delimitadores de texto (ej. "Por cierto:", "Un tip:"). Divide el mensaje de forma exacta y asigna voces nativas independientes en cadena (ej. *Samantha* para inglés y *Paulina/Mónica* para español), reproduciéndolas con una pausa de transición de `300ms` para una naturalidad absoluta.
* **STT con Control de Pausa:** Permite al usuario pausar la grabación del micrófono manteniendo el texto capturado intacto para edición manual antes de enviarlo, reduciendo la ansiedad de hablar frente a la IA. Incluye alertas interactivas (*Toasts*) si el usuario deniega los permisos de hardware.

### 3. Persistencia Relacional con Supabase
El cliente de base de datos se conecta directamente para ofrecer una experiencia duradera:
* **Gestión de Sesiones Sin Fricción:** Al inicializar, la app genera o lee un `session_id` persistido en el `localStorage` del navegador.
* **Modelado de Datos Real:** Sincroniza en tiempo real los mensajes enviados con las tablas `conversations` y `messages` en Supabase PostgreSQL, permitiendo recuperar el historial completo del estudiante al recargar la ventana.
* **Borrado Seguro:** Implementa eliminaciones en cascada directas sobre el backend para reiniciar la experiencia de aprendizaje limpiamente cuando el usuario lo decida.

---

## 📂 Estructura del Repositorio

```text
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts             # Endpoint de Groq con lógica de prompt y fallbacks
│   ├── conversation/
│   │   └── page.tsx                 # Contenedor de la pantalla de conversación
│   ├── exercises/                   # Ruta modular para prácticas y retos de habilidad
│   ├── progress/                    # Ruta para visualización de gráficas con Recharts
│   ├── settings/                    # Panel de configuración de perfil y niveles (A1-C2)
│   ├── layout.tsx                   # Layout global de la aplicación
│   └── page.tsx                     # Dashboard de bienvenida con estadísticas iniciales
├── components/
│   ├── conversation/
│   │   └── conversation-content.tsx # Componente Core: Lógica de STT, TTS y Supabase
│   ├── custom/                      # Componentes de UI atómicos personalizados (Chat, Avatar)
│   └── ui/                          # Componentes base del sistema de diseño (shadcn/ui)
├── lib/
│   └── supabase/
│       └── client.ts                # Inicialización y configuración del cliente de Supabase
```

---

## 🚀 Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```
   *O alternativamente con npm:*
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto e ingresa tus credenciales de desarrollo:
   ```env
   # API Key de Groq (Para activar Llama-3.3-70b de forma real)
   GROQ_API_KEY=tu_api_key_aquí

   # Credenciales de Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
   ```

4. **Levantar el servidor de desarrollo local:**
   ```bash
   pnpm dev
   ```
   *O alternativamente con npm:*
   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación corriendo localmente.
