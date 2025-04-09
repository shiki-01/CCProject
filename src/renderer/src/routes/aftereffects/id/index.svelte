<script lang="ts">
  import Link from '../../../components/Link.svelte'
  import Icon from '@iconify/svelte'
  import FileHead from '../../../components/FileHead.svelte'
  import { onMount } from 'svelte'
  import { routeStore } from '../../../lib/store.js'
  import type { FileStructure, Project } from '../../../../../global.js'

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
  let filePathObj: string[] = $state([])

  let id = $state('')
  let path: string | null = $state(null)

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

  const generatePath = (type: string, path: string, name: string) => {
    const basePath = `/aftereffects/${project.id}`
    const normalizedPath = path.startsWith(basePath) ? path.substring(basePath.length) : path
    const pathBase = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath
    const pathSuffix = pathBase ? `${pathBase}/${name}` : name

    return `/aftereffects/${project.id}/${type === 'folder' ? 'tree' : 'blob'}/${pathSuffix}`
  }

  const updatePath = async () => {
    id = $routeStore.split('/')[2]
    path = $routeStore.split('/').slice(3).join('/') || null

    if (typeof window === 'undefined') return

    console.log($routeStore, path)
    const getProject = await window.api.invoke.project.get(id)
    if (!getProject || !getProject.data) return

    project = getProject.data.project
    structures = getProject.data.structure

    if (path) {
      // パスが/で始まるか確認し、正規化
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path
      const pathParts = normalizedPath.split('/')

      console.log('Normalized path:', normalizedPath)

      const type = pathParts[0] // 'blob'または'tree'

      console.log('Path parts:', pathParts)
      filePathObj = pathParts.slice(1) // typeの部分を除外

      if (type === 'tree') {
        // ネスト対応: pathPartsを逐次的にたどる
        let currentStructure = structures
        for (let i = 1; i < pathParts.length; i++) {
          const folder = currentStructure.find(
            (s) => s.name === pathParts[i] && s.type === 'folder'
          )
          if (folder && folder.children) {
            currentStructure = folder.children
          } else {
            console.error('フォルダが見つかりません:', pathParts[i])
            break
          }
        }
        structures = currentStructure
      } else if (type === 'blob') {
        // ファイルパスの作成方法を改善
        const filePath = pathParts.slice(1).join('/')
        console.log('Loading file:', filePath)
        const response = await window.api.invoke.project.getFile(id, filePath)
        if (response && response.data) {
          file = response.data
        }
      }
    }

    if (structures) {
      structures = structures.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'folder') return 1
        return a.name.localeCompare(b.name)
      })
    } else {
      console.warn('structures is null or undefined')
      structures = []
    }
  }

  onMount(async () => {})

  $effect(() => {
    if (typeof window === 'undefined') return
    const unsubscribe = routeStore.subscribe((value) => {
      if (value.includes('/aftereffects/')) {
        updatePath()
      }
    })
    return () => {
      unsubscribe()
    }
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
      <div class="w:100% h:40px flex flex:row bg:primary-main fg:#fff rt:4px bb:4px|border|solid">
        <div>{filePathObj.join('/')}</div>
      </div>
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
                  <button
                    onclick={() => {
                      routeStore.set(generatePath(structure.type, path || '', structure.name))
                      console.log('Clicked:', structure.name)
                      console.log('to:', generatePath(structure.type, path || '', structure.name))
                    }}
                    class="cursor:pointer fg:rgb(123,173,255):hover text:underline:hover"
                  >
                    {structure.name +
                      ' ' +
                      generatePath(structure.type, path || '', structure.name)}
                  </button>
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
