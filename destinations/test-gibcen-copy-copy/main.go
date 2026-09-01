
package main

import (
	"github.com/zinscky/log"
)

func Setup(config map[string]string, log *log.Logger) error { /* optional */
        //setup connection
	return nil
}

func Teardown(config map[string]string, log *log.Logger) error {/* optional */
        //teardown connection
	return nil
}

func Execute(config map[string]string, event string, vars map[string]string, log *log.Logger) (map[string]string, error) {/* required */
        //send to destination.
	return vars, nil
}
