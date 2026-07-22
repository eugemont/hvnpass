# Heaven Pass — app en React Native + Expo

Versión mobile nativa de la landing de validación, hecha con Expo (SDK 56).
Mismo contenido, mismos planes, misma paleta y el mismo pass flotante como
elemento de marca — adaptado a una pantalla de teléfono.

## Cómo correrla

Necesitás Node.js instalado. Después:

```bash
cd heaven-pass-expo
npm install
npx expo install --fix
npx expo start
```

`expo install --fix` ajusta automáticamente cada paquete (expo-font,
expo-linear-gradient, async-storage, etc.) a la versión exacta que
corresponde al SDK de Expo que tengas instalado — hacé esto siempre después
del `npm install`, así evitás quedarte con versiones incompatibles entre sí.

Con `expo start` corriendo, escaneá el código QR con la app **Expo Go**
(Android/iOS) para verla en tu celular, o presioná `i` / `a` en la terminal
para abrir un simulador de iOS o emulador de Android si los tenés
configurados.

## ⚠️ Importante: de dónde sale el número de anotados

La landing web original guardaba la lista de espera en un almacenamiento
compartido entre todas las visitas — cualquiera que abriera el link sumaba
al mismo contador. Ese mecanismo es específico de los Artifacts de Claude y
no existe fuera de ahí.

Esta versión de Expo guarda cada anotado con `AsyncStorage`, que es
**almacenamiento local del dispositivo**. Funciona perfecto para probar la
app vos mismo, pero si instalás la app en dos celulares distintos, cada uno
va a tener su propia lista — no un total combinado.

Si el objetivo es juntar un número real y compartido (que es justamente lo
que el documento pide para mostrarle demanda real a Key Producciones o a un
inversor), hay que sumar un backend chico. Las opciones más simples:

- **Supabase** (Postgres + API REST, tiene un nivel gratuito que alcanza de sobra)
- **Firebase Firestore** (similar, también con nivel gratuito)

Todo el código de la app habla con la lista de espera a través de un solo
archivo — `src/storage.js` — con tres funciones: `saveEntry`,
`getAllEntries` y `deleteEntry`. El día que quieras pasar a un backend real,
ese es el único archivo que hay que tocar; ningún componente necesita
cambiar.

## Estructura del proyecto

```
heaven-pass-expo/
├── App.js                       # pantalla principal, arma todas las secciones
├── src/
│   ├── theme.js                 # colores y tipografías (mismos tokens que la web)
│   ├── content.js                # todo el copy y los datos — fácil de editar
│   ├── storage.js                # capa de almacenamiento (ver nota arriba)
│   ├── useWaitlistCount.js       # hook compartido para el contador en vivo
│   └── components/
│       ├── PassCard.js           # el pass flotante — elemento de marca
│       ├── SectionHeader.js      # eyebrow + título, reutilizado en cada sección
│       ├── CompareSection.js     # "el problema" — antes / con Heaven Pass
│       ├── StepsSection.js       # cómo funciona (3 pasos)
│       ├── PlansSection.js       # Basic / VIP / Black
│       ├── StatsBand.js          # +44 fiestas, capacidad de Open Park, etc.
│       ├── WaitlistForm.js       # formulario + estado de agradecimiento
│       └── AdminModal.js         # panel interno para ver/borrar anotados
```

## Qué cambió respecto a la web

- **Layout de una sola columna**: en el celular todo va apilado verticalmente
  (igual que el breakpoint mobile de la versión web).
- **El "hover" del pass ahora es una animación idle**: como en el teléfono no
  hay mouse, el pass flota suavemente todo el tiempo en vez de inclinarse al
  pasar el cursor. Respeta la configuración de accesibilidad "reducir
  movimiento" del sistema operativo — si el usuario la tiene activada, el
  pass queda quieto.
- **Panel interno**: mismo concepto que en la web (botón al pie que abre una
  lista de anotados con opción de borrar), pero mostrando explícitamente que
  los datos son solo de este dispositivo.
- **Fuentes**: Fraunces, Public Sans e IBM Plex Mono, las mismas tres de la
  web, cargadas vía `@expo-google-fonts` en vez de Google Fonts por CDN.

## Íconos y splash screen

El proyecto no incluye un ícono ni splash screen personalizados todavía —
usa los de Expo por default para que corra sin depender de imágenes que no
existen. Cuando tengas un logo definitivo, seguí la [guía de íconos de
Expo](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
para agregarlo.
