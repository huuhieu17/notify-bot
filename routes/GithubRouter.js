const express = require("express");
const GitHubRouter = express.Router();
const github = require("../utils/github");
const { githubMessage } = require("../bot");
GitHubRouter.get("/", (req, res) => {
  const { url } = req;
  console.log("Received Webhook Request");
  console.log("Full url:" + url);
  res.json({
    status: 200,
    message: "OK",
  });
});

GitHubRouter.post("/", (req, res) => {
  const { body } = req;
  console.log("Received Webhook POST Request");
  console.log("Request body:");
  console.log(body);
});

GitHubRouter.put("/", (req, res) => {
  const { body } = req;
  console.log("Received Webhook PUT Request");
  console.log("Request body:");
  console.log(body);
  res.send("OK");
});

GitHubRouter.delete("/", (req, res) => {
  const { url } = req;
  console.log("Received Webhook DELETE Request");
  console.log("Url:");
  console.log(url);
  res.json({
    status: 200,
    message: "OK",
  });
});

// gitlab webhook
GitHubRouter.post("/:id", async (req, res) => {
  const { id } = req.params;
  const { body, method } = req;
  const event = req.headers["x-github-event"];
  console.log("Event mới:", event);
  const result = github.githubEvent(event, body);
  githubMessage(result, id);
  res.json({
    status: 200,
    message: "OK",
  });
});

GitHubRouter.post("/:id/:threadId", async (req, res) => {
  const { id, threadId } = req.params;
  const { body } = req;
  console.log(body);
  //   let result = gitlab.transformGitLabEvent(body);
  //   gitLabMessage(result, id, threadId);
  res.json({
    status: 200,
    message: "OK",
  });
});

module.exports = GitHubRouter;
