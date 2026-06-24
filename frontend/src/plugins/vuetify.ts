import "vuetify/styles";

import type { VueI18nAdapterParams } from "vuetify/locale/adapters/vue-i18n";

import { useI18n } from "vue-i18n";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

import i18n from "@/plugins/i18n";

export default createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VCard: {
      rounded: "lg",
    },
    VBtn: {
      rounded: "lg",
      class: "text-none",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VChip: {
      rounded: "lg",
    },
    VAlert: {
      rounded: "lg",
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#1A1A1A",
          secondary: "#FFCC00",
          accent: "#7BA4D9",
          success: "#69BE28",
          info: "#3B82C4",
          warning: "#F4A100",
          error: "#E03131",
          background: "#F4F5F7",
          surface: "#FFFFFF",
          "surface-variant": "#5C5F66",
          "on-surface-variant": "#EDEEF0",
          "surface-bright": "#FFFFFF",
          "surface-light": "#EEF0F2",
        },
        variables: {
          "border-color": "#1A1A1A",
          "border-opacity": 0.08,
          "high-emphasis-opacity": 0.87,
          "medium-emphasis-opacity": 0.62,
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#FFCC00",
          secondary: "#FFCC00",
          accent: "#7BA4D9",
          success: "#69BE28",
          info: "#5AA0DE",
          warning: "#F4A100",
          error: "#FF6B6B",
          background: "#121316",
          surface: "#1C1D21",
          "surface-variant": "#C9CCD1",
          "on-surface-variant": "#2A2C31",
          "surface-bright": "#2A2C31",
          "surface-light": "#26272C",
        },
        variables: {
          "border-color": "#FFFFFF",
          "border-opacity": 0.1,
        },
      },
    },
  },
  locale: {
    // @ts-expect-error false positive for type mismatch (no tsc compilation error)
    adapter: createVueI18nAdapter({ i18n, useI18n } as VueI18nAdapterParams),
  },
});
