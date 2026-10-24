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
const githubStatus = document.querySelector('#github-status');
const githubRepoList = document.querySelector('#github-repo-list');
const githubChangeList = document.querySelector('#github-change-list');
const githubDetails = document.querySelector('#github-details');
const githubOutput = document.querySelector('#github-output');
const githubActions = document.querySelector('#github-actions');
const registerGithubRepoButton = document.querySelector('#register-github-repo');
const prepareGithubChangeButton = document.querySelector('#prepare-github-change');
const githubReconcileButton = document.querySelector('#github-reconcile');
const startLivePreviewButton = document.querySelector('#start-live-preview');
const runQualityButton = document.querySelector('#run-quality');
const approveGoldenButton = document.querySelector('#approve-golden');
const stopLivePreviewButton = document.querySelector('#stop-live-preview');
const qualityDetails = document.querySelector('#quality-details');
const qualityOutput = document.querySelector('#quality-output');
const successShot = document.querySelector('#success-shot');
const failureShot = document.querySelector('#failure-shot');
const automationSpec = document.querySelector('#automation-spec');
const automationRequirements = document.querySelector('#automation-requirements');
const automationList = document.querySelector('#automation-list');
const automationOutput = document.querySelector('#automation-output');
const runAutomationButton = document.querySelector('#run-automation');
let selectedProject = null;
let providers = [];
let selectedGithubRepo = null;
let selectedPreview = null;
let selectedQualityRun = null;

async function loadAutomation() {
  const [spec, jobs] = await Promise.all([
    jsonRequest('/api/automation/spec'), jsonRequest('/api/automation/jobs'),
  ]);
  automationSpec.textContent = `v${spec.version} · ${spec.status} · ${spec.requirements.length} 项可追踪需求；缺少原始 v3.0 全文，不推测补写。`;
  if (!automationRequirements.options.length) {
    automationRequirements.replaceChildren(...spec.requirements.map((requirement) => {
      const option = document.createElement('option');
      option.value = requirement.id;
      option.textContent = `${requirement.id} — ${requirement.text}`;
      return option;
    }));
  }
  automationList.replaceChildren(...(jobs.jobs.length ? jobs.jobs.map((job) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `task ${job.status}`;
    button.textContent = `#${job.id} ${job.status} · attempt ${job.attempt}/${job.max_retries + 1} · $${job.used_cost_usd.toFixed(4)}`;
    button.addEventListener('click', () => { automationOutput.textContent = JSON.stringify(job, null, 2); });
    item.append(button);
    return item;
  }) : [Object.assign(document.createElement('li'), {textContent: '尚无自动化任务'})]));
}

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
  startLivePreviewButton.disabled = false;
  reloadButton.disabled = true;
  preview.removeAttribute('src');
  preview.hidden = true;
  previewEmpty.hidden = false;
  previewEmpty.textContent = `已选择 ${project.name}；可从唯读基准或已完成 Agent Task 建立隔离 Vite 工作区。`;
  log.textContent = `已选择 ${project.name}。原始项目保持只读。`;
  createAgentTaskButton.disabled = false;
  registerGithubRepoButton.disabled = false;
  runAutomationButton.disabled = !selectedGithubRepo;
  await Promise.all([loadFiles(), loadRuns(), loadAgentTasks()]);
}

