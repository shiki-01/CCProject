<script lang="ts">
  import { routeStore } from '../lib/store'

  let props = $props()

  const { to, children } = props
</script>

<button
  onclick={() => {
    routeStore.set(to)
    props.onClick?.()
  }}
  class="w:fit h:fit flex justify-content:center align-items:center fg:#fff cursor:pointer ~background|.2s|ease-in-out {props.class}"
  {...props}
>
  {@render children?.()}
</button>
