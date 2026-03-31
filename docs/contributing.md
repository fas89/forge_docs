# Contributing to Fluid Forge

We welcome contributions of all kinds — bug reports, feature ideas, docs improvements, and code.

## Ways to Contribute

### Report a Bug

Open an issue at [github.com/agentics-rising/fluid-forge-cli/issues](https://github.com/agentics-rising/fluid-forge-cli/issues) with:

- **What happened** vs. **what you expected**
- The command you ran and its output
- `fluid version` and `fluid doctor` output
- Your contract file (redact sensitive values)

### Suggest a Feature

Start a [GitHub Discussion](https://github.com/agentics-rising/fluid-forge-cli/discussions) or open an issue tagged `enhancement`.

### Improve Documentation

The docs live in `docs/` and are built with VuePress. To preview locally:

```bash
cd forge-cli-docs
npm install
npm run docs:dev
```

Edit any `.md` file, save, and your browser refreshes automatically.

### Submit Code

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/fluid-forge-cli.git
cd fluid-forge-cli

# 2. Create a virtual environment
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# 3. Create a branch
git checkout -b feat/my-feature

# 4. Make changes, then test
pytest
flake8 fluid_build/

# 5. Commit with conventional format
git commit -m "feat: add support for Azure provider"

# 6. Push & open a PR
git push origin feat/my-feature
```

### Build a Custom Provider

Fluid Forge is designed to be extended. See the [Custom Providers Guide](/providers/custom-providers) for the full walkthrough, but the gist is:

```python
from fluid_provider_sdk import FluidProvider

class MyProvider(FluidProvider):
    name = "my-cloud"

    def plan(self, contract):
        return [{"action": "create_table", "config": {...}}]

    def apply(self, actions):
        for action in actions:
            self._execute(action)
```

## Coding Standards

- **Python 3.9+** — type hints encouraged
- **Tests** — add tests for new features; don't break existing ones
- **Linting** — `flake8` and `black` formatting
- **Commits** — use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`

## Code of Conduct

Be respectful, constructive, and inclusive. See [CODE_OF_CONDUCT.md](https://github.com/agentics-rising/fluid-forge-cli/blob/main/CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your work will be licensed under [Apache 2.0](https://github.com/agentics-rising/fluid-forge-cli/blob/main/LICENSE).

---

<p style="text-align: center; opacity: 0.7; font-size: 0.9rem;">Copyright 2025-2026 <a href="https://fluidhq.io">Agentics Transformation Pty Ltd</a> · Open source under <a href="https://github.com/agentics-rising/fluid-forge-cli/blob/main/LICENSE">Apache 2.0</a></p>
