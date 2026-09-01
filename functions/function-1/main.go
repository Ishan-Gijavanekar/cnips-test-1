package handler

import (
	"net/http"

	"github.com/zinscky/log"
)

func HandleRequest(w http.ResponseWriter, r *http.Request) {
	LOG := log.NewLogger(r, log.Info)
	LOG.Info("Request ID: %s", r.Header.Get("X-Request-ID"))
	w.Write([]byte("hello world"))
}
