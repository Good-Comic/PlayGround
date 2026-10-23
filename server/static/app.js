const health = document.querySelector('#health');
const projectList = document.querySelector('#project-list');
const fileList = document.querySelector('#file-list');
const runList = document.querySelector('#run-list');
const empty = document.querySelector('#empty');
const log = document.querySelector('#log');
const preview = document.querySelector('#game-preview');
const previewEmpty = document.querySelector('#preview-empty');
const fileTitle = document.querySelector('#file-title');
const fileContent = document.querySelector('#file-content');
const reloadButton = document.querySelector('#reload-preview');
const buildButton = document.querySelector('#run-build');
const testButton = document.querySelector('#run-test');
const providerList = document.querySelector('#provider-list');
const providerSelect = document.querySelector('#agent-provider');
const providerFallbackSelect = document.querySelector('#provider-fallback');
const agentTaskList = document.querySelector('#agent-task-list');
const agentDetails = document.querySelector('#agent-details');
const agentTaskOutput = document.querySelector('#agent-task-output');
const agentActions = document.querySelector('#agent-actions');
const createAgentTaskButton = document.querySelector('#create-agent-task');
let selectedProject = null;
let providers = [];

async function jsonRequest(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

async function loadProjects() {
  const data = await jsonRequest('/api/projects');
  projectList.replaceChildren(...data.projects.map((project) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'list-button';
    button.textContent = `${project.name} — ${project.relative_path}`;
    button.addEventListener('click', () => selectProject(project));
    item.append(button);
    return item;
  }));
  empty.hidden = data.projects.length > 0;
  if (!selectedProject && data.projects.length === 1) await selectProject(data.projects[0]);
}

async function selectProject(project) {
  selectedProject = project;
  buildButton.disabled = false;
  testButton.disabled = false;
  reloadButton.disabled = false;
  preview.src = `/preview/${project.id}/index.html`;
  preview.hidden = false;
  previewEmpty.hidden = true;
  log.textContent = `已选择 ${project.name}。项目以只读方式提供预览。`;
  createAgentTaskButton.disabled = false;
  await Promise.all([loadFiles(), loadRuns(), loadAgentTasks()]);
}

async function loadFiles() {
  const data = await jsonRequest(`/api/projects/${selectedProject.id}/files`);
  fileList.replaceChildren(...data.files.map((file) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'file-button';
    button.textContent = `${file.path} (${file.size} B)`;
    button.addEventListener('click', () => {
      document.querySelector('#agent-target').value = file.path;
      viewFile(file.path);
    });
    item.append(button);
    return item;
  }));
}

function capability(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Unknown';
}

async function loadProviders() {
  const data = await jsonRequest('/api/providers');
  providers = data.providers;
  providerList.replaceChildren(...providers.map((provider) => {
    const item = document.createElement('li');
    const row = document.createElement('div');
    row.className = 'provider-card';
    const label = document.createElement('span');
    const credential = provider.kind === 'openai-compatible'
      ? ` · Key ${provider.api_key_configured ? '已配置' : '未配置'}` : '';
    const fallback = provider.fallback_provider_id ? ` · fallback #${provider.fallback_provider_id}` : '';
    label.textContent = `${provider.name} · ${provider.model_id} · tools ${capability(provider.supports_tool_calls)}${fallback}${credential}`;
    const diagnose = document.createElement('button');
    diagnose.type = 'button';
    diagnose.textContent = '诊断';
    diagnose.addEventListener('click', () => diagnoseProvider(provider.id));
    row.append(label, diagnose);
    item.append(row);
    return item;
  }));
  providerSelect.replaceChildren(...providers.map((provider) => {
    const option = document.createElement('option');
    option.value = provider.id;
    option.textContent = `${provider.name} / ${provider.model_id}`;
    return option;
  }));
  const noFallback = document.createElement('option');
  noFallback.value = '';
  noFallback.textContent = '无 fallback';
  providerFallbackSelect.replaceChildren(noFallback, ...providers.map((provider) => {
    const option = document.createElement('option');
    option.value = provider.id;
    option.textContent = `${provider.name} / ${provider.model_id}`;
    return option;
  }));
}

async function diagnoseProvider(providerId) {
  log.textContent = '正在执行 Provider 连线诊断…';
  try {
    const data = await jsonRequest(`/api/providers/${providerId}/diagnose`, {method: 'POST'});
    log.textContent = `${data.diagnosis.message}\n延迟：${data.diagnosis.latency_ms} ms\n模型：${data.diagnosis.models.join(', ') || '未回报'}`;
  } catch (error) {
    log.textContent = `Provider 诊断失败：${error.message}`;
  }
}

async function loadAgentTasks() {
  if (!selectedProject) return;
  const data = await jsonRequest(`/api/agent/tasks?project_id=${selectedProject.id}`);
  agentTaskList.replaceChildren(...(data.tasks.length ? data.tasks.map((task) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `task ${task.status}`;
    button.textContent = `#${task.id} ${task.effective_mode}: ${task.status}`;
    button.addEventListener('click', () => showAgentTask(task.id));
    item.append(button);
    return item;
  }) : [Object.assign(document.createElement('li'), {textContent: '尚无 Agent 任务'})]));
}

