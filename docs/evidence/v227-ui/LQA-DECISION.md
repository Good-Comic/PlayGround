# Start Game is required English

Read-only verified Issue14 §3.2 and Issue17 explicitly require visible Start Game and #btn-start unchanged in every locale. It is BY_DESIGN, not a translation defect. No DOM replacement or locale start-label changes made. Fourlocale native browser checks at1920×1080 and1280×720/130percent text pass. New settings labels use existing resources; existing translated titles preserved. Native-language fullLQA remains pending.

Initial browser harness had a malformed evaluate selector string (SyntaxError in test expression, no pageerror); fixed only harness, same exactapp e2db117 retested, failure retained. One initial builder invocation used HEAD instead of fullSHA and was correctly rejected before output creation; rebuilt using resolved fullSHA. No integrity check weakened.
