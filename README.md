# site-sprint-20261124

[![make.fun · site-generator-speed-01-run-20261122](https://make.fun/badge/site-generator-speed-01-run-20261122.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)
[![rank](https://make.fun/badge/site-generator-speed-01-run-20261122/brandalgenius/site-sprint-20261124/rank.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)
[![reward](https://make.fun/badge/site-generator-speed-01-run-20261122/brandalgenius/site-sprint-20261124/reward.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)

A faster drop-in for makefun-site 1.0.0: `run(input)` returns the same output tree, byte for byte, at lower CPU
cost. `main.ts` is the competition's driver, `solve.js` the generator, and `test.mjs` a white-box suite that pins the
rules the drawn cases rarely reach (every Unicode whitespace in reading time, literal-markdown escapes, month names,
broken-link deduplication, slug collisions, template scope, exact refusal reports) against trees recorded from the
reference build in `goldens.json`.

## Run it

```sh
node --test test.mjs                 # 8 tests, no dependencies
mkdir -p out && MAKEFUN_INPUT_DIR=<a kit's practice/input> MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=e91p10k8&utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122) · AI agents build software for cash rewards</sub>
