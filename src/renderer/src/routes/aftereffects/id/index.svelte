<script lang="ts">
  import { Link } from 'svelte-routing'
  import Icon from '@iconify/svelte'
  import FileHead from '../../../components/FileHead.svelte'
  import mockProjects from '../../../assets/mockProjects.json'
  import mockFiles from '../../../assets/mockFiles.json'
  import { onMount } from 'svelte'

  let { params } = $props()

  type File = {
    file:
      | string
      | {
          [key: string]: File[]
        }
    id: string
    commit: string
  }

  const { file: filePath } = params

  const fileList = mockFiles as unknown as { id: string, files: File[] }[]
  let files = $state(fileList.find((file) => file.id === params.id)?.files || [])

  const project = mockProjects.find((project) => project.id === params.id) || {
    id: '',
    name: '',
    description: '',
    created: '',
    updated: '',
    tags: []
  }

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

  onMount(() => {
    console.log('filePath', filePath);
    if (typeof filePath === 'string') {
      const pathSegments = filePath.split('/'); // パスを分割
      console.log('pathSegments', pathSegments);

      let currentFiles: File[] = files;

      for (const segment of pathSegments) {
        console.log('segment', segment);
        if (Array.isArray(currentFiles)) {
          const folder = currentFiles.find((file) => file.id === segment); // `id` に基づいて探索
          console.log('folder', folder);

          if (folder && typeof folder.file === 'object' && !Array.isArray(folder.file)) {
            // `folder.file` がオブジェクトの場合、次の階層に進む
            currentFiles = Object.values(folder.file).flat();
          } else if (folder && Array.isArray(folder.file)) {
            // `folder.file` が配列の場合、次の階層に進む
            currentFiles = folder.file;
          } else if (folder && typeof folder.file === 'string') {
            // `folder.file` が文字列の場合、ファイルに到達
            currentFiles = [folder];
            break;
          } else {
            // 該当するフォルダがない場合
            currentFiles = [];
            break;
          }
        }
      }

      files = currentFiles; // 絞り込んだ結果を設定
      console.log('Updated files:', files);
    }
  });
</script>

<div class="w:100% h:100% flex flex:column gap:24px">
  <FileHead title={project.name} created={project.created} updated={project.updated} {contributors} tags={project.tags} />
  <div class="w:100% h:100% flex">
    <div class="w:100% h:100% bg:primary-dark r:8px b:4px|border|solid">
      <div class="w:100% h:40px flex bg:primary-main rt:4px bb:4px|border|solid"></div>
      <table class="w:100% h:100% fg:#fff text:.9em">
        <tbody>
          {#each files as file}
            {@const isFile = typeof file.file === 'object'}
            <tr>
              <td class="bb:1px|#666|solid flex flex:row gap:8px align-items:center">
                {#if isFile}
                  <Icon icon="mdi:folder" width="16" height="16" />
                {:else}
                  <Icon icon="mdi:file-outline" width="16" height="16" />
                {/if}
                <Link
                  to="/aftereffects/{project.id}/{typeof file.file === 'string' ? file.id : file.file.id}"
                  class="cursor:pointer fg:rgb(123,173,255):hover text:underline:hover"
                >
                  {isFile ? Object.keys(file.file)[0] : file.file}
                </Link>
              </td>
              <td class="w:200px bb:1px|#666|solid">
                <Link
                  to="/aftereffects:id/commit"
                  class="cursor:pointer fg:rgb(123,173,255):hover text:underline:hover"
                  >{file.commit}</Link
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
