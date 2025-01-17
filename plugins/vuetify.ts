import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import '@mdi/font/css/materialdesignicons.css'; // Material Design Icons
import * as directives from 'vuetify/directives';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi', // Use Material Design Icons
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#6200ea',
            secondary: '#03dac6',
            background: '#ffffff',
            surface: '#f5f5f5',
            error: '#b00020',
            success: '#4caf50',
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
