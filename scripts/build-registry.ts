import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import AjvModule, { type ErrorObject } from "ajv"

const Ajv = AjvModule.default ?? AjvModule

import draft07MetaSchema from "ajv/dist/refs/json-schema-draft-07.json" with {
  type: "json",
}

const REGISTRY_NAME = "shadniwind"
const REGISTRY_HOMEPAGE = "https://github.com/deicod/shadniwind"
const REGISTRY_VERSION = "v1"

const REGISTRY_TYPES = [
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:base",
  "registry:font",
  "registry:item",
] as const

type RegistryType = (typeof REGISTRY_TYPES)[number]

type ManifestFile = {
  source: string
  path: string
  type: RegistryType
  target?: string
}

type Manifest = {
  name: string
  type: RegistryType
  description?: string
  title?: string
  author?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: ManifestFile[]
  docs?: string
  categories?: string[]
  meta?: Record<string, unknown>
  extends?: string
  style?: string
  iconLibrary?: string
  baseColor?: string
  theme?: string
  font?: Record<string, unknown>
}

type RegistryFile = {
  path: string
  content: string
  type: RegistryType
  target?: string
}

type RegistryItem = Omit<Manifest, "files"> & { files: RegistryFile[] }

type RegistryIndex = {
  name: string
  homepage: string
  items: Array<Omit<RegistryItem, "files">>
}

const CURRENT_FILE = fileURLToPath(import.meta.url)
const ROOT_DIR = path.resolve(path.dirname(CURRENT_FILE), "..")
const MANIFESTS_DIR = path.join(ROOT_DIR, "registry-src", "items")
const SOURCE_DIR = path.join(ROOT_DIR, "registry-src", "shadniwind")
const OUTPUT_DIR = path.join(ROOT_DIR, "public")
const OUTPUT_VERSION_DIR = path.join(OUTPUT_DIR, REGISTRY_VERSION)
const OUTPUT_ITEMS_DIR = path.join(OUTPUT_DIR, "r")
const OUTPUT_VERSION_ITEMS_DIR = path.join(OUTPUT_VERSION_DIR, "r")
const SCHEMA_DIR = path.join(ROOT_DIR, "schemas")
const ITEM_SCHEMA_PATH = path.join(SCHEMA_DIR, "registry-item.schema.json")
const REGISTRY_SCHEMA_PATH = path.join(SCHEMA_DIR, "registry.schema.json")

const REGISTRY_TYPE_SET = new Set<string>(REGISTRY_TYPES)

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toPosixPath(input: string): string {
  return input.replace(/\\/g, "/")
}

function hasParentTraversal(input: string): boolean {
  return toPosixPath(input)
    .split("/")
    .some((segment) => segment === "..")
}

function assertSafeRelativePath(input: string, label: string): string {
  const value = input.trim()
  if (!value) {
    throw new Error(`${label} must not be empty`)
  }

  const posixValue = toPosixPath(value)
  if (path.posix.isAbsolute(posixValue)) {
    throw new Error(`${label} must be a relative path`)
  }

  if (hasParentTraversal(posixValue)) {
    throw new Error(`${label} must not include '..' segments`)
  }

  return path.posix.normalize(posixValue)
}

function getRequiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`)
  }

  return value
}

function getOptionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`)
  }

  return value
}

function getOptionalStringArray(
  value: unknown,
  label: string,
): string[] | undefined {
  if (value === undefined) {
    return undefined
  }

  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string")
  ) {
    throw new Error(`${label} must be an array of strings`)
  }

  return value
}

