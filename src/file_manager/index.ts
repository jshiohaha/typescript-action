// const FILETYPE = {
//   RUST: 'rs',
//   JAVASCRIPT: 'js',
//   TYPESCRIPT: 'ts'
// } as const

// type Filetype = typeof FILETYPE[keyof typeof FILETYPE]

// const filetype: Filetype = FILETYPE.RUST
// const filetype2: Filetype = 'rs'

export enum Filetype {
  RUST = 'rs',
  JAVASCRIPT = 'js',
  TYPESCRIPT = 'ts'
}

const IGNOREABLES = ['tests']

const filetypeMapping: Record<string, Filetype> = {
  [Filetype.RUST]: Filetype.RUST,
  [Filetype.JAVASCRIPT]: Filetype.JAVASCRIPT,
  [Filetype.TYPESCRIPT]: Filetype.TYPESCRIPT
}

const fileTypeMapper = (fileType: string): Filetype => {
  return filetypeMapping[fileType]
}

const isIgnoreable = (fileName: string): boolean => {
  return IGNOREABLES.reduce((prev: boolean, ignorable: string) => {
    return prev || fileName.includes(ignorable)
  }, false)
}

export const processChangedFiles = (
  files: string[]
): Map<string, Set<Filetype>> => {
  const changes = new Map<string, Set<Filetype>>()

  files.forEach(f => {
    if (isIgnoreable(f)) return

    const filePathSegments = f.split('/')
    if (filePathSegments.length === 0) return

    const program = filePathSegments[0]
    const fileType = filePathSegments[filePathSegments.length - 1].split('.')[1]

    // todo: will this work?
    const programFiletypes = changes.get(program) || new Set()
    changes.set(program, programFiletypes.add(fileTypeMapper(fileType)))
  })

  return changes
}
