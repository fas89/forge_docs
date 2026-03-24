import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

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
            manualChunks: undefined
          }
        }
      }
    }
  }),
  
  shouldPrefetch: false,
  shouldPreload: false,

  head: [
    ['link', { rel: 'icon', href: '/forge_docs/logo.png' }],
    ['meta', { name: 'theme-color', content: '#1a73e8' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { property: 'og:title', content: 'Fluid Forge — Declarative Data Products' }],
    ['meta', { property: 'og:description', content: 'Write YAML, Deploy Anywhere. One contract, every cloud. What Terraform did for infrastructure, Fluid Forge does for data products.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://agentics-rising.github.io/forge_docs/' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Fluid Forge — Declarative Data Products' }],
    ['meta', { name: 'twitter:description', content: 'Write YAML, Deploy Anywhere. One contract, every cloud.' }],
    ['meta', { name: 'keywords', content: 'data products, declarative, data engineering, GCP, BigQuery, AWS, Athena, Snowflake, DuckDB, infrastructure as code, DataOps' }],
  ],

  theme: defaultTheme({
    logo: '/logo.png',
    
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/getting-started/' },
      { text: 'Walkthroughs', 
        children: [
          { text: 'Local (DuckDB)', link: '/walkthrough/local' },
          { text: 'GCP (BigQuery)', link: '/walkthrough/gcp' },
          { text: 'Declarative Airflow', link: '/walkthrough/airflow-declarative' },
          { text: 'Orchestration Export', link: '/walkthrough/export-orchestration' },
          { text: 'Jenkins CI/CD', link: '/walkthrough/jenkins-cicd' },
          { text: 'Universal Pipeline', link: '/walkthrough/universal-pipeline' }
        ]
      },
      { text: 'CLI Reference', link: '/cli/' },
      { text: 'Providers', 
        children: [
          { text: 'Overview', link: '/providers/' },
          { text: 'Architecture', link: '/providers/architecture' },
          { text: 'GCP (BigQuery)', link: '/providers/gcp' },
          { text: 'AWS (S3 + Athena)', link: '/providers/aws' },
          { text: 'Snowflake', link: '/providers/snowflake' },
          { text: 'Local (DuckDB)', link: '/providers/local' },
          { text: 'Custom Providers', link: '/providers/custom-providers' },
          { text: 'Roadmap', link: '/providers/roadmap' }
        ]
      },
      {
        text: 'GitHub',
        link: 'https://github.com/Agentics-Rising/forge-cli'
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          children: [
            '/README.md',
            '/getting-started/',
            '/vision.md'
          ]
        },
        {
          text: 'Walkthroughs',
          children: [
            '/walkthrough/local.md',
            '/walkthrough/gcp.md',
            '/walkthrough/airflow-declarative.md',
            '/walkthrough/export-orchestration.md',
            '/walkthrough/jenkins-cicd.md',
            '/walkthrough/universal-pipeline.md'
          ]
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
            '/cli/generate-airflow.md'
          ]
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
            '/providers/roadmap.md'
          ]
        },
        {
          text: 'Advanced',
          children: [
            '/advanced/blueprints.md',
            '/advanced/governance.md',
            '/advanced/airflow.md',
            '/advanced/custom-llm-agents.md'
          ]
        },
        {
          text: 'Project',
          children: [
            '/contributing.md',
            '/RELEASE_NOTES_0.7.1.md'
          ]
        }
      ]
    },

    repo: 'agentics-rising/fluid-forge-cli',
    docsRepo: 'agentics-rising/forge_docs',
    docsDir: 'docs',
    docsBranch: 'main',
    editLink: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: true,
    contributors: true
  }),

})
