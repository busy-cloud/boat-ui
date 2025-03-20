package boatUi

import (
  "embed"
  "github.com/busy-cloud/boat/web"
)

//go:embed dist/browser
var www embed.FS

func init() {
  web.StaticFS(www, "/", "dist/browser", "index.html")
}
