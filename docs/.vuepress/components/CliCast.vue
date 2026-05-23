<!--
  Fluid Forge — <CliCast> component
  ============================================================
  Embeds an animated CLI demo (asciinema-rendered SVG) with a
  branded terminal-chrome wrapper, click-to-play overlay, replay
  button, and optional caption.

  The svg-term output already includes the macOS three-dot title
  bar. This component adds:
    - the surrounding browser-window-style frame
    - a click-to-play overlay (so the heavy SVG is only fetched
      after the visitor opts in)
    - a replay button
    - an optional caption row beneath

  Usage in markdown (auto-registered globally via client.ts):

    <CliCast
      src="/demos/local-quickstart.svg"
      title="Install → init → validate → apply (DuckDB local)"
      caption="The full local quickstart in 30 seconds. No cloud account needed."
      width="900"
    />

  All props are optional except `src`. The SVG is NOT fetched until
  the visitor clicks Play — index pages with many casts pay zero
  network cost on first paint. The placeholder uses an aspect-ratio
  box so layout doesn't shift when the animation mounts.
  ============================================================
-->

<template>
  <figure
    class="ff-cast"
    :class="{ 'ff-cast--playing': playing }"
    :style="{ '--ff-cast-w': widthPx }"
  >
    <div class="ff-cast__frame">
      <header class="ff-cast__chrome" v-if="title">
        <span class="ff-cast__dot ff-cast__dot--red"></span>
        <span class="ff-cast__dot ff-cast__dot--yellow"></span>
        <span class="ff-cast__dot ff-cast__dot--green"></span>
        <span class="ff-cast__title">{{ title }}</span>
      </header>

      <div class="ff-cast__viewport">
        <!-- Live animation. CSS @keyframes inside an SVG only run when the
             SVG loads as its own document — an <img> silently freezes it
             at frame 0 — so the cast is embedded via <object>. Mounted
             (and fetched) only after the visitor clicks play; re-keyed by
             replay(). Nothing on the page touches the network for this
             cast until then — index pages with many casts cost ~0KB. -->
        <object
          v-if="playing"
          :key="reloadKey"
          :data="src"
          type="image/svg+xml"
          class="ff-cast__object"
          :aria-label="`CLI demo: ${title || alt || 'demo'}`"
          @load="onObjectLoad"
        >
          <span class="ff-cast__sr">{{ alt || title || 'CLI demo animation' }}</span>
        </object>

        <!-- Click-to-play placeholder. Pure CSS — no image fetched yet.
             The viewport itself carries the aspect-ratio so layout doesn't
             shift when the <object> mounts and the SVG loads. -->
        <button
          v-if="!playing"
          type="button"
          class="ff-cast__play"
          :aria-label="`Play CLI demo: ${title || alt || 'demo'}`"
          @click="play"
        >
          <span class="ff-cast__play-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="56" height="56">
              <circle cx="32" cy="32" r="32" fill="rgba(15, 23, 42, 0.85)" />
              <path d="M24 18 L48 32 L24 46 Z" fill="white" />
            </svg>
          </span>
        </button>

        <!-- Replay (only after first play) -->
        <button
          v-if="playing"
          type="button"
          class="ff-cast__replay"
          aria-label="Replay demo"
          @click="replay"
        >
          ↻
        </button>
      </div>
    </div>

    <!-- Takeaway banner — sits BELOW the terminal frame so it can never
         cover commands. Slides into view after click-to-play; before that
         it's hidden so the resting state stays clean. Just a 💡 + the
         takeaway text — no label word, no chrome. -->
    <aside v-if="insight && playing" class="ff-cast__takeaway">
      <span class="ff-cast__takeaway-icon" aria-hidden="true">💡</span>
      <div class="ff-cast__takeaway-body">
        <p
          v-for="(line, i) in insightLines"
          :key="i"
          :class="{ 'ff-cast__takeaway-headline': i === 0 }"
        >{{ line }}</p>
      </div>
    </aside>

    <figcaption v-if="caption" class="ff-cast__caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  /** Path to the rendered animated SVG (typically /demos/<name>.svg) */
  src: string
  /** Title shown in the terminal title bar */
  title?: string
  /** Caption shown beneath the frame */
  caption?: string
  /** Alt text for accessibility (falls back to title) */
  alt?: string
  /** Frame width in pixels (default 900). String or number, both accepted */
  width?: string | number
  /**
   * The takeaway the viewer should walk away with — rendered as a banner
   * BELOW the terminal frame (so it never covers commands), slides into
   * view once the cast has been played. First line is the headline
   * (bold). Use ` | ` (pipe with surrounding spaces) to separate multiple
   * lines — single-line markdown attributes are reliable, multi-line ones
   * get truncated by markdown-it.
   */
  insight?: string
}

const props = withDefaults(defineProps<Props>(), {
  // 920px matches the intrinsic width of svg-term casts at our default
  // 92-column terminal width (92 cols * 10 px/col = 920 px). Picking
  // anything smaller forces the SVG to scale, which shrinks the text
  // and can make tight indentation look misaligned.
  width: 920,
})