function showQualityRun(run) {
  selectedQualityRun = run;
  qualityDetails.hidden = false;
  approveGoldenButton.disabled = !run.gate_passed;
  const metrics = run.metrics || {};
  qualityOutput.textContent = [
    `Run #${run.id} · ${run.status} · gate=${run.gate_passed}`,
    `Traversal=${metrics.traversal_kind || 'not completed'}`,
    `Load=${Number(metrics.load_ms || 0).toFixed(1)} ms · DOM=${Number(metrics.dom_content_loaded_ms || 0).toFixed(1)} ms`,
    `Measured FPS=${Number(metrics.measured_fps || 0).toFixed(2)} · interaction=${Number(metrics.interaction_latency_ms || 0).toFixed(2)} ms`,
    `Vite RSS=${metrics.vite_rss_bytes == null ? 'unavailable' : `${(metrics.vite_rss_bytes / 1048576).toFixed(2)} MiB`}`,
    `Visual=${JSON.stringify(run.visual)} · modified=${JSON.stringify(run.modified)}`,
    `Console=${JSON.stringify(run.console)}\nPage errors=${JSON.stringify(run.page_errors)}\nLoad failures=${JSON.stringify(run.load_failures)}`,
    run.log,
    `Rollback point: ${run.rollback_path}`,
  ].join('\n');
  successShot.hidden = !run.success_screenshot;
  failureShot.hidden = !run.failure_screenshot;
  if (run.success_screenshot) successShot.src = `/api/preview-quality/${run.id}/success.png?now=${Date.now()}`;
  if (run.failure_screenshot) failureShot.src = `/api/preview-quality/${run.id}/failure.png?now=${Date.now()}`;
}

async function startLivePreview(event) {
  event.preventDefault();
  if (!selectedProject) return;
  startLivePreviewButton.disabled = true;
  log.textContent = '正在复制隔离工作区并启动 Vite…';
  const rawTask = document.querySelector('#preview-task-id').value;
  try {
    const data = await jsonRequest('/api/previews', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({project_id: selectedProject.id, task_id: rawTask || null}),
    });
    selectedPreview = data.preview;
    preview.src = selectedPreview.preview_url;
    preview.hidden = false;
    previewEmpty.hidden = true;
    reloadButton.disabled = false;
    runQualityButton.disabled = false;
    stopLivePreviewButton.disabled = false;
    log.textContent = `${selectedPreview.adapter_id} 已在隔离工作区启动。Vite HMR 已启用，原始项目未写入。`;
  } catch (error) {
    startLivePreviewButton.disabled = false;
    log.textContent = `启动预览失败：${error.message}`;
  }
}

async function runPreviewQuality() {
  if (!selectedPreview) return;
  runQualityButton.disabled = true;
  log.textContent = '正在执行 Playwright Quality Gate…';
  try {
    const data = await jsonRequest(`/api/previews/${selectedPreview.id}/quality`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}',
    });
    showQualityRun(data.run);
    log.textContent = `Quality Gate ${data.run.gate_passed ? '通过' : '拒绝'}；日志与截图已保存。`;
  } catch (error) {
    log.textContent = `Quality Gate 无法执行：${error.message}`;
  } finally {
    runQualityButton.disabled = false;
  }
}

async function approveGolden() {
  if (!selectedPreview || !selectedQualityRun) return;
  approveGoldenButton.disabled = true;
  try {
    const data = await jsonRequest(`/api/previews/${selectedPreview.id}/golden`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({run_id: selectedQualityRun.id, confirm: true}),
    });
    selectedPreview = data.preview;
    log.textContent = `Golden 已由明确操作核准，来源 Quality Run #${selectedQualityRun.id}。`;
  } catch (error) {
    log.textContent = `Golden 核准失败：${error.message}`;
    approveGoldenButton.disabled = false;
  }
}

async function stopLivePreview() {
  if (!selectedPreview) return;
  try {
    await jsonRequest(`/api/previews/${selectedPreview.id}/stop`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}',
    });
    preview.removeAttribute('src');
    preview.hidden = true;
    previewEmpty.hidden = false;
    selectedPreview = null;
    reloadButton.disabled = true;
    runQualityButton.disabled = true;
    stopLivePreviewButton.disabled = true;
    startLivePreviewButton.disabled = false;
    log.textContent = '隔离 Vite 预览已停止。';
  } catch (error) {
    log.textContent = `停止预览失败：${error.message}`;
  }
}

async function loadGithubStatus() {
  const data = await jsonRequest('/api/github/status');
  const config = data.configuration;
  githubStatus.textContent = [
    data.message,
    `App ID ${config.app_id_configured ? '已配置' : '未配置'} · 私钥 ${config.private_key_configured ? '已配置' : '未配置'} · Webhook secret ${config.webhook_secret_configured ? '已配置' : '未配置'} · 外部写入 ${config.external_writes_enabled ? '启用' : '停用'}`,
  ].join('\n');
}

