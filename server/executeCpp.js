const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, userInput) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  let child, output, error;

  try {
    child = execSync(
      `g++ ${filepath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out`,
      { input: userInput, timeout: 7000 }
    );
    output = child.toString();
  } catch (err) {
    console.dir(err, { depth: null });
    error = err;
  }

  return {
    status: error?.status || 0,
    output: output || error?.stderr?.toString(),
    code: error?.code,
  };
};

module.exports = {
  executeCpp,
};
