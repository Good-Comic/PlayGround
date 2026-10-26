"""Exact authorizedpublicv228; connect to task-scoped strict-TLSChromium, inheritedproxy unchanged."""
TARGET='https://good-comic.github.io/PlayGround/builds/ab56a5b824fabc5e123cf33e912d11bd3c625911/'
BUILD='ab56a5b824fabc5e123cf33e912d11bd3c625911'
def require_url(url):assert url.rstrip('/')==TARGET.rstrip('/'),'Only authorizedpublicv228 is permitted'
def connect_browser(pw):return pw.chromium.connect_over_cdp('http://127.0.0.1:9229')
