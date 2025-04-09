<script lang="ts">
  import { CSSRuntimeProvider } from '@master/css.svelte'
  import { routeStore } from './lib/store.js'
  import Header from './components/Header.svelte'
  import config from './master.css'
  import AfterEffects from './routes/aftereffects/index.svelte'
  import AEid from './routes/aftereffects/id/index.svelte'
  import '@fontsource-variable/noto-sans-jp'
  import '@fontsource-variable/roboto'
  import '@fontsource-variable/source-code-pro'
  import './assets/scroll.css'

  let path: string = $state('/')
</script>

<CSSRuntimeProvider {config}>
  <div class="w:100svw h:100svh rel bg:primary-main overflow:hidden">
    <Header path={path.split('/')[1]} />
    <div class="w:calc(100%-80px) h:100svh overflow:hidden rel ml:80px p:48px">
      {#if $routeStore === '/'}
        <p class="ml:200px fg:#fff">Tmp Project</p>
      {:else if $routeStore === '/aftereffects'}
        <AfterEffects />
      {:else if $routeStore.includes('/aftereffects/')}
        <AEid />
      {:else if $routeStore === '/photoshop'}
        <p class="ml:200px fg:#fff">Photoshop</p>
      {/if}
    </div>
  </div>
</CSSRuntimeProvider>

<style>
</style>
