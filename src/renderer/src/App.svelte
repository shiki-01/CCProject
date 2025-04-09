<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import { CSSRuntimeProvider } from '@master/css.svelte'
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
    <Router>
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
        <Route path="/aftereffects/:id/*path" let:params>
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