async function showAgentTask(taskId) {
  const data = await jsonRequest(`/api/agent/tasks/${taskId}`);
  const task = data.task;
  agentDetails.hidden = false;
  agentActions.replaceChildren();
  const actions = [];
  if (task.status === 'awaiting_approval') actions.push(['核准至隔离区并测试', 'approve']);
  if (['queued', 'running'].includes(task.status)) actions.push(['取消', 'cancel']);
  if (['failed', 'cancelled'].includes(task.status)) actions.push(['重试', 'retry']);
  if (['awaiting_approval', 'completed', 'failed'].includes(task.status) && task.workspace_path) actions.push(['回滚隔离区', 'rollback']);
  for (const [label, action] of actions) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', () => agentTaskAction(task.id, action));
    agentActions.append(button);
  }
  const audit = task.events.map((event) => `${event.created_at} ${event.from_status || 'new'} → ${event.to_status}: ${event.message}`).join('\n');
  agentTaskOutput.textContent = [
    `Task #${task.id} · requested=${task.requested_mode} · effective=${task.effective_mode} · status=${task.status} · provider=${task.used_provider_id || task.provider_id}`,
    `usage=${task.usage_input_tokens}+${task.usage_output_tokens} tokens · cost=$${Number(task.cost_usd).toFixed(6)}`,
    task.error ? `error: ${task.error}` : '', task.summary, task.diff, task.validation_output, audit,
  ].filter(Boolean).join('\n\n');
  return task;
}

async function watchAgentTask(taskId) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const task = await showAgentTask(taskId);
    await loadAgentTasks();
    if (!['queued', 'running', 'approved', 'validating'].includes(task.status)) return task;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('等待 Agent 状态逾时');
}

async function agentTaskAction(taskId, action) {
  try {
    await jsonRequest(`/api/agent/tasks/${taskId}/${action}`, {method: 'POST'});
    await watchAgentTask(taskId);
  } catch (error) {
    log.textContent = `Agent 操作失败：${error.message}`;
  }
}

async function viewFile(path) {
  try {
    const data = await jsonRequest(`/api/projects/${selectedProject.id}/file?path=${encodeURIComponent(path)}`);
    fileTitle.textContent = data.path;
    fileContent.textContent = data.content;
  } catch (error) {
    fileTitle.textContent = path;
    fileContent.textContent = error.message;
  }
}

async function loadRuns() {
  const data = await jsonRequest(`/api/projects/${selectedProject.id}/runs`);
  runList.replaceChildren(...(data.runs.length ? data.runs.map((run) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `run ${run.status}`;
    button.textContent = `#${run.id} ${run.action}: ${run.status}`;
    button.addEventListener('click', () => { log.textContent = `${run.command}\n\n${run.output}`; });
    item.append(button);
    return item;
  }) : [Object.assign(document.createElement('li'), {textContent: '尚无执行记录'})]));
}

async function runAction(action) {
  if (!selectedProject) return;
  buildButton.disabled = true;
  testButton.disabled = true;
  log.textContent = `正在执行 ${action}…`;
  try {
    const data = await jsonRequest(`/api/projects/${selectedProject.id}/runs`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action}),
    });
    log.textContent = `${data.run.command}\n\n${data.run.output}`;
  } catch (error) {
    log.textContent = `${action} 无法执行：${error.message}`;
  } finally {
    buildButton.disabled = false;
    testButton.disabled = false;
    await loadRuns();
  }
}

async function boot() {
  try {
    await jsonRequest('/health');
    health.textContent = 'Studio API 已就绪';
    health.className = 'ok';
    await Promise.all([loadProviders(), loadProjects()]);
  } catch (error) {
    health.textContent = 'Studio API 无法连接';
    health.className = 'error';
    log.textContent = error.message;
  }
}

document.querySelector('#provider-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    name: document.querySelector('#provider-name').value,
    kind: document.querySelector('#provider-kind').value,
    base_url: document.querySelector('#provider-url').value,
    model_id: document.querySelector('#provider-model').value,
    timeout_seconds: Number(document.querySelector('#provider-timeout').value),
    retries: Number(document.querySelector('#provider-retries').value),
    input_cost_per_million: Number(document.querySelector('#provider-input-cost').value),
    output_cost_per_million: Number(document.querySelector('#provider-output-cost').value),
    max_cost_usd: Number(document.querySelector('#provider-cost-cap').value),
    fallback_provider_id: providerFallbackSelect.value || null,
  };
  if (document.querySelector('#provider-tools').checked) payload.supports_tool_calls = true;
  try {
    const data = await jsonRequest('/api/providers', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
    });
    log.textContent = `已新增 ${data.provider.name}；密钥未由网页传送。`;
    event.target.reset();
    await loadProviders();
  } catch (error) {
    log.textContent = `新增 Provider 失败：${error.message}`;
  }
});

document.querySelector('#agent-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedProject) return;
  const payload = {
    project_id: selectedProject.id,
    provider_id: Number(providerSelect.value),
    mode: document.querySelector('#agent-mode').value,
    target_path: document.querySelector('#agent-target').value,
    instruction: document.querySelector('#agent-instruction').value,
  };
  createAgentTaskButton.disabled = true;
  try {
    const data = await jsonRequest('/api/agent/tasks', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
    });
    await watchAgentTask(data.task.id);
  } catch (error) {
    log.textContent = `建立 Agent 任务失败：${error.message}`;
  } finally {
    createAgentTaskButton.disabled = false;
  }
});

document.querySelector('#import-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const path = document.querySelector('#path').value;
  try {
    const data = await jsonRequest('/api/projects/import-local', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({path}),
    });
    log.textContent = `已导入 ${data.project.relative_path}`;
    await loadProjects();
    await selectProject(data.project);
  } catch (error) {
    log.textContent = `导入失败：${error.message}`;
  }
});

reloadButton.addEventListener('click', () => {
  if (selectedProject) preview.src = `/preview/${selectedProject.id}/index.html?reload=${Date.now()}`;
});
buildButton.addEventListener('click', () => runAction('build'));
testButton.addEventListener('click', () => runAction('test'));
boot();
