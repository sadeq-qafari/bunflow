# Flow standalone edition

This source package contains the existing Vue/Quasar panel and a compact Bun + SQLite backend.

For the complete Persian user manual, see [راهنمای کامل کاربری فارسی](docs/user-manual-fa.md).

See [standalone/README.md](standalone/README.md) for running, building, API transfers, and compatibility limits.

The original Flow repository is https://github.com/sadeq-qafari/Flow. To apply these changes there, copy `standalone/` and the modified panel files into a checkout. The old services can remain alongside the standalone edition.

Builds on `main` produce Windows and Linux executables under the repository Actions run artifacts. Push a version tag such as `v1.0.0` to attach both executables to a GitHub Release. See [standalone/README.md](standalone/README.md) for build details.
