<script lang="ts">
  import { Link } from 'svelte-routing'
  import Icon from '@iconify/svelte'

  let {
    title,
    created,
    updated,
    contributors,
    tags
  }: { title: string; created: string; updated: string; contributors: any[]; tags: any[] } =
    $props()
</script>

<div class="w:100% h:fit flex flex:column gap:12px fg:#fff">
  <p class="font:1.6em font:bold">{title}</p>
  <div class="w:100% h:fit flex flex:row gap:16px">
    <p>Created: {created}</p>
    <p>Updated: {updated}</p>
  </div>
  <div class="w:100% h:32px flex flex:row align-items:center gap:32px">
    <Link to="/aftereffects/settings?tab=contributor" class="w:fit h:fit flex flex:row">
      {#each contributors as contributor}
        <div class="w:12px h:32px rel flex justify-content:center align-items:center">
          <div
            class="w:32px h:32px abs top:0 left:0 flex justify-content:center align-items:center bg:primary-dark r:full b:2px|#fff|solid"
          >
            {#if contributor.icon}
              <img
                src={contributor.icon}
                alt={contributor.name}
                class="w:24pc h:24px obj:contain r:full"
              />
            {:else}
              <Icon icon="mdi:person-circle" width="24" height="24" />
            {/if}
          </div>
        </div>
      {/each}
    </Link>
    <div class="w:100% h:fit flex flex:row gap:16px">
      {#each tags as tag}
        <div
          style="background-color: {tag.color}"
          class="tag w:fit h:32px px:8px rel b:2px|#fff|solid r:8px flex flex:row justify-content:center align-items:center gap:8px"
        >
          <p class="">{tag.name}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
