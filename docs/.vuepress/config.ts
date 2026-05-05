import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'
import { copyCodePlugin } from '@vuepress/plugin-copy-code'
import { searchPlugin } from '@vuepress/plugin-search'
import { sitemapPlugin } from '@vuepress/plugin-sitemap'
import { mdEnhancePlugin } from 'vuepress-plugin-md-enhance'

const SITE_URL = 'https://agentics-rising.github.io/forge_docs/'
const SITE_HOSTNAME = 'agentics-rising.github.io'

export default defineUserConfig({
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
    ['meta', { property: 'og:image', content: SITE_URL + 'logo.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:site_name', content: 'Fluid Forge' }],

    // Twitter / X
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Fluid Forge — Declarative Data Products' }],
    ['meta', { name: 'twitter:description', content: 'Write YAML, Deploy Anywhere. One contract, every cloud.' }],
    ['meta', { name: 'twitter:image', content: SITE_URL + 'logo.png' }],

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

    // One-click copy on every code block.
    copyCodePlugin({
      // Show the button on every code block, not just multi-line.
      // Default behavior is fine for most repos; tweaks here if needed.
    }),

    // /sitemap.xml for SEO + crawlability. Hostname sets canonical URL.
    sitemapPlugin({
      hostname: SITE_URL,
    }),

    // Rich markdown features: Mermaid diagrams render natively on the
    // published site (not just on GitHub), tabs, alerts, etc.
    mdEnhancePlugin({
      mermaid: true,        // ```mermaid blocks render as SVG
      tabs: true,           // ::: tabs / ::: code-tabs
      codetabs: true,       // language-grouped code blocks
      align: true,          // ::: center / right
      mark: true,           // ==highlighted text==
      hint: true,           // ::: tip / warning / danger / info / note (extended)
      figure: true,         // captioned figures
      imgLazyload: true,    // <img loading="lazy"> on every doc image
      imgSize: true,        // dimension hints to prevent CLS
    }),
  ],
})
