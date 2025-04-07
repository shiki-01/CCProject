interface Project {
  id: string
  project_id: string
  created_at: Date
  updated_at: Date
  name: string
  description: string
  icon: string
  tags: string[]
  status: string
  contributor: {
    name: string
    gh_id: string
    icon: string
  }[]
}

export type { Project }