async function loadGithubRepositories() {
  const data = await jsonRequest('/api/github/repositories');
  githubRepoList.replaceChildren(...(data.repositories.length ? data.repositories.map((repo) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `repo ${repo.conflict ? 'failed' : ''}`;
    button.textContent = `${repo.owner}/${repo.name} · ${repo.mode} · ${repo.status}`;
    button.addEventListener('click', () => selectGithubRepository(repo));
    item.append(button);
    return item;
  }) : [Object.assign(document.createElement('li'), {textContent: '尚未登记'})]));
  if (!selectedGithubRepo && data.repositories.length === 1) await selectGithubRepository(data.repositories[0]);
}

async function selectGithubRepository(repo) {
  selectedGithubRepo = repo;
  runAutomationButton.disabled = !selectedProject;
  githubReconcileButton.disabled = false;
  prepareGithubChangeButton.disabled = false;
  await loadGithubChanges();
  githubOutput.textContent = [
    `${repo.owner}/${repo.name} · mode=${repo.mode} · base=${repo.base_ref}@${repo.base_sha}`,
    `permissions=${JSON.stringify(repo.permissions)} · latest=${repo.latest_remote_sha || 'Unknown'}`,
    `ahead=${repo.ahead} behind=${repo.behind} conflict=${repo.conflict} pendingPR=${repo.pending_prs}`,
    `last webhook=${repo.last_webhook_at || 'Never'} · last sync=${repo.last_sync_at || 'Never'} · error=${repo.sync_error || 'None'}`,
  ].join('\n');
  githubDetails.hidden = false;
}

async function loadGithubChanges() {
  if (!selectedGithubRepo) return;
  const data = await jsonRequest(`/api/github/repositories/${selectedGithubRepo.id}/changes`);
  githubChangeList.replaceChildren(...(data.changes.length ? data.changes.map((change) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `task ${change.status.includes('failed') ? 'failed' : ''}`;
    button.textContent = `#${change.id} ${change.branch}: ${change.status}`;
    button.addEventListener('click', () => showGithubChange(change.id));
    item.append(button);
    return item;
  }) : [Object.assign(document.createElement('li'), {textContent: '尚无 Git 变更'})]));
}

async function showGithubChange(changeId) {
  const data = await jsonRequest(`/api/github/changes/${changeId}`);
  const change = data.change;
  githubDetails.hidden = false;
  githubActions.replaceChildren();
  const actions = [];
  if (change.status === 'ready_for_commit_approval') actions.push(['核准 Commit', 'commit']);
  if (change.status === 'committed') actions.push(['核准 Push', 'push']);
  if (['mock_pushed', 'pushed'].includes(change.status)) actions.push(['PR Dry-run', 'pr-dry']);
  if (change.status === 'mock_pushed') actions.push(['建立 Mock PR', 'pr-mock']);
  for (const [label, action] of actions) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', () => githubChangeAction(change.id, action));
    githubActions.append(button);
  }
  const audit = change.audit.map((event) => `${event.created_at} ${event.action} ${event.status}: ${event.message}`).join('\n');
  githubOutput.textContent = [
    `Change #${change.id} · ${change.branch} · status=${change.status}`,
    `base=${change.base_sha} commit=${change.commit_sha || 'Not committed'} push=${change.push_status || 'Not pushed'}`,
    change.pr_number ? `PR #${change.pr_number} ${change.pr_url}` : '',
    change.scan_output, change.diff, change.validation_output, audit,
  ].filter(Boolean).join('\n\n');
  return change;
}

async function githubChangeAction(changeId, action) {
  let endpoint = action;
  let payload = {confirm: true};
  if (action === 'commit') payload.message = `chore: apply reviewed Forge change ${changeId}`;
  if (action === 'pr-dry' || action === 'pr-mock') {
    endpoint = 'pull-request';
    payload = {confirm: true, dry_run: action === 'pr-dry', title: `Forge reviewed change ${changeId}`, body: 'Generated by the controlled Project Forge workflow. Merge is intentionally not automated.'};
  }
  try {
    const data = await jsonRequest(`/api/github/changes/${changeId}/${endpoint}`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
    });
    await showGithubChange(data.change.id);
    await loadGithubChanges();
  } catch (error) {
    log.textContent = `GitHub 操作失败：${error.message}`;
  }
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
    await Promise.all([loadProviders(), loadProjects(), loadGithubStatus(), loadGithubRepositories(), loadAutomation()]);
  } catch (error) {
    health.textContent = 'Studio API 无法连接';
    health.className = 'error';
    log.textContent = error.message;
  }
}

