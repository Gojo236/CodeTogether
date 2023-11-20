const { execSync } = require("child_process");
const path = require("path");

const executeJava = (filepath, userInput) => {
  let output, error, compile, execute;

  try {
    compile = execSync(`javac ${filepath}`);
    const move = execSync(`mv /app/codes/Main.class Main.class`);
    jar = execSync(`jar cfe YourJarFile.jar Main Main.class`);
    execute = execSync(
      `java -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:NewRatio=5 -Xms8M -Xmx256M -Xss64M -DONLINE_JUDGE=true -jar YourJarFile.jar`,
      { input: userInput, timeout: 7000 }
    );

    output = execute.toString();
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
  executeJava,
};
