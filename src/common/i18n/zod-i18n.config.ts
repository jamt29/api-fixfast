import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';

// Cargar traducciones usando require (compatible con todos los módulos)
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const translation = require('zod-i18n-map/locales/es/zod.json');

// Inicializar i18next de forma síncrona
i18next.init({
  lng: 'es',
  resources: {
    es: { zod: translation },
  },
  initImmediate: false, // Inicialización síncrona para evitar problemas de timing
});

// Configurar el mapa de errores de Zod para usar las traducciones
z.setErrorMap(zodI18nMap);

export { z };
