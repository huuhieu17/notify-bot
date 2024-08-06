const express = require("express");
const GitlabRoute = express.Router();
const { gitLabMessage } = require("../bot");
const gitlab = require("../utils/gitlab");

GitlabRoute.get("/", (req, res) => {
  const { url } = req;
  console.log("Received Webhook Request");
  console.log("Full url:" + url);
  res.json({
    status: 200,
    message: "OK",
  });
});

GitlabRoute.post("/", (req, res) => {
  const { body } = req;
  console.log("Received Webhook POST Request");
  console.log("Request body:");
  console.log(body);
});

GitlabRoute.put("/", (req, res) => {
  const { body } = req;
  console.log("Received Webhook PUT Request");
  console.log("Request body:");
  console.log(body);
  res.send("OK");
});

GitlabRoute.delete("/", (req, res) => {
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
GitlabRoute.post("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  let result = gitlab.transformGitLabEvent(body);
  gitLabMessage(result, id);
  res.json({
    status: 200,
    message: "OK",
  });
});

GitlabRoute.post("/:id/:threadId", async (req, res) => {
  const { id, threadId } = req.params;
  const { body } = req;
  let result = gitlab.transformGitLabEvent(body);
  gitLabMessage(result, id, threadId);
  res.json({
    status: 200,
    message: "OK",
  });
});

module.exports = GitlabRoute;
