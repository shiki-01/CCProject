<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import { CSSRuntimeProvider } from '@master/css.svelte'
  import { fade } from 'svelte/transition'
  import Header from './components/Header.svelte'
  import config from './master.css'
  import AfterEffects from './routes/aftereffects/index.svelte'
  import AEid from './routes/aftereffects/id/index.svelte'
  import '@fontsource-variable/noto-sans-jp'
  import '@fontsource-variable/roboto'
  import '@fontsource-variable/source-code-pro'
  import './assets/scroll.css'

  let path: string = $state('/')

  const transition = () => {
    path = location.pathname
    if (/^\/aftereffects\/[^/]+\/.+/.test(path)) {
      return {}
    } else {
      return { fn: fade, duration: 120 }
    }
  }
</script>

<CSSRuntimeProvider {config}>
  <div class="w:100svw h:100svh rel bg:primary-main overflow:hidden">
    <Router viewtransition={transition}>
      <Header path={path.split('/')[1]} />
      <div class="w:calc(100%-80px) h:100svh overflow:hidden rel ml:80px p:48px">
        <Route path="/">
          <p class="ml:200px fg:#fff">Tmp Project</p>
        </Route>
        <Route path="/aftereffects">
          <AfterEffects />
        </Route>
        <Route path="/aftereffects/:id" let:params>
          <AEid {params} />
        </Route>
        <Route path="/aftereffects/:id/*file" let:params>
          <AEid {params} />
        </Route>
        <Route path="/photoshop">
          <p class="ml:200px fg:#fff">Photoshop</p>
        </Route>
      </div>
    </Router>
  </div>
</CSSRuntimeProvider>

<style>
</style>
