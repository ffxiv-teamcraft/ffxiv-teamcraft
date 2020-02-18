module.exports = function (content, fields) {
  const lines = []
  let line = []

  let inQuote = false
  let buf = ''
  for (let i = 0; i < content.length; ++i) {
    let chr = content[i]
    if (inQuote) {
      if (chr === '"') {
        inQuote = false
      } else {
        buf += chr
      }
      continue
    }

    switch (chr) {
      case ',':
        line.push(buf)
        buf = ''
        break
      case '"':
        inQuote = !inQuote
        break
      case '\r': // @todo: find a better way to handle \r
        break
      case '\n':
        line.push(buf)
        buf = ''
        lines.push(line)
        line = []
        break
      default:
        buf += chr
        break
    }
  }

  if (line.length) {
    lines.push(line)
  }

  if (!Array.isArray(fields)) {
    fields = lines[1]
  }

  return lines.slice(3).map(line => fields.reduce((obj, field, i) => {
    const content = line[i].replace(/\r\n/g, '\n')
    if (field) {
      obj[field] = content
    } else {
      obj[`#${i}`] = content
    }

    return obj
  }, { _: line }))
}
