const Queue = require("bull");
const moment = require("moment");
const Job = require("./models/Job");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { executeJava } = require("./executeJava");
const Problem = require("./models/Problem");

// For running code with sample user input

const executor_map = {
  c: executeCpp,
  cpp: executeCpp,
  py: executePy,
  java: executeJava,
};

const jobQueue = new Queue("job-runner-queue", {
  redis: { host: "redis", port: 6379 },
});

jobQueue.process(async ({ data }) => {
  const jobId = data.id;
  const job = await Job.findById(jobId);

  if (job === undefined) {
    throw Error(`Cannot find job with id ${jobId}`);
  }

  try {
    job["startedAt"] = new Date();
    // we need to run the file and send the response
    // if (job.language === "cpp" || job.language === "c")
    //   output = executeCpp(job.filepath, job.userInput);
    // else output = await executePy(job.filepath, job.userInput);

    let output;

    const execute = executor_map[job.language];
    const result = execute(job.filepath, job.userInput);
    output = result?.output?.trim();

    console.log(result.status);

    if (result.code === "ETIMEDOUT") output = `Time limit exceeded`;
    else if (result.status !== 0)
      output = `Process exited with code ${result.status}`;

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    await job.save();

    return true;
  } catch (err) {
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = err;
    await job.save();
    throw Error(err);
  }
});

jobQueue.on("failed", (error) => {
  console.error(error.data.id, error.failedReason);
});

const addJobToQueue = async (jobId) => {
  jobQueue.add({
    id: jobId,
  });
};

// For submitting code and check testcase

const submitQueue = new Queue("job-submit-queue", {
  redis: { host: "redis", port: 6379 },
});

submitQueue.process(async ({ data }) => {
  const jobId = data.id;
  const problemId = data.problemId;
  const job = await Job.findById(jobId);
  const problem = await Problem.findById(problemId);

  if (job === undefined || problem === undefined) {
    throw Error(`Invalid job/problem id`);
  }

  const testcases = problem.testcase;

  try {
    let output;
    job["startedAt"] = new Date();
    job["userId"] = data.userId;
    job["problemId"] = problemId;

    let passed = true;

    for (let i = 0; i < testcases.length; i++) {
      const execute = executor_map[job.language];
      const result = execute(job.filepath, testcases[i].input);

      let outputActual = result?.output?.trim();
      let outputExpected = testcases[i].output.trim();

      if (result.status !== 0 || outputActual !== outputExpected) {
        if (result.code === "ETIMEDOUT")
          job.verdict = `Time limit exceeded in testcase ${i + 1}`;
        else
          job.verdict = `Process exited with code ${
            result.status
          } for testcase ${i + 1}`;
        passed = false;
        break;
      }
    }

    passed && (job["verdict"] = "Accepted");
    // !passed && job["verdict"] !== "tle" && (job["verdict"] = "wa");

    if (passed) {
      const distinct_user = new Set(problem.whoSolved);
      distinct_user.add(data.userId);
      problem.whoSolved = [...distinct_user];
      await problem.save();
    }

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;
    await job.save();

    return true;
  } catch (err) {
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = err;
    await job.save();
    throw Error(err);
  }
});

submitQueue.on("failed", (error) => {
  console.error(error.data.id, error.failedReason);
});

const addSubmitToQueue = async (jobId, problemId, userId) => {
  submitQueue.add({
    id: jobId,
    problemId,
    userId,
  });
};

module.exports = {
  addJobToQueue,
  addSubmitToQueue,
};