document.querySelector('#automation-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedProject || !selectedGithubRepo) return;
  const requirementIds = [...automationRequirements.selectedOptions].map((item) => item.value);
  const targetPaths = document.querySelector('#automation-targets').value.split(',').map((item) => item.trim()).filter(Boolean);
  const payload = {
    project_id: selectedProject.id, repo_id: selectedGithubRepo.id,
    title: document.querySelector('#automation-title').value,
    request: document.querySelector('#automation-request').value,
    requirement_ids: requirementIds, target_paths: targetPaths,
    role_providers: {planner: 1, engineer: 1, qa: 1, reviewer: 1},
    max_retries: 2, timeout_seconds: 300, token_limit: 20000,
    cost_limit_usd: 0, execution_limit: 12,
  };
  runAutomationButton.disabled = true;
  automationOutput.textContent = '受控闭环执行中；将运行真实 Task 04 Quality Gate…';
  try {
    const data = await jsonRequest('/api/automation/jobs', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
    });
    automationOutput.textContent = JSON.stringify(data.job, null, 2);
    await loadAutomation();
  } catch (error) {
    automationOutput.textContent = `安全停止：${error.message}`;
  } finally {
    runAutomationButton.disabled = false;
  }
});

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

document.querySelector('#github-repo-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedProject) return;
  const installation = document.querySelector('#github-installation').value;
  const payload = {
    project_id: selectedProject.id,
    owner: document.querySelector('#github-owner').value,
    name: document.querySelector('#github-name').value,
    base_ref: document.querySelector('#github-base-ref').value,
    base_sha: document.querySelector('#github-base-sha').value,
    default_branch: 'main',
    mode: document.querySelector('#github-mode').value,
    installation_id: installation || null,
  };
  try {
    const data = await jsonRequest('/api/github/repositories', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
    });
    await loadGithubRepositories();
    await selectGithubRepository(data.repository);
  } catch (error) {
    log.textContent = `Repository 登记失败：${error.message}`;
  }
});

document.querySelector('#github-change-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedGithubRepo) return;
  try {
    const data = await jsonRequest('/api/github/changes/prepare', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({task_id: Number(document.querySelector('#github-task-id').value), repo_id: selectedGithubRepo.id}),
    });
    await loadGithubChanges();
    await showGithubChange(data.change.id);
  } catch (error) {
    log.textContent = `Git 变更准备失败：${error.message}`;
  }
});

githubReconcileButton.addEventListener('click', async () => {
  if (!selectedGithubRepo) return;
  try {
    const data = await jsonRequest(`/api/github/repositories/${selectedGithubRepo.id}/reconcile`, {method: 'POST'});
    log.textContent = `补偿同步：发现 ${data.reconciliation.events_found}，处理 ${data.reconciliation.processed}`;
    const refreshed = await jsonRequest(`/api/github/repositories/${selectedGithubRepo.id}`);
    await selectGithubRepository(refreshed.repository);
  } catch (error) {
    log.textContent = `补偿同步失败：${error.message}`;
  }
});

document.querySelector('#github-refresh').addEventListener('click', async () => {
  await Promise.all([loadGithubStatus(), loadGithubRepositories()]);
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
  if (selectedPreview) preview.src = `${selectedPreview.preview_url}?reload=${Date.now()}`;
});
document.querySelector('#live-preview-form').addEventListener('submit', startLivePreview);
runQualityButton.addEventListener('click', runPreviewQuality);
approveGoldenButton.addEventListener('click', approveGolden);
stopLivePreviewButton.addEventListener('click', stopLivePreview);
buildButton.addEventListener('click', () => runAction('build'));
testButton.addEventListener('click', () => runAction('test'));
boot();
