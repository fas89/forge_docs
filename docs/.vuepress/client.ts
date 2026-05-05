// =====================================================================
// Fluid Forge — VuePress 2 client config
// =====================================================================
// Registers custom layouts that override the default theme's built-ins
// AND globally registers component(s) usable directly inside markdown.
//
// Picked up at runtime via the `clientConfigFile` setting in config.ts.
// =====================================================================

import { defineClientConfig } from 'vuepress/client'
import NotFound from './layouts/NotFound.vue'
import VideoEmbed from './components/VideoEmbed.vue'

export default defineClientConfig({
  layouts: {
    // Replaces @vuepress/theme-default's built-in 404 page with the
    // branded version in ./layouts/NotFound.vue.
    NotFound,
  },

  enhance({ app }) {
    // Globally register components so any markdown page can embed:
    //   <VideoEmbed id="dQw4w9WgXcQ" title="…" />
    // (or read frontmatter via $frontmatter.videoId pattern — see the
    // header comment of components/VideoEmbed.vue for the canonical
    // usage examples).
    app.component('VideoEmbed', VideoEmbed)
  },
})
