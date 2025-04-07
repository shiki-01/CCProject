<script lang="ts">
  import mockProjects from '../../assets/mockProjects.json'
  import { Link } from 'svelte-routing'
  import FileHead from '../../components/FileHead.svelte'

  type Project = {
    id: string
    name: string
    description: string
    created: string
    updated: string
    tags: {
      name: string
      color: string
    }[]
  }

  const files = mockProjects as unknown as Project[]
</script>

<div class="w:100% h:100% flex flex:column gap:24px">
  <div class="w:100% h:100% flex flex:column gap:24px">
    {#each files as file}
      <Link
        to={`/aftereffects/${file.id}`}
        class="w:100% h:fit flex flex:column gap:16px p:24px r:8px bg:primary-dark b:4px|border|solid cursor:pointer"
      >
        <FileHead
          title={file.name}
          created={file.created}
          updated={file.updated}
          contributors={[
            {
              name: 'John Doe',
              icon: ''
            },
            {
              name: 'Jane Doe',
              icon: ''
            }
          ]}
          tags={file.tags}
        />
      </Link>
    {/each}
  </div>
</div>