function getOptionalObject(
  value: unknown,
  label: string,
): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!isPlainObject(value)) {
    throw new Error(`${label} must be an object`)
  }

  return value
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8")

  try {
    return JSON.parse(raw) as T
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}`, { cause: error })
  }
}

async function loadManifest(filePath: string): Promise<Manifest> {
  const raw = await readJsonFile<unknown>(filePath)

  if (!isPlainObject(raw)) {
    throw new Error(`Manifest must be an object: ${filePath}`)
  }

  const name = getRequiredString(raw.name, "manifest.name")
  const type = getRequiredString(raw.type, "manifest.type")

  if (!REGISTRY_TYPE_SET.has(type)) {
    throw new Error(`manifest.type must be a valid registry type: ${type}`)
  }

  const filesValue = raw.files
  if (!Array.isArray(filesValue) || filesValue.length === 0) {
    throw new Error(`manifest.files must be a non-empty array: ${filePath}`)
  }

  const files = filesValue.map((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new Error(`manifest.files[${index}] must be an object`)
    }

    const source = assertSafeRelativePath(
      getRequiredString(entry.source, `manifest.files[${index}].source`),
      `manifest.files[${index}].source`,
    )
    const filePathValue = assertSafeRelativePath(
      getRequiredString(entry.path, `manifest.files[${index}].path`),
      `manifest.files[${index}].path`,
    )
    const fileType = getRequiredString(
      entry.type,
      `manifest.files[${index}].type`,
    )

    if (!REGISTRY_TYPE_SET.has(fileType)) {
      throw new Error(
        `manifest.files[${index}].type must be a valid registry type: ${fileType}`,
      )
    }

    const targetValue = getOptionalString(
      entry.target,
      `manifest.files[${index}].target`,
    )
    if (
      (fileType === "registry:file" || fileType === "registry:page") &&
      !targetValue
    ) {
      throw new Error(
        `manifest.files[${index}].target is required for ${fileType}`,
      )
    }

    return {
      source,
      path: filePathValue,
      type: fileType as RegistryType,
      target: targetValue
        ? assertSafeRelativePath(targetValue, `manifest.files[${index}].target`)
        : undefined,
    }
  })

  return {
    name,
    type: type as RegistryType,
    title: getOptionalString(raw.title, "manifest.title"),
    description: getOptionalString(raw.description, "manifest.description"),
    author: getOptionalString(raw.author, "manifest.author"),
    dependencies: getOptionalStringArray(
      raw.dependencies,
      "manifest.dependencies",
    ),
    devDependencies: getOptionalStringArray(
      raw.devDependencies,
      "manifest.devDependencies",
    ),
    registryDependencies: getOptionalStringArray(
      raw.registryDependencies,
      "manifest.registryDependencies",
    ),
    files,
    docs: getOptionalString(raw.docs, "manifest.docs"),
    categories: getOptionalStringArray(raw.categories, "manifest.categories"),
    meta: getOptionalObject(raw.meta, "manifest.meta"),
    extends: getOptionalString(raw.extends, "manifest.extends"),
    style: getOptionalString(raw.style, "manifest.style"),
    iconLibrary: getOptionalString(raw.iconLibrary, "manifest.iconLibrary"),
    baseColor: getOptionalString(raw.baseColor, "manifest.baseColor"),
    theme: getOptionalString(raw.theme, "manifest.theme"),
    font: getOptionalObject(raw.font, "manifest.font"),
  }
}

function buildItemBase(manifest: Manifest): Omit<RegistryItem, "files"> {
  const item: Omit<RegistryItem, "files"> = {
    name: manifest.name,
    type: manifest.type,
  }

  if (manifest.title) {
    item.title = manifest.title
  }
  if (manifest.description) {
    item.description = manifest.description
  }
  if (manifest.author) {
    item.author = manifest.author
  }
  if (manifest.dependencies?.length) {
    item.dependencies = manifest.dependencies
  }
  if (manifest.devDependencies?.length) {
    item.devDependencies = manifest.devDependencies
  }
  if (manifest.registryDependencies?.length) {
    item.registryDependencies = manifest.registryDependencies.map(
      (dependency) => {
        if (dependency.startsWith("@")) {
          return dependency
        }

        return `@${REGISTRY_NAME}/${dependency}`
      },
    )
  }
  if (manifest.docs) {
    item.docs = manifest.docs
  }
  if (manifest.categories?.length) {
    item.categories = manifest.categories
  }
  if (manifest.meta && Object.keys(manifest.meta).length > 0) {
    item.meta = manifest.meta
  }
  if (manifest.extends) {
    item.extends = manifest.extends
  }
  if (manifest.style) {
    item.style = manifest.style
  }
  if (manifest.iconLibrary) {
    item.iconLibrary = manifest.iconLibrary
  }
  if (manifest.baseColor) {
    item.baseColor = manifest.baseColor
  }
  if (manifest.theme) {
    item.theme = manifest.theme
  }
  if (manifest.font) {
    item.font = manifest.font
  }

  return item
}

function isSelfPlatformWrapperImport(
  sourcePath: string,
  relativeSpecifier: string,
): boolean {
  const sourcePathPosix = toPosixPath(sourcePath)
  const sourceDir = path.posix.dirname(sourcePathPosix)
  const sourceBaseName = path.posix.basename(sourcePathPosix)

  const wrapperMatch = sourceBaseName.match(
    /^(?<base>.+)\.(web|native|ios|android)\.(tsx|ts|jsx|js)$/,
  )
  if (!wrapperMatch?.groups?.base) {
    return false
  }

  const wrapperBasePath = path.posix.normalize(
    path.posix.join(sourceDir, wrapperMatch.groups.base),
  )
  const resolvedImportPath = path.posix.normalize(
    path.posix.join(sourceDir, relativeSpecifier),
  )

  return resolvedImportPath === wrapperBasePath
}

function rewriteRelativeJsSpecifiersForRegistry(
  content: string,
  sourcePath: string,
): string {
  const rewrite = (
    full: string,
    prefix: string,
    specifier: string,
    suffix: string,
  ): string => {
    if (isSelfPlatformWrapperImport(sourcePath, specifier)) {
      return full
    }

    return `${prefix}${specifier}${suffix}`
  }

  return content
    .replace(/(\bfrom\s+["'])(\.{1,2}\/[^"']+)\.js(["'])/g, rewrite)
    .replace(
      /(\bexport\s+[^\n;]*\s+from\s+["'])(\.{1,2}\/[^"']+)\.js(["'])/g,
      rewrite,
    )
}

async function buildRegistryItem(manifest: Manifest): Promise<RegistryItem> {
  const files = await Promise.all(
    manifest.files.map(async (file) => {
      const sourcePath = path.resolve(SOURCE_DIR, file.source)
      if (!sourcePath.startsWith(SOURCE_DIR + path.sep)) {
        throw new Error(
          `Source path escapes registry source root: ${file.source}`,
        )
      }

      const sourceContent = await readFile(sourcePath, "utf8")
      const content = rewriteRelativeJsSpecifiersForRegistry(
        sourceContent,
        sourcePath,
      )

      return {
        path: file.path,
        content,
        type: file.type,
        target: file.target,
      }
    }),
  )

  return {
    ...buildItemBase(manifest),
    files,
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

async function clearJsonOutputs(dirPath: string): Promise<void> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => unlink(path.join(dirPath, entry.name))),
    )
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return
    }
    throw error
  }
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return "Unknown schema validation error"
  }

  return errors
    .map((error) => {
      const location = error.instancePath || "/"
      const message = error.message ?? "Invalid"
      return `${location} ${message}`
    })
    .join("\n")
}

function assertValid(
  valid: boolean,
  errors: ErrorObject[] | null | undefined,
  label: string,
) {
  if (valid) {
    return
  }

  throw new Error(
    `Schema validation failed for ${label}:\n${formatAjvErrors(errors)}`,
  )
}

async function main() {
  const entries = await readdir(MANIFESTS_DIR, { withFileTypes: true })
  const manifestFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".manifest.json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))

  if (manifestFiles.length === 0) {
    throw new Error("No manifest files found in registry-src/items")
  }

  const manifests: Manifest[] = []
  const seenNames = new Set<string>()

  for (const fileName of manifestFiles) {
    const manifestPath = path.join(MANIFESTS_DIR, fileName)
    const manifest = await loadManifest(manifestPath)
    const expectedName = fileName.replace(/\.manifest\.json$/, "")

    if (manifest.name !== expectedName) {
      throw new Error(
        `Manifest name must match filename: expected ${expectedName}, got ${manifest.name}`,
      )
    }

    if (seenNames.has(manifest.name)) {
      throw new Error(`Duplicate manifest name detected: ${manifest.name}`)
    }

    seenNames.add(manifest.name)
    manifests.push(manifest)
  }

  manifests.sort((a, b) => a.name.localeCompare(b.name))

  const registryItemSchema =
    await readJsonFile<Record<string, unknown>>(ITEM_SCHEMA_PATH)
  const registrySchema =
    await readJsonFile<Record<string, unknown>>(REGISTRY_SCHEMA_PATH)
  const ajv = new Ajv({ allErrors: true, strict: false })

  const draft07Meta = {
    ...draft07MetaSchema,
    $id: "https://json-schema.org/draft-07/schema#",
    $schema: "https://json-schema.org/draft-07/schema#",
  }

  ajv.addMetaSchema(draft07Meta)
  ajv.addSchema(
    registryItemSchema,
    "https://ui.shadcn.com/schema/registry-item.json",
  )

  const validateItem = ajv.compile(registryItemSchema)
  const validateRegistry = ajv.compile(registrySchema)

  const registryItems: RegistryItem[] = []

  for (const manifest of manifests) {
    const item = await buildRegistryItem(manifest)
    const isValid = validateItem(item)
    assertValid(isValid, validateItem.errors, `item ${manifest.name}`)
    registryItems.push(item)
  }

  const registryIndex: RegistryIndex = {
    name: REGISTRY_NAME,
    homepage: REGISTRY_HOMEPAGE,
    items: manifests.map((manifest) => buildItemBase(manifest)),
  }

  const registryIsValid = validateRegistry(registryIndex)
  assertValid(registryIsValid, validateRegistry.errors, "registry index")

  await mkdir(OUTPUT_ITEMS_DIR, { recursive: true })
  await mkdir(OUTPUT_VERSION_ITEMS_DIR, { recursive: true })
  await mkdir(OUTPUT_VERSION_DIR, { recursive: true })

  await clearJsonOutputs(OUTPUT_ITEMS_DIR)
  await clearJsonOutputs(OUTPUT_VERSION_ITEMS_DIR)

  await Promise.all(
    registryItems.flatMap((item) => [
      writeJson(path.join(OUTPUT_ITEMS_DIR, `${item.name}.json`), item),
      writeJson(path.join(OUTPUT_VERSION_ITEMS_DIR, `${item.name}.json`), item),
    ]),
  )

  await writeJson(path.join(OUTPUT_DIR, "registry.json"), registryIndex)
  await writeJson(path.join(OUTPUT_VERSION_DIR, "registry.json"), registryIndex)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
