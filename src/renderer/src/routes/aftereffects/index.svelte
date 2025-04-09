<script lang="ts">
  import mockProjects from '../../assets/mockProjects.json'
  import type { Project } from '../../../../global.js'
  import FileHead from '../../components/FileHead.svelte'
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'
  import { routeStore } from '../../lib/store.js'

  let files = $state(mockProjects as unknown as Project[])

  const create = async () => {
    if (typeof window === 'undefined') return
    const newFile = {
      id: '',
      name: 'New File',
      description: 'New File Description',
      icon: 'mdi:file',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: [],
      status: 'new',
    } as Project

    const response = await window.api.invoke.project.create(newFile)

    if (response) {
      files.push(newFile)
    }
  }

  onMount(async () => {
    const getFiles = await window.api.invoke.project.getAll()
    console.log('getFiles', getFiles)
    files = getFiles.data as unknown as Project[]
    console.log('files', files)
  })
</script>

<div class="w:100% h:100% rel flex flex:column gap:24px">
  <button
    class="w:fit h:fit flex flex:row gap:8px p:16px bg:primary-dark b:4px|border|solid cursor:pointer"
    onclick={create}
  >
    <Icon icon="mdi:add" />
  </button>
  {#each files as file}
    <button
      onclick={() => {
        routeStore.set(`/aftereffects/${file.id}`)
      }}
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
    </button>
  {/each}
</div>
