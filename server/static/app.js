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
let selectedProject = null;

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
  await Promise.all([loadFiles(), loadRuns()]);
}

async function loadFiles() {
  const data = await jsonRequest(`/api/projects/${selectedProject.id}/files`);
  fileList.replaceChildren(...data.files.map((file) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'file-button';
    button.textContent = `${file.path} (${file.size} B)`;
    button.addEventListener('click', () => viewFile(file.path));
    item.append(button);
    return item;
  }));
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
    await loadProjects();
  } catch (error) {
    health.textContent = 'Studio API 无法连接';
    health.className = 'error';
    log.textContent = error.message;
  }
}

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
