interface Project {
  id: string
  created: string
  updated: string
  name: string
  description: string
  icon: string
  tags: {
    name: string
    color: string
  }[]
  status: string
}

interface FileStructure {
  name: string,
  type : 'file' | 'folder',
  children?: FileStructure[]
}

export type { Project, FileStructure }
