const health = document.querySelector('#health');
const list = document.querySelector('#project-list');
const empty = document.querySelector('#empty');
const log = document.querySelector('#log');

async function loadProjects() {
  const response = await fetch('/api/projects');
  const data = await response.json();
  list.replaceChildren(...data.projects.map((project) => {
    const item = document.createElement('li');
    item.textContent = `${project.name} — ${project.relative_path}`;
    return item;
  }));
  empty.hidden = data.projects.length > 0;
}

async function boot() {
  try {
    const response = await fetch('/health');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
  const response = await fetch('/api/projects/import-local', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({path}),
  });
  const data = await response.json();
  log.textContent = response.ok ? `已导入 ${data.project.relative_path}` : `导入失败：${data.error}`;
  if (response.ok) await loadProjects();
});

boot();
