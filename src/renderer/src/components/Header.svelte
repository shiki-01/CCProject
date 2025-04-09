<script lang="ts">
  import Icon from '@iconify/svelte'
  import Link from './Link.svelte'
  import { fade } from 'svelte/transition'

  let isOpen: boolean = $state(false)
  let { path } = $props()

  const icons = [
    {
      icon: 'skill-icons:aftereffects',
      title: 'After Effects',
      link: '/aftereffects'
    },
    {
      icon: 'skill-icons:photoshop',
      title: 'Photoshop',
      link: '/photoshop'
    },
    {
      icon: 'skill-icons:illustrator',
      title: 'Illustrator',
      link: '/illustrator'
    }
  ]
</script>

{#snippet link(config)}
  <Link to={config.link}>
    <button
      class="w:250px h:60px grid grid-template-columns:80px|170px justify-content:space-between align-items:center rel fg:#fff cursor:pointer ~background|.2s|ease-in-out {path ===
      config.link.split('/')[1]
        ? 'bg:primary-main'
        : 'bg:transparent'}"
      onclick={() => {
        isOpen = false
      }}
    >
      <div class="w:100% h:100% flex justify-content:center align-items:center">
        <Icon icon={config.icon} width="32" height="32" />
      </div>
      <div class="w:100% h:100% pr:16px flex justify-content:center align-items:center">
        <p class="text:16px">{config.title}</p>
      </div>
    </button>
  </Link>
{/snippet}

{#if isOpen}
  <button
    transition:fade={{ duration: 200 }}
    aria-label="close"
    class="w:100dvw h:100dvh fixed top:0 left:0 z:49 bg:primary-dark/80% flex justify-content:center align-items:center fg:#fff cursor:pointer"
    onclick={() => (isOpen = !isOpen)}
  ></button>
{/if}

<header
  class="h:100dvh fixed top:0 left:0 z:50 bg:primary-dark box:content br:4px|border|solid flex flex:column pointer-events:auto"
  style="width: {isOpen ? '250px' : '80px'}"
>
  <div class="w:100% h:100% flex flex:column">
    <button
      class="w:80px h:80px flex justify-content:center align-items:center fg:#fff cursor:pointer"
      onclick={() => (isOpen = !isOpen)}
    >
      <Icon icon="mdi:menu" width="32" height="32" />
    </button>
    <div class="flex flex:column gap:8px overflow:hidden">
      {#each icons as icon}
        {@render link(icon)}
      {/each}
    </div>
  </div>
  <div class="w:100% h:80px flex flex:column justify-content:center overflow:hidden">
    {@render link({
      icon: 'mdi:settings',
      title: 'Settings',
      link: '/settings'
    })}
  </div>
</header>

<style>
  header {
    transition: width 0.2s ease-in-out;
  }
</style>
