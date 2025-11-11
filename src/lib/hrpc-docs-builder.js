import fs from 'fs'

const HRPC_PATH = './spec/hrpc/hrpc.json'
const SCHEMA_PATH = './spec/schema/schema.json'

// Load HRPC and schema JSON
const hrpc = JSON.parse(fs.readFileSync(HRPC_PATH, 'utf8'))
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'))

// Index schema definitions by namespace/type
const schemaMap = {}
for (const entry of schema.schema) {
  const key = `${entry.namespace}/${entry.name}`
  schemaMap[key] = entry

  // Also index by full name for easier lookup
  if (entry.namespace && entry.name) {
    schemaMap[`${entry.namespace}/${entry.name}`] = entry
  }
}

// Helper function to get schema by key, handling '@' symbol
function getSchemaByKey (key) {
  // Try direct lookup first
  if (schemaMap[key]) {
    return schemaMap[key]
  }

  // If key starts with '@', try removing it
  if (key.startsWith('@')) {
    const parts = key.substring(1).split('/')
    if (parts.length === 2) {
      const namespace = parts[0]
      const name = parts[1]
      const newKey = `${namespace}/${name}`
      return schemaMap[newKey]
    }
  }

  return null
}

// Helper: format fields as Markdown list
function formatFields (fields = [], indentLevel = 0) {
  if (!fields || fields.length === 0) {
    return '_No fields defined_'
  }

  const indent = '  '.repeat(indentLevel)

  return fields.map(field => {
    const optional = field.required === false ? ' _(optional)_' : ''
    const version = field.version ? ` _(v${field.version})_` : ''
    let typeInfo = field.type
    let subFields = ''

    // Check if the type refers to an enum or object schema
    const refSchema = getSchemaByKey(field.type)
    if (refSchema) {
      if (refSchema.enum) {
        // Handle enum types
        const enumValues = refSchema.enum.map(e => e.key).join(', ')
        typeInfo = `enum (${enumValues})`
      } else if (refSchema.fields && refSchema.fields.length > 0) {
        // Handle object types
        typeInfo = 'object'
        subFields = '\n' + formatFields(refSchema.fields, indentLevel + 1)
      }
    }

    let result = `${indent}- \`${field.name}\`: \`${typeInfo}\`${optional}${version}`
    if (subFields) {
      result += subFields
    }
    return result
  }).join('\n')
}

// Helper: format schema metadata
function formatSchemaMetadata (schema) {
  // Removed compact and flags position as per requirements
  return ''
}

// Generate documentation
let markdown = '# HRPC Command Documentation\n\n'

for (const command of hrpc.schema) {
  const name = command.name.split('/').pop()
  const namespace = command.name.split('/')[0]
  const requestKey = command.request?.name
  const responseKey = command.response?.name

  markdown += `## ${name}\n\n`

  // Request
  if (requestKey) {
    const reqSchema = getSchemaByKey(requestKey)
    if (reqSchema) {
      markdown += `**Request:** \`${requestKey}\`\n\n`
      markdown += formatSchemaMetadata(reqSchema)

      // Handle enum types
      if (reqSchema.enum) {
        markdown += '**Enum Values:**\n\n'
        markdown += reqSchema.enum.map(e => {
          const version = e.version ? ` _(v${e.version})_` : ''
          return `- \`${e.key}\`${version}`
        }).join('\n') + '\n\n'
      } else {
        markdown += `**Fields:**\n\n${formatFields(reqSchema.fields)}\n\n`
      }
    } else {
      markdown += `_No request schema found for ${requestKey}_\n\n`
    }
  }

  // Response
  if (responseKey) {
    const resSchema = getSchemaByKey(responseKey)
    if (resSchema) {
      markdown += `**Response:** \`${responseKey}\`\n\n`
      markdown += formatSchemaMetadata(resSchema)

      // Handle enum types
      if (resSchema.enum) {
        markdown += '**Enum Values:**\n\n'
        markdown += resSchema.enum.map(e => {
          const version = e.version ? ` _(v${e.version})_` : ''
          return `- \`${e.key}\`${version}`
        }).join('\n') + '\n\n'
      } else {
        markdown += `**Fields:**\n\n${formatFields(resSchema.fields)}\n\n`
      }
    } else {
      markdown += `_No response schema found for ${responseKey}_\n\n`
    }
  }

  // Special cases (e.g. `send` commands with no response)
  if (!requestKey && !responseKey && command.request?.send) {
    markdown += '_Streaming send-only command._\n\n'
  }

  markdown += '---\n\n'
}

// Save to file
const OUTPUT_PATH = './hrpc-doc.md'
fs.writeFileSync(OUTPUT_PATH, markdown, 'utf8')

console.log(`✅ Documentation written to ${OUTPUT_PATH}`)