const widthPx = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width,
)

const insightLines = computed<string[]>(() => {
  if (!props.insight) return []
  // Accept ` | ` (pipe with whitespace), real newlines, or literal `\n` —
  // any of them split into separate lines.
  return props.insight
    .split(/\s*\|\s*|\\n|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
})

const playing = ref(false)
const reloadKey = ref(0)

function play() {
  // First mount of <object> — this is when the SVG is actually fetched.
  playing.value = true
}

function replay() {
  // Force the SVG to reload so the animation restarts from frame 0.
  reloadKey.value++
}

function onObjectLoad(e: Event) {
  // An <object>-embedded SVG renders at the SVG document's own intrinsic
  // size — it is NOT scaled to the <object> box the way an <img> is.
  // svg-term emits a fixed width="920" root with no viewBox, so on any
  // card narrower than 920px the playing animation overflows and clips.
  // Normalise the root <svg> to be responsive (viewBox + 100%) so the
  // live cast scales to the frame exactly like the static poster.
  const doc = (e.target as HTMLObjectElement).contentDocument
  const svg = doc?.documentElement as unknown as SVGSVGElement | undefined
  if (!svg || svg.tagName?.toLowerCase() !== 'svg') return
  if (!svg.getAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width') || '0')
    const h = parseFloat(svg.getAttribute('height') || '0')
    if (w > 0 && h > 0) svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet')
}
</script>

<style lang="scss" scoped>
.ff-cast {
  margin: 24px 0;
  max-width: var(--ff-cast-w, 900px);

  &__frame {
    border-radius: 12px;
    overflow: hidden;
    background: #0d1117;
    border: 1px solid var(--vp-c-border, #30363d);
    box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.35);
  }

  &__chrome {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(180deg, #1c2128 0%, #161b22 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2) inset;

    &--red    { background: #ff5f58; }
    &--yellow { background: #ffbd2e; }
    &--green  { background: #28c840; }
  }

  &__title {
    margin-left: 12px;
    font-family: var(--ff-font-mono, ui-monospace), Menlo, Consolas, monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.02em;
  }

  &__viewport {
    position: relative;
    background: #0d1117;
    line-height: 0;
    // svg-term casts render at 920 wide; observed heights span 477–651
    // (median ~560). A fixed 920/560 ratio keeps the placeholder visually
    // honest, and means at most one cast (the tallest) will scroll-jump
    // slightly when the SVG mounts — instead of every cast on the page
    // shifting after Play.
    aspect-ratio: 920 / 560;
  }

  // Live animated cast — fills the viewport box.
  &__object {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    z-index: 1;
  }

  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__play {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    border: 0;
    cursor: pointer;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: background-color 200ms ease, opacity 200ms ease;

    &:hover {
      background: rgba(15, 23, 42, 0.3);
      .ff-cast__play-icon { transform: scale(1.06); }
    }
  }

  &__play-icon {
    transition: transform 200ms ease;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  // Takeaway banner — high-contrast styling that survives any inherited
  // VuePress paragraph styles. Hard-coded colors (no variables) for the
  // light-mode default; dark-mode override lives in the non-scoped style
  // block at the bottom of this file (where html.dark works without
  // getting hashed by scoped CSS).
  &__takeaway {
    margin-top: 14px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    // Solid surface (mode-aware) so the page background can't bleed
    // through and dilute the text contrast.
    background: var(--vp-c-bg-elv-up);
    border: 1px solid var(--vp-c-border);
    border-left: 4px solid var(--vp-c-accent);
    border-radius: 10px;
    animation: ff-cast-takeaway-in 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  &__takeaway-icon {
    font-size: 24px;
    line-height: 1.2;
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__takeaway-body {
    flex: 1;
    min-width: 0;

    // Defensively beat .vp-doc p with explicit colors and !important.
    p {
      margin: 0 !important;
      font-size: 15px !important;
      line-height: 1.6 !important;
      color: var(--vp-c-text-mute) !important;
      opacity: 1 !important;
    }

    p + p {
      margin-top: 6px !important;
    }
  }

  &__takeaway-headline {
    font-size: 16.5px !important;
    font-weight: 700 !important;
    color: var(--vp-c-text) !important;
    line-height: 1.45 !important;
    margin-bottom: 4px !important;
    letter-spacing: -0.005em;
  }

  &__replay {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    backdrop-filter: blur(4px);
    transition: background-color 150ms ease, transform 150ms ease;
    z-index: 2;

    &:hover {
      background: rgba(15, 23, 42, 0.85);
      transform: rotate(-30deg);
    }
  }

  &__caption {
    margin-top: 12px;
    font-size: 0.875rem;
    color: var(--vp-c-text-mute, #6e7681);
    line-height: 1.5;
    text-align: center;
    font-style: italic;
  }
}

@keyframes ff-cast-takeaway-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ff-cast__takeaway {
    animation: none;
  }
}
</style>
