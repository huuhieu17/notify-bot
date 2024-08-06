require("dotenv").config();
const env = process.env;
const TelegramBot = require("node-telegram-bot-api");
const { sendGitlabWebhookUrl } = require("./utils/gitlab");
const { sendGithubWebhookUrl } = require("./utils/github");
const token = env.TELEGRAM_TOKEN || "token"; // Bot sự thật
const bot = new TelegramBot(token, { polling: true });

const gitLabMessage = (result, id, threadId) => {
  var messageContent = "";
  switch (result?.type) {
    case "notify":
      messageContent = result.eventName;
      messageContent += `\n`;
      messageContent += result.content;
      if (threadId) {
        bot.sendMessage(id, messageContent, {
          parse_mode: "html",
          disable_web_page_preview: true,
          reply_to_message_id: threadId,
        });
      } else {
        bot.sendMessage(id, `${messageContent}`, {
          parse_mode: "html",
          disable_web_page_preview: true,
        });
      }
      break;
    case "push":
      if (result?.sha?.before == "0000000000000000000000000000000000000000") {
        messageContent += `<b>${
          result?.user?.name
        } </b> đã tạo nhánh <a href='${result?.project?.urls?.repository}'>${
          result?.project?.namespace
        }/${result?.project?.name}/${getBranchName(result?.ref)}</a>\n`;
        if (result?.commits?.length > 0) {
          messageContent += `<b>${result?.user?.name}</b> đã push to <a href='${
            result?.project?.urls?.repository
          }'>${result?.project?.namespace}/${
            result?.project?.name
          }/${getBranchName(result?.ref)}</a>\n`;
          result?.commits?.forEach((commit) => {
            messageContent += `\t-   ${commit?.author?.name} : <a href='${commit?.url}'>${commit?.message}</a> \n`;
            if (
              commit?.files?.added?.length > 0 ||
              commit?.files?.modified?.length > 0 ||
              commit?.files?.removed?.length > 0
            ) {
              messageContent += `\t`;
              messageContent += `(`;
              if (commit?.files?.added?.length > 0) {
                console.log(commit?.files?.added?.length);
                messageContent += ` ${commit?.files?.added?.length} files added`;
              }
              if (commit?.files?.modified?.length > 0) {
                console.log(commit?.files?.modified?.length);
                messageContent += ` ${commit?.files?.modified?.length} files modified`;
              }
              if (commit?.files?.removed?.length > 0) {
                console.log(commit?.files?.removed?.length);
                messageContent += ` ${commit?.files?.removed?.length} files removed`;
              }
              messageContent += `) \n\n`;
            }
          });
        }
      } else if (
        result?.sha?.after == "0000000000000000000000000000000000000000"
      ) {
        messageContent += `<b>${result?.user?.name}</b> đã xoá nhánh ${
          result?.project?.namespace
        }/${result?.project?.name}/${getBranchName(result?.ref)}  \n`;
      } else {
        messageContent += `<b>${result?.user?.name}</b> đã push to <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a> \n`;
        result?.commits?.forEach((commit) => {
          messageContent += `\t-   ${commit?.author?.name} : <a href='${commit?.url}'>${commit?.message}</a> \n`;
          if (
            commit?.files?.added?.length > 0 ||
            commit?.files?.modified?.length > 0 ||
            commit?.files?.removed?.length > 0
          ) {
            messageContent += `\t`;
            messageContent += `(`;
            if (commit?.files?.added?.length > 0) {
              console.log(commit?.files?.added?.length);
              messageContent += ` ${commit?.files?.added?.length} files added`;
            }
            if (commit?.files?.modified?.length > 0) {
              console.log(commit?.files?.modified?.length);
              messageContent += ` ${commit?.files?.modified?.length} files modified`;
            }
            if (commit?.files?.removed?.length > 0) {
              console.log(commit?.files?.removed?.length);
              messageContent += ` ${commit?.files?.removed?.length} files removed`;
            }
            messageContent += `) \n\n`;
          }
        });
      }
      if (messageContent === "") {
        return;
      }
      if (threadId) {
        bot.sendMessage(id, messageContent, {
          parse_mode: "html",
          disable_web_page_preview: true,
          reply_to_message_id: threadId,
        });
      } else {
        bot.sendMessage(id, `${messageContent}`, {
          parse_mode: "html",
          disable_web_page_preview: true,
        });
      }
      break;
    case "pipeline":
      if (result?.status === "running") {
        messageContent += `\n⚙️ Pipeline is running ⌛!! \n`;
        messageContent += `\n\n📄 \t  <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b> ${result?.commit?.author?.name}</b> : <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (result?.status === "failed") {
        messageContent += `\n⚙️ Build Failed 🆘!! \n`;
        messageContent += `\n\n📄 \t <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b>${result?.commit?.author?.name}</b>: <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (result?.status === "error") {
        messageContent += `\n⚙️ Build Error 🆘!! \n`;
        messageContent += `\n\n📄 \t <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b> ${result?.commit?.author?.name} </b> : <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (result?.status === "canceled") {
        messageContent += `\n⚙️ Canceled by <b>${result?.user?.name}</b> ❌!! \n`;
        messageContent += `\n\n📄 \t  <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
      }
      if (result?.status === "success") {
        messageContent += `\n⚙️ Build thành công ✅!! \n`;
        messageContent += `\n\n📄 \t  <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b> ${result?.commit?.author?.name} </b> : <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (messageContent === "") {
        return;
      }
      if (!threadId) {
        bot.sendMessage(id, messageContent, {
          parse_mode: "html",
          disable_web_page_preview: true,
        });
      } else {
        bot.sendMessage(id, messageContent, {
          parse_mode: "html",
          reply_to_message_id: threadId,
          disable_web_page_preview: true,
        });
      }

    default:
      break;
  }
};

const githubMessage = (result, id, threadId) => {
  var messageContent = "";
  switch (result?.type) {
    case "push":
      if (result?.sha?.before == "0000000000000000000000000000000000000000") {
        messageContent += `<b>${
          result?.user?.name
        } </b> đã tạo nhánh <a href='${
          result?.project?.urls?.repository
        }/tree/${getBranchName(result?.ref)}'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>\n`;
        if (result?.commits?.length > 0) {
          messageContent += `<b>${result?.user?.name}</b> đã push to <a href='${
            result?.project?.urls?.repository
          }'>${result?.project?.namespace}/${
            result?.project?.name
          }/${getBranchName(result?.ref)}</a>\n`;
          result?.commits?.forEach((commit) => {
            messageContent += `\t-   ${commit?.author?.name} : <a href='${commit?.url}'>${commit?.message}</a> \n`;
            if (
              commit?.files?.added?.length > 0 ||
              commit?.files?.modified?.length > 0 ||
              commit?.files?.removed?.length > 0
            ) {
              messageContent += `\t`;
              messageContent += `(`;
              if (commit?.files?.added?.length > 0) {
                console.log(commit?.files?.added?.length);
                messageContent += ` ${commit?.files?.added?.length} files added`;
              }
              if (commit?.files?.modified?.length > 0) {
                console.log(commit?.files?.modified?.length);
                messageContent += ` ${commit?.files?.modified?.length} files modified`;
              }
              if (commit?.files?.removed?.length > 0) {
                console.log(commit?.files?.removed?.length);
                messageContent += ` ${commit?.files?.removed?.length} files removed`;
              }
              messageContent += `) \n\n`;
            }
          });
        }
      } else if (
        result?.sha?.after == "0000000000000000000000000000000000000000"
      ) {
        messageContent += `<b>${result?.user?.name}</b> đã xoá nhánh ${
          result?.project?.namespace
        }/${result?.project?.name}/${getBranchName(result?.ref)}  \n`;
      } else {
        messageContent += `<b>${result?.user?.name}</b> đã push to <a href='${
          result?.project?.urls?.repository
        }/tree/${getBranchName(result?.ref)}'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a> \n`;
        result?.commits?.forEach((commit) => {
          messageContent += `\t-   ${commit?.author?.name} : <a href='${commit?.url}'>${commit?.message}</a> \n`;
          if (
            commit?.files?.added?.length > 0 ||
            commit?.files?.modified?.length > 0 ||
            commit?.files?.removed?.length > 0
          ) {
            messageContent += `\t`;
            messageContent += `(`;
            if (commit?.files?.added?.length > 0) {
              console.log(commit?.files?.added?.length);
              messageContent += ` ${commit?.files?.added?.length} files added`;
            }
            if (commit?.files?.modified?.length > 0) {
              console.log(commit?.files?.modified?.length);
              messageContent += ` ${commit?.files?.modified?.length} files modified`;
            }
            if (commit?.files?.removed?.length > 0) {
              console.log(commit?.files?.removed?.length);
              messageContent += ` ${commit?.files?.removed?.length} files removed`;
            }
            messageContent += `) \n\n`;
          }
        });
      }
      break;
    case "create":
      messageContent += `<b>${result?.user?.name} </b> đã tạo nhánh <a href='${
        result?.project?.urls?.repository
      }/tree/${getBranchName(result?.ref)}'>${result?.project?.namespace}/${
        result?.project?.name
      }/${getBranchName(result?.ref)}</a>\n`;
      break;
    case "pipeline":
      if (result?.status === "running") {
        messageContent += `\n⚙️ Pipeline is running ⌛!! \n`;
        messageContent += `\n\n📄 \t  <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b> ${result?.commit?.author?.name}</b> : <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (result?.status === "failed") {
        messageContent += `\n⚙️ Build Failed 🆘!! \n`;
        messageContent += `\n\n📄 \t <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b>${result?.commit?.author?.name}</b>: <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (result?.status === "error") {
        messageContent += `\n⚙️ Build Error 🆘!! \n`;
        messageContent += `\n\n📄 \t <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b> ${result?.commit?.author?.name} </b> : <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (result?.status === "canceled") {
        messageContent += `\n⚙️ Canceled by <b>${result?.user?.name}</b> ❌!! \n`;
        messageContent += `\n\n📄 \t  <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
      }
      if (result?.status === "success") {
        messageContent += `\n⚙️ Build thành công ✅!! \n`;
        messageContent += `\n\n📄 \t  <a href='${
          result?.project?.urls?.repository
        }'>${result?.project?.namespace}/${
          result?.project?.name
        }/${getBranchName(result?.ref)}</a>`;
        messageContent += `\n\n🔗 \t <a href='${result?.project?.urls?.repository}/-/pipelines/${result?.id}'>${result?.project?.urls?.repository}/-/pipelines/${result?.id}</a>`;
        messageContent += `\n\n📄 \t  <b> ${result?.commit?.author?.name} </b> : <a href='${result?.commit?.url}'>${result?.commit?.message}</a>`;
      }
      if (messageContent === "") {
        return;
      }
      break;
    case "issues": {
      if (result.action === "opened") {
        messageContent += `<b>${result?.issue?.user_name} </b> đã mở 1 issue: <a href='${result?.issue?.url}'>!${result?.issue?.number}</a>\n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.issue?.title + "\n";
        if (
          result?.issue?.assignees &&
          Array.isArray(result?.issue?.assignees)
        ) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.issue?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.issue?.labels && Array.isArray(result?.issue?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.issue?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.issue?.body;
      }
      if (result.action === "edited") {
        messageContent += `<b>${result?.issue?.user_name} </b> cập nhật issue: <a href='${result?.issue?.url}'>!${result?.issue?.number}</a>\n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.issue?.title + "\n";
        if (
          result?.issue?.assignees &&
          Array.isArray(result?.issue?.assignees)
        ) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.issue?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.issue?.labels && Array.isArray(result?.issue?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.issue?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.issue?.body;
      }
      if (result.action === "closed") {
        messageContent += `<b>${result?.issue?.user_name} </b> đóng issue: <a href='${result?.issue?.url}'>!${result?.issue?.number}</a>\n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.issue?.title + "\n";
        if (
          result?.issue?.assignees &&
          Array.isArray(result?.issue?.assignees)
        ) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.issue?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.issue?.labels && Array.isArray(result?.issue?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.issue?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.issue?.body;
      }
      if (result.action === "reopened") {
        messageContent += `<b>${result?.issue?.user_name} </b> đóng issue issue: <a href='${result?.issue?.url}'>!${result?.issue?.number}</a>\n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.issue?.title + "\n";
        if (
          result?.issue?.assignees &&
          Array.isArray(result?.issue?.assignees)
        ) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.issue?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.issue?.labels && Array.isArray(result?.issue?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.issue?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.issue?.body;
      }
      break;
    }
    case "pull_request": {
      if (result.action === "opened") {
        messageContent += `<b>${result?.pr?.user_name} </b> đã tạo pull request: <a href='${result?.pr?.url}'>!${result?.pr?.number}</a>\n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.pr?.title + "\n";
        messageContent += `${result?.pr?.user_name} want to merge ${
          result?.pr?.commits ?? 0
        } commits from <a href='${result?.pr?.repo_url}/tree/${
          result?.pr?.head?.ref
        }'>${result?.pr?.head?.ref}</a> to <a href='${
          result?.pr?.repo_url
        }/tree/${result?.pr?.base?.ref}'>${result?.pr?.base?.ref}</a> \n`;
        if (result?.pr?.assignees && Array.isArray(result?.issue?.assignees)) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.issue?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.pr?.labels && Array.isArray(result?.pr?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.pr?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.issue?.body;
      }
      if (result.action === "edited") {
        messageContent += `<b>${result?.pr?.user_name} </b> cập nhật pull request: <a href='${result?.pr?.url}'>!${result?.pr?.number}</a>\n`;
        messageContent += `${result?.pr?.user_name} want to merge ${
          result?.pr?.commits ?? 0
        } commits from <a href='${result?.pr?.repo_url}/tree/${
          result?.pr?.head?.ref
        }'>${result?.pr?.head?.ref}</a> to <a href='${
          result?.pr?.repo_url
        }/tree/${result?.pr?.base?.ref}'>${result?.pr?.base?.ref}</a> \n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.pr?.title + "\n";
        if (result?.pr?.assignees && Array.isArray(result?.pr?.assignees)) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.pr?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.pr?.labels && Array.isArray(result?.pr?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.pr?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.issue?.body;
      }
      if (result.action === "closed") {
        messageContent += `<b>${result?.pr?.user_name} </b> đóng pull request: <a href='${result?.pr?.url}'>!${result?.pr?.number}</a>\n`;
        messageContent += `${result?.pr?.user_name} want to merge ${
          result?.pr?.commits ?? 0
        } commits from <a href='${result?.pr?.repo_url}/tree/${
          result?.pr?.head?.ref
        }'>${result?.pr?.head?.ref}</a> to <a href='${
          result?.pr?.repo_url
        }/tree/${result?.pr?.base?.ref}'>${result?.pr?.base?.ref}</a> \n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.pr?.title + "\n";
        if (result?.pr?.assignees && Array.isArray(result?.pr?.assignees)) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.pr?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.pr?.labels && Array.isArray(result?.pr?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.pr?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.pr?.body;
      }
      if (result.action === "reopened") {
        messageContent += `<b>${result?.pr?.user_name} </b> đóng issue issue: <a href='${result?.pr?.url}'>!${result?.pr?.number}</a>\n`;
        messageContent += `${result?.pr?.user_name} want to merge ${
          result?.pr?.commits ?? 0
        } commits from <a href='${result?.pr?.repo_url}/tree/${
          result?.pr?.head?.ref
        }'>${result?.pr?.head?.ref}</a> to <a href='${
          result?.pr?.repo_url
        }/tree/${result?.pr?.base?.ref}'>${result?.pr?.base?.ref}</a> \n`;
        messageContent += `<b>Tiêu đề: </b> ` + result?.pr?.title + "\n";
        if (result?.pr?.assignees && Array.isArray(result?.pr?.assignees)) {
          let assigneeContent = "<b>Assignee:</b>";
          result?.pr?.assignees.forEach((a, i) => {
            assigneeContent += `${i !== 0 ? "," : ""} ` + a.login;
          });
          messageContent += assigneeContent + "\n";
        }
        if (result?.pr?.labels && Array.isArray(result?.pr?.labels)) {
          let labelContent = "<b>Label:</b>";
          result?.pr?.labels.forEach((l, i) => {
            labelContent += `${i !== 0 ? "," : ""} ` + l.name;
          });
          messageContent += labelContent + "\n";
        }
        messageContent += `<b>Nội dung: </b> ` + result?.pr?.body;
      }
      break;
    }
    default:
      break;
  }
  if (messageContent === "") {
    return;
  }

  if (threadId) {
    bot.sendMessage(id, messageContent, {
      parse_mode: "html",
      disable_web_page_preview: true,
      reply_to_message_id: threadId,
    });
  } else {
    bot.sendMessage(id, `${messageContent}`, {
      parse_mode: "html",
      disable_web_page_preview: true,
    });
  }
};

bot.on("message", async (msg) => {
    var messageId = msg.message_id;
    if (msg.text) {
      const text = msg.text.trim();
      const chatId = msg.chat.id;

       // get gitlab webhook
       if (text.startsWith("/gitlab")) {
        sendGitlabWebhookUrl(bot, chatId, messageId, msg);
      }

      // get github webhook url
      if (text.startsWith("/github")) {
        sendGithubWebhookUrl(bot, chatId, messageId, msg);
      }
    }
})


module.exports = {
    gitLabMessage,
    githubMessage
}