const _ = require("lodash");
function sendGitlabWebhookUrl(bot, chatId, messageId, msg) {
  console.log(msg)
  var messageContent = "Copy URL ở dưới đây: \n\n";
  if(msg.message_thread_id){
     messageContent +=
    "``` "+ process.env.APP_URL + "/webhook/" + msg.chat.id + "/" + msg.message_thread_id + "```";
  }else{
   messageContent +=
    "``` "+ process.env.APP_URL + "/webhook/" + msg.chat.id + "```";
  }
  bot.sendMessage(chatId, messageContent, {
    parse_mode: "Markdown",
    reply_to_message_id: messageId,
  });
}
module.exports = {
  sendGitlabWebhookUrl,
  formatTemplate: (templates, content, type) => {
    let result = templates[type];

    if (!result) return "";

    let matches = result.matchAll(/{{([A-Za-z.]+)(\[(.+)])?(\((.+)\))?}}/g);

    for (let match of matches) {
      let placeholder = match[0];
      let property = match[1];
      let value;

      if (placeholder === "{{value}}") value = content;
      else value = _.get(content, property);

      if (value && value.length !== 0) {
        if (Array.isArray(value)) {
          let arrayResult = [];
          let joinChars = "";

          if (match[3]) joinChars = match[3];

          for (let item of value)
            arrayResult.push(
              formatTemplate(templates, item, `${type}.${property}`)
            );

          result = result.replaceAll(placeholder, arrayResult.join(joinChars));
        } else result = result.replaceAll(placeholder, value);
      } else if (match[5]) result = result.replaceAll(placeholder, match[5]);
    }

    return result;
  },
  transformGitLabEvent: (event) => {
    let result = null;
    let eventType;

    if (event.event_name) eventType = event.event_name;
    else if (event.event_type) eventType = event.event_type;
    else if (event.object_kind === "build") eventType = "job";
    else eventType = event.object_kind;

    // eslint-disable-next-line default-case
    switch (eventType) {
      case "notify": {
        result = {
          type: "notify",
          eventName: event.event_type,
          content: event.content
        };

        break;
      }
      case "push": {
        result = {
          type: "push",
          eventName: event.event_name,
          sha: {
            before: event.before,
            after: event.after,
            checkout: event.checkout,
          },
          ref: event.ref,
          user: {
            id: event.user_id,
            name: event.user_name,
            username: event.user_username,
            email: event.user_email,
            avatar: event.user_avatar,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          totalCommitsCount: event.total_commits_count,
          commits: event.commits?.map((commit) => {
            return {
              id: commit.id,
              message: commit.message,
              title: commit.title,
              timestamp: commit.timestamp,
              url: commit.url,
              author: {
                name: commit.author.name,
                email: commit.author.email,
              },
              files: {
                added: commit.added,
                modified: commit.modified,
                removed: commit.removed,
              },
            };
          }),
        };

        break;
      }
      case "tag_push": {
        result = {
          type: "tag_push",
          eventName: event.event_name,
          sha: {
            before: event.before,
            after: event.after,
            checkout: event.checkout,
          },
          ref: event.ref,
          message: event.message,
          user: {
            id: event.user_id,
            name: event.user_name,
            username: event.user_username,
            email: event.user_email,
            avatar: event.user_avatar,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          totalCommitsCount: event.total_commits_count,
          commits: event.commits?.map((commit) => {
            return {
              id: commit.id,
              message: commit.message,
              title: commit.title,
              timestamp: commit.timestamp,
              url: commit.url,
              author: {
                name: commit.author.name,
                email: commit.author.email,
              },
              files: {
                added: commit.added,
                modified: commit.modified,
                removed: commit.removed,
              },
            };
          }),
        };

        break;
      }
      case "confidential_issue":
      case "issue": {
        result = {
          type: "issue",
          eventName: event.event_type,
          title: event.object_attributes.title,
          description: event.object_attributes.description,
          createdDate: event.object_attributes.created_at,
          updatedDate: event.object_attributes.updated_at,
          closedDate: event.object_attributes.closed_at,
          dueDate: event.object_attributes.due_date,
          id: event.object_attributes.iid,
          state: event.object_attributes.state,
          severity: event.object_attributes.severity,
          url: event.object_attributes.url,
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          assignees: event.assignees?.map((assignee) => {
            return {
              id: assignee.id,
              name: assignee.name,
              username: assignee.username,
              email: assignee.email,
              avatar: assignee.avatar_url,
            };
          }),
          labels: event.labels?.map((label) => {
            return {
              title: label.title,
              color: label.color,
            };
          }),
        };

        break;
      }
      case "confidential_note":
      case "note": {
        result = {
          type: "note",
          eventName: event.event_type,
          createdDate: event.object_attributes.created_at,
          updatedDate: event.object_attributes.updated_at,
          resolvedDate: event.object_attributes.resolved_at,
          note: event.object_attributes.note,
          noteableType: event.object_attributes.noteable_type,
          url: event.object_attributes.url,
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
        };

        break;
      }
      case "merge_request": {
        result = {
          type: "merge_request",
          eventName: event.event_type,
          createdDate: event.object_attributes.created_at,
          updatedDate: event.object_attributes.updated_at,
          title: event.object_attributes.title,
          description: event.object_attributes.description,
          id: event.object_attributes.iid,
          state: event.object_attributes.state,
          workInProgress: event.object_attributes.work_in_progress,
          url: event.object_attributes.url,
          mergeStatus: event.object_attributes.merge_status,
          sourceBranch: event.object_attributes.source_branch,
          targetBranch: event.object_attributes.target_branch,
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          assignees: event.assignees?.map((assignee) => {
            return {
              id: assignee.id,
              name: assignee.name,
              username: assignee.username,
              email: assignee.email,
              avatar: assignee.avatar_url,
            };
          }),
          labels: event.labels?.map((label) => {
            return {
              title: label.title,
              color: label.color,
            };
          }),
        };

        break;
      }
      case "job": {
        result = {
          type: "job",
          ref: event.ref,
          tag: event.tag,
          stage: event.build_stage,
          name: event.build_name,
          status: event.build_status,
          duration: event.build_duration,
          queueDuration: event.build_queued_duration,
          createdAt: event.build_created_at,
          startedAt: event.build_started_at,
          finishedAt: event.build_finished_at,
          sha: {
            before: event.before_sha,
            after: event.sha,
          },
          urls: {
            pipeline: `${event.repository.homepage}/-/pipelines/${event.pipeline_id}`,
            job: `${event.repository.homepage}/-/jobs/${event.build_id}`,
          },
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project_id,
            name: event.project_name,
            description: event.repository.description,
            urls: {
              repository: event.repository.homepage,
              gitSsh: event.repository.git_ssh_url,
              gitHttp: event.repository.git_http_url,
            },
          },
          runner: {
            id: event.runner?.id,
            description: event.runner?.description,
            type: event.runner?.runner_type,
            active: event.runner?.active,
            shared: event.runner?.is_shared,
            tags: event.runner?.tags,
          },
        };

        break;
      }
      case "pipeline": {
        result = {
          type: "pipeline",
          id: event?.object_attributes?.id,
          ref: event?.object_attributes?.ref,
          tag: event?.object_attributes?.tag,
          sha: {
            before: event?.object_attributes?.before_sha,
            after: event?.object_attributes?.sha,
          },
          source: event?.object_attributes?.source,
          status: event?.object_attributes?.status,
          detailedStatus: event?.object_attributes?.detailed_status,
          stages: event?.object_attributes?.stages,
          createdAt: event?.object_attributes?.created_at,
          finishedAt: event?.object_attributes?.finished_at,
          duration: event?.object_attributes?.duration,
          queueDuration: event?.object_attributes?.queued_duration,
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.web_url,
              gitSsh: event.project.git_ssh_url,
              gitHttp: event.project.git_http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          commit: {
            id: event.commit.id,
            title: event.commit.title,
            message: event.commit.message,
            timestamp: event.commit.timestamp,
            url: event.commit.url,
            author: event.commit.author,
          },
        };

        break;
      }
      case "wiki_page": {
        result = {
          type: "wiki_page",
          slug: event.object_attributes.slug,
          title: event.object_attributes.title,
          format: event.object_attributes.format,
          content: event.object_attributes.content,
          action: event.object_attributes.action,
          urls: {
            page: event.object_attributes.url,
            diff: event.object_attributes.diff_url,
          },
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          wiki: {
            urls: {
              web: event.wiki.web_url,
              gitSsh: event.wiki.git_ssh_url,
              gitHttp: event.project.git_http_url,
            },
            defaultBranch: event.wiki.default_branch,
          },
        };

        break;
      }
      case "feature_flag": {
        result = {
          type: "feature_flag",
          id: event.object_attributes.id,
          name: event.object_attributes.name,
          description: event.object_attributes.description,
          active: event.object_attributes.active,
          user: {
            id: event.user.id,
            name: event.user.name,
            username: event.user.username,
            email: event.user.email,
            avatar: event.user.avatar_url,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
        };

        break;
      }
      case "release": {
        result = {
          type: "release",
          id: event.id,
          description: event.description,
          name: event.name,
          tag: event.tag,
          url: event.url,
          action: event.action,
          createdAt: event.created_at,
          releasedAt: event.released_at,
          assets: {
            count: event.assets.count,
            links: event.assets.links?.map((link) => {
              return {
                id: link.id,
                external: link.external,
                type: link.link_type,
                name: link.name,
                url: link.url,
              };
            }),
            sources: event.assets.sources,
          },
          project: {
            id: event.project.id,
            name: event.project.name,
            description: event.project.description,
            avatar: event.project.avatar_url,
            urls: {
              repository: event.project.homepage,
              gitSsh: event.project.ssh_url,
              gitHttp: event.project.http_url,
            },
            namespace: event.project.namespace,
            defaultBranch: event.project.default_branch,
          },
          commit: {
            id: event.commit.id,
            message: event.commit.message,
            title: event.commit.title,
            timestamp: event.commit.timestamp,
            url: event.commit.url,
            author: event.commit.author,
          },
        };

        break;
      }
      default:
        break;
    }

    return result;
  },
};
