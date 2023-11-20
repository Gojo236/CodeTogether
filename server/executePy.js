const { execSync } = require("child_process");
const path = require("path");

const executePy = (filepath, userInput) => {
  let output, error;

  try {
    output = execSync(`python3 ${filepath}`, {
      input: userInput,
      timeout: 7000,
    }).toString();
  } catch (err) {
    error = err;
  }

  return {
    status: error?.status || 0,
    output: output || error?.stderr.toString(),
    code: error?.code,
  };
};

module.exports = {
  executePy,
};
