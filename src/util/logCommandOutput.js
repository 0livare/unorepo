const chalk = require('chalk')
const logger = require('./logger')

function logCommandOutput(message, loggerOptions) {
  if (!message) return

  // Prefix each line of the output
  message = (message.trim() + '\n  ')
    .split('\n')
    .map(line => `${logger.prefixText}  ${line}`)
    .join('\n')

  logger.expressive({
    text: chalk.gray(message),
    omitPrefix: message.startsWith(logger.prefixText),
    ...loggerOptions,
  })
}

module.exports = logCommandOutput
