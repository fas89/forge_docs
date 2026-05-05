import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart'
import { readingTimePlugin } from '@vuepress/plugin-reading-time'
import { searchPlugin } from '@vuepress/plugin-search'
import { sitemapPlugin } from '@vuepress/plugin-sitemap'
import { getDirname, path } from 'vuepress/utils'

const __dirname = getDirname(import.meta.url)

const SITE_URL = 'https://agentics-rising.github.io/forge_docs/'
const SITE_HOSTNAME = 'agentics-rising.github.io'

export default defineUserConfig({
  // Override default theme's NotFound layout (and any future custom
  // layouts) via the client config.
  clientConfigFile: path.resolve(__dirname, './client.ts'),

  lang: 'en-US',
  title: 'Fluid Forge',
  description: 'Declarative Data Products — Write YAML, Deploy Anywhere. One contract, every cloud.',

  base: '/forge_docs/',

  bundler: viteBundler({
    viteOptions: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    },
  }),

  shouldPrefetch: false,
  shouldPreload: false,

  // Pick up docs/.vuepress/styles/index.scss automatically.
  // (VuePress 2 default theme convention; no extra config needed beyond
  // having the file at the canonical path.)

  head: [
    ['link', { rel: 'icon', href: '/forge_docs/logo.png' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }], // brand blue (was Google blue #1a73e8)
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],

    // Open Graph
    ['meta', { property: 'og:title', content: 'Fluid Forge — Declarative Data Products' }],
    ['meta', { property: 'og:description', content: 'Write YAML, Deploy Anywhere. One contract, every cloud. What Terraform did for infrastructure, Fluid Forge does for data products.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: SITE_URL }],
    ['meta', { property: 'og:image', content: SITE_URL + 'og-card.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Fluid Forge — Declarative Data Products. 1 file. 4 clouds. 0 rewrites.' }],
    ['meta', { property: 'og:site_name', content: 'Fluid Forge' }],

    // Twitter / X
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Fluid Forge — Declarative Data Products' }],
    ['meta', { name: 'twitter:description', content: 'Write YAML, Deploy Anywhere. One contract, every cloud.' }],
    ['meta', { name: 'twitter:image', content: SITE_URL + 'og-card.png' }],
    ['meta', { name: 'twitter:image:alt', content: 'Fluid Forge — Declarative Data Products. 1 file. 4 clouds. 0 rewrites.' }],

    ['meta', { name: 'keywords', content: 'data products, declarative, data engineering, GCP, BigQuery, AWS, Athena, Snowflake, DuckDB, infrastructure as code, DataOps' }],
  ],

  theme: defaultTheme({
    logo: '/logo.png',

    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/getting-started/' },
      {
        text: 'Walkthroughs',
        children: [
          { text: 'Local (DuckDB)', link: '/walkthrough/local' },
          { text: 'GCP (BigQuery)', link: '/walkthrough/gcp' },
          { text: 'Snowflake Team Collaboration', link: '/walkthrough/snowflake' },
          { text: 'Declarative Airflow', link: '/walkthrough/airflow-declarative' },
          { text: 'Orchestration Export', link: '/walkthrough/export-orchestration' },
          { text: 'Jenkins CI/CD', link: '/walkthrough/jenkins-cicd' },
          { text: 'Universal Pipeline', link: '/walkthrough/universal-pipeline' },
        ],
      },
      { text: 'CLI Reference', link: '/cli/' },
      {
        text: 'Providers',
        children: [
          { text: 'Overview', link: '/providers/' },
          { text: 'Architecture', link: '/providers/architecture' },
          { text: 'GCP (BigQuery)', link: '/providers/gcp' },
          { text: 'AWS (S3 + Athena)', link: '/providers/aws' },
          { text: 'Snowflake', link: '/providers/snowflake' },
          { text: 'Local (DuckDB)', link: '/providers/local' },
          { text: 'Custom Providers', link: '/providers/custom-providers' },
          { text: 'Roadmap', link: '/providers/roadmap' },
        ],
      },
      {
        text: 'GitHub',
        link: 'https://github.com/Agentics-Rising/forge-cli',
      },
      // Versioned docs selector. Today only one version is hosted, but the
      // mechanism is in place so that when 0.9 ships:
      //   1. snapshot the current docs/ tree to docs/v0.8/
      //   2. add { text: 'v0.8.x', link: '/v0.8/' } as a child
      //   3. update the 'latest' label to point at the next stable
      // The dropdown stays in the navbar at all times so visitors can
      // sense the version surface even before there are multiple snapshots.
      {
        text: 'v0.8.x (latest)',
        children: [
          { text: 'v0.8.x — current docs', link: '/' },
          { text: 'Release notes', link: '/RELEASE_NOTES_0.7.1.html' },
          { text: 'Changelog (CLI repo)', link: 'https://github.com/Agentics-Rising/forge-cli/blob/main/CHANGELOG.md' },
        ],
      },
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          children: [
            '/README.md',
            '/getting-started/',
            '/getting-started/snowflake.md',
            '/vision.md',
          ],
        },
        {
          text: 'Walkthroughs',
          children: [
            '/walkthrough/local.md',
            '/walkthrough/gcp.md',
            '/walkthrough/snowflake.md',
            '/walkthrough/airflow-declarative.md',
            '/walkthrough/export-orchestration.md',
            '/walkthrough/jenkins-cicd.md',
            '/walkthrough/universal-pipeline.md',
          ],
        },
        {
          text: 'CLI Reference',
          children: [
            '/cli/README.md',
            '/cli/init.md',
            '/cli/validate.md',
            '/cli/plan.md',
            '/cli/apply.md',
            '/cli/verify.md',
            '/cli/generate-airflow.md',
          ],
        },
        {
          text: 'Providers',
          children: [
            '/providers/README.md',
            '/providers/architecture.md',
            '/providers/gcp.md',
            '/providers/aws.md',
            '/providers/snowflake.md',
            '/providers/local.md',
            '/providers/custom-providers.md',
            '/providers/roadmap.md',
          ],
        },
        {
          text: 'Advanced',
          children: [
            '/advanced/blueprints.md',
            '/advanced/governance.md',
            '/advanced/airflow.md',
            '/advanced/custom-llm-agents.md',
            '/advanced/chatgpt-forge-contract-gpt/',
            '/advanced/forge-copilot-discovery.md',
            '/advanced/forge-copilot-memory.md',
          ],
        },
        {
          text: 'Project',
          children: [
            '/contributing.md',
            '/RELEASE_NOTES_0.7.1.md',
          ],
        },
      ],
    },

    // Source-of-truth repos for "Edit this page on GitHub" + "View on GitHub" links.
    // editLinkPattern points each markdown file at the right path under docsRepo.
    repo: 'Agentics-Rising/forge-cli',
    docsRepo: 'Agentics-Rising/forge_docs',
    docsDir: 'docs',
    docsBranch: 'main',
    editLink: true,
    editLinkText: 'Edit this page on GitHub →',
    editLinkPattern: ':repo/edit/:branch/:path',
    lastUpdated: true,
    lastUpdatedText: 'Last updated',
    contributors: true,
    contributorsText: 'Contributors',

    // Bigger nav font on mobile, looks more confident
    sidebarDepth: 2,
  }),

  plugins: [
    // Cmd+K / "/" client-side search until Algolia DocSearch approval lands.
    // Will be swapped to @vuepress/plugin-docsearch once the API key arrives.
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search docs (press / to focus)',
        },
      },
      maxSuggestions: 8,
      hotKeys: ['s', '/'],
    }),

    // /sitemap.xml for SEO + crawlability. Hostname sets canonical URL.
    sitemapPlugin({
      hostname: SITE_URL,
    }),

    // Mermaid + Chart.js + ECharts diagrams rendering as SVG inside the
    // published docs (not just on GitHub). The README's mental-model
    // flowchart now renders on the live site too.
    markdownChartPlugin({
      mermaid: true,
    }),

    // Inject `readingTime` into every page's data so we can display it
    // in the page header (small but high-leverage UX cue — visitors
    // self-select into a 2-min read vs a 15-min walkthrough).
    readingTimePlugin({
      // Default: 200 words per minute. Override here if needed.
    }),

    // Note: @vuepress/plugin-medium-zoom is bundled with theme-default
    // in rc.128, so we don't register it explicitly. The dep is kept in
    // package.json for documentation/version-pinning. Lazy-loading is
    // also automatic via the bundled plugin — no manual loading="lazy"
    // attribute is needed on doc images.

    // Note: copy-on-code button + tip/warning/danger callouts +
    // tab containers all ship with @vuepress/theme-default by default
    // in rc.128 — no extra plugin wiring needed.
  ],
})
