import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", required=True)
parser.add_argument("--out", type=Path, required=True)
args = parser.parse_args()
if not args.url.startswith("http://127.0.0.1:"):
    raise SystemExit("This diagnostic only accepts a task-local HTTP server")
args.out.mkdir(parents=True, exist_ok=True)

result = {"url": args.url, "actions": [], "checks": [], "console_errors": [], "page_errors": [], "failed_requests": []}


def check(name, passed, detail=None):
    result["checks"].append({"name": name, "pass": bool(passed), "detail": detail})
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
    context = browser.new_context(viewport={"width": 1600, "height": 1000})
    page = context.new_page()
    page.on("console", lambda msg: result["console_errors"].append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: result["page_errors"].append(str(error)))
    page.on("requestfailed", lambda request: result["failed_requests"].append({"url": request.url, "error": request.failure}))
    page.goto(args.url)
    page.locator("#setup-seed").fill("v230-player-feedback")
    page.locator("#btn-start").click()
    result["actions"].append("Start Game")
    page.wait_for_function("!ageOfAsh.game.inMenu")
    militia = page.evaluate("""() => {
      const unit = ageOfAsh.game.units.find(entry => entry.alive && entry.team === 'player' && entry.type === 'militia');
      const point = ageOfAsh.game.screenPos(unit.x, unit.y);
      return { x: point.x, y: point.y - 18 * ageOfAsh.game.camera.zoom };
    }""")
    page.mouse.dblclick(militia["x"], militia["y"])
    selected = page.evaluate("ageOfAsh.game.selection.map(unit => unit.type)")
    visible_militia = page.evaluate("""() => ageOfAsh.game.units.filter(unit => {
      if (!unit.alive || unit.team !== 'player' || unit.type !== 'militia') return false;
      const point = ageOfAsh.game.screenPos(unit.x, unit.y);
      return point.x >= 0 && point.x <= innerWidth && point.y >= 0 && point.y <= innerHeight;
    }).length""")
    check("native double-click selects all visible same-type units", len(selected) == visible_militia and all(item == "militia" for item in selected), {"selected": selected, "visible": visible_militia})
    result["actions"].append("Double-click militia on Canvas")

    camera_before = page.evaluate("ageOfAsh.game.camera.targetX")
    page.keyboard.down("a")
    page.wait_for_timeout(300)
    page.keyboard.up("a")
    camera_after = page.evaluate("ageOfAsh.game.camera.targetX")
    check("A pans camera while military is selected", camera_after < camera_before and page.evaluate("ageOfAsh.game.orderMode") is None, {"before": camera_before, "after": camera_after})
    page.keyboard.press("Shift+a")
    check("Shift+A arms Attack-Move", page.evaluate("ageOfAsh.game.orderMode") == "attackMove")
    page.keyboard.press("Escape")
    result["actions"].append("Hold A to pan, then press Shift+A")

    barracks = page.evaluate("""() => {
      const building = ageOfAsh.game.buildings.find(entry => entry.alive && entry.team === 'player' && entry.type === 'barracks');
      const point = ageOfAsh.game.screenPos(building.x + building.w / 2, building.y + building.h / 2);
      return { id: building.id, x: point.x, y: point.y, centerX: building.x + building.w / 2, centerY: building.y + building.h / 2 };
    }""")
    page.mouse.click(barracks["x"], barracks["y"])
    check("native click selects barracks", page.evaluate("ageOfAsh.game.selection[0]?.id") == barracks["id"])
    rally = page.evaluate("""() => {
      const building = ageOfAsh.game.selection[0];
      const point = ageOfAsh.game.screenPos(building.x - 6, building.y + building.h / 2);
      return { worldX: building.x - 6, worldY: building.y + building.h / 2, x: point.x, y: point.y };
    }""")
    page.mouse.click(rally["x"], rally["y"], button="right")
    check("native right-click sets Rally Point", page.evaluate("!!ageOfAsh.game.selection[0]?.rally"), page.evaluate("ageOfAsh.game.selection[0]?.rally"))
    known_ids = page.evaluate("ageOfAsh.game.units.map(unit => unit.id)")
    page.locator('[data-command="train:militia"]').click()
    page.wait_for_function("ids => ageOfAsh.game.units.some(unit => unit.type === 'militia' && !ids.includes(unit.id))", arg=known_ids, timeout=15000)
    newborn = page.evaluate("""ids => {
      const unit = ageOfAsh.game.units.find(entry => entry.type === 'militia' && !ids.includes(entry.id));
      const building = ageOfAsh.game.buildings.find(entry => entry.id === ageOfAsh.game.selection[0]?.id);
      const rally = building.rally, cx = building.x + building.w / 2, cy = building.y + building.h / 2;
      return { id: unit.id, x: unit.x, y: unit.y, dot: (unit.x - cx) * (rally.x - cx) + (unit.y - cy) * (rally.y - cy), target: unit.targetPos };
    }""", known_ids)
    check("newborn exits on Rally-facing side", newborn["dot"] > 0, newborn)
    result["actions"].append("Select barracks, set Rally Point, train militia")

    page.evaluate("""async () => {
      const { BOONS } = await import('./js/data.js');
      const boon = BOONS.find(entry => entry.id === 'rift_prototype');
      ageOfAsh.game.phase = 'boon';
      ageOfAsh.ui.showBoons([boon], choice => ageOfAsh.game.chooseBoon(choice));
    }""")
    page.locator(".boon-card").click()
    page.locator("#btn-claim").click()
    result["actions"].append("Select and claim Rift Prototype through boon UI")
    page.wait_for_timeout(1500)
    result["prototype"] = page.evaluate("""() => {
      const unit = ageOfAsh.game.units.find(entry => entry.type === 'prototype');
      return unit && { id: unit.id, alive: unit.alive, x: unit.x, y: unit.y, hp: unit.hp, state: unit.state };
    }""")
    result["phase"] = page.evaluate("ageOfAsh.game.phase")
    check("Rift Prototype boon stays playable", bool(result["prototype"] and result["prototype"]["alive"]), result["prototype"])
    page.screenshot(path=str(args.out / "rift-prototype.png"))
    browser.close()

result["pass"] = bool(all(item["pass"] for item in result["checks"]) and not result["console_errors"] and not result["page_errors"] and not result["failed_requests"])
(args.out / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False))
