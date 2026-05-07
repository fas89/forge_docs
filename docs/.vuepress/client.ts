// =====================================================================
// Fluid Forge — VuePress 2 client config
// =====================================================================
// Registers custom layouts that override the default theme's built-ins
// AND globally registers component(s) usable directly inside markdown.
//
// Picked up at runtime via the `clientConfigFile` setting in config.ts.
// =====================================================================

import { defineClientConfig } from 'vuepress/client'
import { defineAsyncComponent } from 'vue'
import NotFound from './layouts/NotFound.vue'
import VideoEmbed from './components/VideoEmbed.vue'
import CliCast from './components/CliCast.vue'

// Lazy-loaded — Monaco is ~1 MB gzipped. Only the /playground/ route
// triggers the network fetch; every other doc page stays lean.
const Playground = defineAsyncComponent(
  () => import('./components/Playground.vue'),
)

export default defineClientConfig({
  layouts: {
    // Replaces @vuepress/theme-default's built-in 404 page with the
    // branded version in ./layouts/NotFound.vue.
    NotFound,
  },

  enhance({ app }) {
    // Globally register components so any markdown page can embed them.
    //   <VideoEmbed id="dQw4w9WgXcQ" title="…" />
    //   <CliCast src="/demos/local-quickstart.svg" title="…" />
    //   <ClientOnly><Playground /></ClientOnly>
    // Playground is async so SSR doesn't try to instantiate Monaco
    // (which is browser-only) at build time.
    app.component('VideoEmbed', VideoEmbed)
    app.component('CliCast', CliCast)
    app.component('Playground', Playground)
  },
})
