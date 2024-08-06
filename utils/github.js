function githubEvent(eventType, data) {
    try {
        if (!eventType) return;
        let result;
        switch (eventType) {
            case "push": {
                result = {
                    type: "push",
                    eventName: eventType,
                    sha: {
                        before: data.before,
                        after: data.after,
                        // checkout: event.checkout,
                    },
                    ref: data.ref,
                    user: {
                        id: data?.sender?.id,
                        name: data?.pusher?.name,
                        username: data?.sender?.login,
                        email: data?.pusher?.email,
                        avatar: data?.sender?.avatar_url,
                    },
                    project: {
                        id: data?.repository?.id,
                        name: data?.repository?.name,
                        description: data?.repository?.description,
                        avatar: null,
                        urls: {
                            repository: data?.repository?.url,
                            gitSsh: data?.repository?.ssh_url,
                            gitHttp: data?.repository?.git_url,
                        },
                        namespace: data?.repository?.full_name,
                        defaultBranch: data?.repository?.default_branch,
                    },
                    //   totalCommitsCount: event.total_commits_count,
                    commits: data?.commits?.map((commit) => {
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
                    eventName: eventType,
                    sha: {
                        before: data.before,
                        after: data.after,
                        // checkout: event.checkout,
                    },
                    ref: data.ref,
                    user: {
                        id: data?.sender?.id,
                        name: data?.pusher?.name,
                        username: data?.sender?.login,
                        email: data?.pusher?.email,
                        avatar: data?.sender?.avatar_url,
                    },
                    project: {
                        id: data?.repository?.id,
                        name: data?.repository?.name,
                        description: data?.repository?.description,
                        avatar: null,
                        urls: {
                            repository: data?.repository?.url,
                            gitSsh: data?.repository?.ssh_url,
                            gitHttp: data?.repository?.git_url,
                        },
                        namespace: data?.repository?.full_name,
                        defaultBranch: data?.repository?.default_branch,
                    },
                };

                break;
            }
            case "create":
                result = {
                    type: "create",
                    eventName: eventType,
                    sha: {
                        before: data.before,
                        after: data.after,
                        // checkout: event.checkout,
                    },
                    ref: data.ref,
                    refType: data?.ref_type,
                    user: {
                        id: data?.sender?.id,
                        name: data?.sender?.login,
                        username: data?.sender?.login,
                    },
                    project: {
                        id: data?.repository?.id,
                        name: data?.repository?.name,
                        description: data?.repository?.description,
                        avatar: null,
                        urls: {
                            repository: data?.repository?.url,
                            gitSsh: data?.repository?.ssh_url,
                            gitHttp: data?.repository?.git_url,
                        },
                        namespace: data?.repository?.full_name,
                        defaultBranch: data?.repository?.default_branch,
                    },
                    //   totalCommitsCount: event.total_commits_count,
                    commits: data?.commits?.map((commit) => {
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
                }
                break;
            case "issues":
                const {issue, action, sender} = data;
                const {assignees, body, title, login, html_url, labels, number} = issue ?? {}
                result = {
                    type: "issues",
                    action: action,
                    issue: {
                        url: html_url,
                        title,
                        user_name: sender?.login,
                        body,
                        assignees,
                        labels,
                        number
                    }
                    // eventName: event.event_type,
                    // title: event.object_attributes.title,
                    // description: event.object_attributes.description,
                    // createdDate: event.object_attributes.created_at,
                    // updatedDate: event.object_attributes.updated_at,
                    // closedDate: event.object_attributes.closed_at,
                    // dueDate: event.object_attributes.due_date,
                    // id: event.object_attributes.iid,
                    // state: event.object_attributes.state,
                    // severity: event.object_attributes.severity,
                    // url: event.object_attributes.url,
                    // user: {
                    //   id: event.user.id,
                    //   name: event.user.name,
                    //   username: event.user.username,
                    //   email: event.user.email,
                    //   avatar: event.user.avatar_url,
                    // },
                    // project: {
                    //   id: event.project.id,
                    //   name: event.project.name,
                    //   description: event.project.description,
                    //   avatar: event.project.avatar_url,
                    //   urls: {
                    //     repository: event.project.homepage,
                    //     gitSsh: event.project.ssh_url,
                    //     gitHttp: event.project.http_url,
                    //   },
                    //   namespace: event.project.namespace,
                    //   defaultBranch: event.project.default_branch,
                    // },
                    // assignees: event.assignees?.map((assignee) => {
                    //   return {
                    //     id: assignee.id,
                    //     name: assignee.name,
                    //     username: assignee.username,
                    //     email: assignee.email,
                    //     avatar: assignee.avatar_url,
                    //   };
                    // }),
                    // labels: event.labels?.map((label) => {
                    //   return {
                    //     title: label.title,
                    //     color: label.color,
                    //   };
                    // }),
                };
                break;
            case "pull_request": {
                const {pull_request, action, sender, repository} = data;
                const {
                    html_url,
                    number,
                    title,
                    body,
                    requested_reviewers,
                    assignees,
                    labels,
                    head,
                    base,
                    commits
                } = pull_request ?? {};
                result = {
                    type: eventType,
                    eventName: eventType,
                    action,
                    pr: {
                        user_name: sender?.login,
                        url: html_url,
                        repo_url: repository?.url,
                        number,
                        title,
                        body,
                        reviewers: requested_reviewers,
                        assignees,
                        labels,
                        head,
                        base,
                        commits
                    }
                }
                break;
            }
            //   case "job": {
            //     result = {
            //       type: "job",
            //       ref: event.ref,
            //       tag: event.tag,
            //       stage: event.build_stage,
            //       name: event.build_name,
            //       status: event.build_status,
            //       duration: event.build_duration,
            //       queueDuration: event.build_queued_duration,
            //       createdAt: event.build_created_at,
            //       startedAt: event.build_started_at,
            //       finishedAt: event.build_finished_at,
            //       sha: {
            //         before: event.before_sha,
            //         after: event.sha,
            //       },
            //       urls: {
            //         pipeline: `${event.repository.homepage}/-/pipelines/${event.pipeline_id}`,
            //         job: `${event.repository.homepage}/-/jobs/${event.build_id}`,
            //       },
            //       user: {
            //         id: event.user.id,
            //         name: event.user.name,
            //         username: event.user.username,
            //         email: event.user.email,
            //         avatar: event.user.avatar_url,
            //       },
            //       project: {
            //         id: event.project_id,
            //         name: event.project_name,
            //         description: event.repository.description,
            //         urls: {
            //           repository: event.repository.homepage,
            //           gitSsh: event.repository.git_ssh_url,
            //           gitHttp: event.repository.git_http_url,
            //         },
            //       },
            //       runner: {
            //         id: event.runner?.id,
            //         description: event.runner?.description,
            //         type: event.runner?.runner_type,
            //         active: event.runner?.active,
            //         shared: event.runner?.is_shared,
            //         tags: event.runner?.tags,
            //       },
            //     };

            //     break;
            //   }
            //   case "pipeline": {
            //     result = {
            //       type: "pipeline",
            //       id: event?.object_attributes?.id,
            //       ref: event?.object_attributes?.ref,
            //       tag: event?.object_attributes?.tag,
            //       sha: {
            //         before: event?.object_attributes?.before_sha,
            //         after: event?.object_attributes?.sha,
            //       },
            //       source: event?.object_attributes?.source,
            //       status: event?.object_attributes?.status,
            //       detailedStatus: event?.object_attributes?.detailed_status,
            //       stages: event?.object_attributes?.stages,
            //       createdAt: event?.object_attributes?.created_at,
            //       finishedAt: event?.object_attributes?.finished_at,
            //       duration: event?.object_attributes?.duration,
            //       queueDuration: event?.object_attributes?.queued_duration,
            //       user: {
            //         id: event.user.id,
            //         name: event.user.name,
            //         username: event.user.username,
            //         email: event.user.email,
            //         avatar: event.user.avatar_url,
            //       },
            //       project: {
            //         id: event.project.id,
            //         name: event.project.name,
            //         description: event.project.description,
            //         avatar: event.project.avatar_url,
            //         urls: {
            //           repository: event.project.web_url,
            //           gitSsh: event.project.git_ssh_url,
            //           gitHttp: event.project.git_http_url,
            //         },
            //         namespace: event.project.namespace,
            //         defaultBranch: event.project.default_branch,
            //       },
            //       commit: {
            //         id: event.commit.id,
            //         title: event.commit.title,
            //         message: event.commit.message,
            //         timestamp: event.commit.timestamp,
            //         url: event.commit.url,
            //         author: event.commit.author,
            //       },
            //     };

            //     break;
            //   }
            //   case "wiki_page": {
            //     result = {
            //       type: "wiki_page",
            //       slug: event.object_attributes.slug,
            //       title: event.object_attributes.title,
            //       format: event.object_attributes.format,
            //       content: event.object_attributes.content,
            //       action: event.object_attributes.action,
            //       urls: {
            //         page: event.object_attributes.url,
            //         diff: event.object_attributes.diff_url,
            //       },
            //       user: {
            //         id: event.user.id,
            //         name: event.user.name,
            //         username: event.user.username,
            //         email: event.user.email,
            //         avatar: event.user.avatar_url,
            //       },
            //       project: {
            //         id: event.project.id,
            //         name: event.project.name,
            //         description: event.project.description,
            //         avatar: event.project.avatar_url,
            //         urls: {
            //           repository: event.project.homepage,
            //           gitSsh: event.project.ssh_url,
            //           gitHttp: event.project.http_url,
            //         },
            //         namespace: event.project.namespace,
            //         defaultBranch: event.project.default_branch,
            //       },
            //       wiki: {
            //         urls: {
            //           web: event.wiki.web_url,
            //           gitSsh: event.wiki.git_ssh_url,
            //           gitHttp: event.project.git_http_url,
            //         },
            //         defaultBranch: event.wiki.default_branch,
            //       },
            //     };

            //     break;
            //   }
            //   case "feature_flag": {
            //     result = {
            //       type: "feature_flag",
            //       id: event.object_attributes.id,
            //       name: event.object_attributes.name,
            //       description: event.object_attributes.description,
            //       active: event.object_attributes.active,
            //       user: {
            //         id: event.user.id,
            //         name: event.user.name,
            //         username: event.user.username,
            //         email: event.user.email,
            //         avatar: event.user.avatar_url,
            //       },
            //       project: {
            //         id: event.project.id,
            //         name: event.project.name,
            //         description: event.project.description,
            //         avatar: event.project.avatar_url,
            //         urls: {
            //           repository: event.project.homepage,
            //           gitSsh: event.project.ssh_url,
            //           gitHttp: event.project.http_url,
            //         },
            //         namespace: event.project.namespace,
            //         defaultBranch: event.project.default_branch,
            //       },
            //     };

            //     break;
            //   }
            //   case "release": {
            //     result = {
            //       type: "release",
            //       id: event.id,
            //       description: event.description,
            //       name: event.name,
            //       tag: event.tag,
            //       url: event.url,
            //       action: event.action,
            //       createdAt: event.created_at,
            //       releasedAt: event.released_at,
            //       assets: {
            //         count: event.assets.count,
            //         links: event.assets.links?.map((link) => {
            //           return {
            //             id: link.id,
            //             external: link.external,
            //             type: link.link_type,
            //             name: link.name,
            //             url: link.url,
            //           };
            //         }),
            //         sources: event.assets.sources,
            //       },
            //       project: {
            //         id: event.project.id,
            //         name: event.project.name,
            //         description: event.project.description,
            //         avatar: event.project.avatar_url,
            //         urls: {
            //           repository: event.project.homepage,
            //           gitSsh: event.project.ssh_url,
            //           gitHttp: event.project.http_url,
            //         },
            //         namespace: event.project.namespace,
            //         defaultBranch: event.project.default_branch,
            //       },
            //       commit: {
            //         id: event.commit.id,
            //         message: event.commit.message,
            //         title: event.commit.title,
            //         timestamp: event.commit.timestamp,
            //         url: event.commit.url,
            //         author: event.commit.author,
            //       },
            //     };

            //     break;
            //   }
        }
        return result
    } catch (e) {
        console.log("Error: Lỗi github event api");
    }
}

function sendGithubWebhookUrl(bot, chatId, messageId, msg) {
    var messageContent = "Copy URL ở dưới đây vứt vào Setting>Webhook: \n\n";
    if(msg.message_thread_id){
        messageContent +=
            "``` "+process.env.APP_URL+"/github/" + msg.chat.id + "/" + msg.message_thread_id + "```";
    }else{
        messageContent +=
            "``` "+process.env.APP_URL+"/github/" + msg.chat.id + "```";
    }
    bot.sendMessage(chatId, messageContent, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
    });
}
module.exports = {
    githubEvent,
    sendGithubWebhookUrl
};
