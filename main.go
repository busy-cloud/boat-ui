package boatUi

import (
  "embed"
  "github.com/busy-cloud/boat/web"
)

//go:embed dist/boat-ui/browser
var www embed.FS

func init() {
  web.StaticFS(www, "/", "dist/boat-ui/browser", "index.html")
}
