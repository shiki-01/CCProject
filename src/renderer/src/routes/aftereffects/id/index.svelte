<script lang="ts">
  import { Link } from 'svelte-routing'
  import Icon from '@iconify/svelte'
  import FileHead from '../../../components/FileHead.svelte'
  import { onMount } from 'svelte'
  import type { FileStructure, Project } from '../../../../../global.js'

  let { params } = $props()

  let project: Project = $state({
    id: '',
    name: '',
    icon: '',
    status: 'new',
    description: '',
    created: '',
    updated: '',
    tags: []
  })

  let structures: FileStructure[] = $state([])
  let file: string | object | Buffer = $state('')

  const { path } = params || { path: '' }

  const contributors = [
    {
      name: 'John Doe',
      icon: '',
      gh_id: 'john_doe'
    },
    {
      name: 'Jane Smith',
      icon: '',
      gh_id: 'jane_smith'
    },
    {
      name: 'Alice Johnson',
      icon: '',
      gh_id: 'alice_johnson'
    },
    {
      name: 'Bob Brown',
      icon: '',
      gh_id: 'bob_brown'
    }
  ]

  onMount(async () => {
    if (typeof window === 'undefined') return
    const getProject = await window.api.invoke.project.get(params.id)
    console.log('getProject', getProject)
    if (!getProject || !getProject.data) return
    project = getProject.data.project
    structures = getProject.data.structure

    if (path) {
      const [type, name] = path.split('/')

      if (type === 'tree') {
        structures = structures.filter((structure) => structure.name === name)[0]
          .children as FileStructure[]
        console.log('structures', structures)
      } else {
        const filePath = path.split('/').slice(1).join('/')
        const response = await window.api.invoke.project.getFile(params.id, filePath)
        console.log('response', response)
        if (response && response.data) {
          file = response.data
        }
      }
    }

    structures = structures.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
  })
</script>

<div class="w:100% h:100% flex flex:column gap:24px">
  <FileHead
    title={project.name}
    created={project.created}
    updated={project.updated}
    {contributors}
    tags={project.tags}
  />
  <div class="w:100% h:100% flex">
    <div class="w:100% h:100% bg:primary-dark r:8px b:4px|border|solid">
      <div class="w:100% h:40px flex bg:primary-main rt:4px bb:4px|border|solid"></div>
      {#if path && path.split('/')[0] === 'blob'}
        <div class="w:100% h:calc(100%-40px) p:24px flex justify-content:center align-items:center">
          {#if file}
            {#if typeof file === 'string'}
              {#if file.startsWith('data:image/')}
                <img src={file} alt="画像" />
              {:else}
                <pre class="fg:#fff w:100% h:100% text:1.2em line-h:1.2em">{file}</pre>
              {/if}
            {:else if typeof file === 'object'}
              <p class="fg:#fff">File is an object</p>
            {:else}
              <p class="fg:#fff">Unknown file type</p>
            {/if}
          {/if}
        </div>
      {:else}
        <table class="w:100% h:100% fg:#fff text:.9em">
          <tbody>
            {#each structures as structure}
              {@const isFile = structure.type === 'file'}
              <tr>
                <td class="bb:1px|#666|solid flex flex:row gap:8px align-items:center">
                  {#if isFile}
                    <Icon icon="mdi:file-outline" width="16" height="16" />
                  {:else}
                    <Icon icon="mdi:folder" width="16" height="16" />
                  {/if}
                  <Link
                    to="/aftereffects/{project.id}/{isFile ? 'blob' : 'tree'}/{structure.name}"
                    class="cursor:pointer fg:rgb(123,173,255):hover text:underline:hover"
                  >
                    {structure.name}
                  </Link>
                </td>
                <td class="w:200px bb:1px|#666|solid">
                  <Link
                    to="/aftereffects:id/commit"
                    class="cursor:pointer fg:rgb(123,173,255):hover text:underline:hover"
                    >Initial Commit</Link
                  >
                </td>
                <td class="w:100px bb:1px|#666|solid">
                  <Link
                    to="/aftereffects:id/commit"
                    class="cursor:pointer fg:rgb(123,173,255):hover text:underline:hover"
                    >last week</Link
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<style>
  table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  tbody {
    display: block;
    overflow-y: auto;
    width: 100%;
    height: 100%;
  }

  tr {
    display: table;
    table-layout: fixed;
    width: 100%;
    height: 32px;
    transition: background-color 0.3s ease;
  }

  td {
    text-align: center;
    vertical-align: middle;
    padding: 8px 12px;
    line-height: 1.5em;
  }

  table td:nth-child(1) {
    padding-left: 16px;
    text-align: left;
  }

  td:nth-child(2) {
    text-align: left;
  }

  td:nth-child(3) {
    padding-right: 16px;
    text-align: right;
  }
</style>
