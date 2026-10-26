import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--url", required=True)
parser.add_argument("--sha", required=True)
parser.add_argument("--out", type=Path, required=True)
args = parser.parse_args()
assert args.url.startswith("http://127.0.0.1:")
args.out.mkdir(parents=True, exist_ok=True)
result = {"stage": "AFTER_LOCAL", "source": args.sha, "checks": [], "console_errors": [], "page_errors": [], "failed_requests": []}

def check(name, passed, detail=None):
    result["checks"].append({"name": name, "pass": bool(passed), "detail": detail})
    if not passed:
        raise AssertionError((name, detail))

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
    context = browser.new_context(viewport={"width": 1600, "height": 1000})
    page = context.new_page()
    page.on("console", lambda msg: result["console_errors"].append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: result["page_errors"].append(str(error)))
    page.on("requestfailed", lambda request: result["failed_requests"].append({"url": request.url, "error": request.failure}))
    try:
        page.goto(args.url)
        page.wait_for_function("window.ageOfAsh?.playtestBuild?.resourceVerification === 'SHA256_MATCH_28_FILES'")
        check("exact candidate SHA", page.evaluate("ageOfAsh.playtestBuild.commit") == args.sha)
        page.locator("#setup-seed").fill("omgithub17-hero-input")
        page.locator("#btn-start").click()
        page.wait_for_function("!ageOfAsh.game.inMenu")
        hero = page.evaluate("""() => {
          const unit = ageOfAsh.game.units.find(entry => entry.alive && entry.type === 'commander');
          const point = ageOfAsh.game.screenPos(unit.x, unit.y);
          const box = document.querySelector('#game').getBoundingClientRect();
          return { id: unit.id, x: box.x + point.x, y: box.y + point.y - 18 * ageOfAsh.game.camera.zoom };
        }""")
        page.mouse.click(hero["x"], hero["y"])
        check("native pointer selects hero", page.evaluate("ageOfAsh.game.selection[0]?.id") == hero["id"])
        before = page.evaluate("() => ({x: ageOfAsh.game.hero.x, y: ageOfAsh.game.hero.y})")
        page.keyboard.press("Tab")
        check("Tab enables direct hero control", page.evaluate("ageOfAsh.game.heroControl") is True)
        page.keyboard.down("w")
        page.wait_for_timeout(450)
        page.keyboard.up("w")
        page.keyboard.press("e")
        after = page.evaluate("() => ({x: ageOfAsh.game.hero.x, y: ageOfAsh.game.hero.y, shield: ageOfAsh.game.hero.shield, shieldTime: ageOfAsh.game.hero.shieldTime})")
        check("W moves hero in direct-control mode", abs(after["x"] - before["x"]) + abs(after["y"] - before["y"]) > 0.1, {"before": before, "after": after})
        check("E activates hero Aegis", after["shield"] > 0 and after["shieldTime"] > 0, after)
        page.screenshot(path=str(args.out / "hero-control.png"))
        check("no browser errors", not result["console_errors"] and not result["page_errors"] and not result["failed_requests"])
        result["pass"] = True
    except Exception as error:
        result["pass"] = False
        result["error"] = str(error)
        page.screenshot(path=str(args.out / "failure.png"))
    finally:
        browser.close()

(args.out / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False))
raise SystemExit(not result["pass"])
