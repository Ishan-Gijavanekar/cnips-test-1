
package main

import (
	"encoding/json"

	"github.com/hashicorp/go-plugin"
	"github.com/zinscky/shared"
)

// You can define your own struct based on what
// event data you are expecting.
type MyEvent struct {
	Sub       string
	Processed bool  
}

// Here is a real implementation of Destination
type DestinationImpl struct{}

// Write your implementation here. The args paramter is a struct which contains the following
//
//	type Args struct {
//		Event string //json string which you can unmarshal into your own struct
//		Config map[string]string //key/value configuration that you added when creating a new transformation
//		Log log.Logger //logger instance. Basic methods are provided. Debug, Info, Warn and Error
//	}
func (t *DestinationImpl) Execute(args shared.Args) (shared.Args, error) {
	args.Log.Info("incoming event %s", args.Event)
	if args.Event == "" {
		return args, fmt.Errorf("nil event")
	}
	// Unmarshal event json into your own type
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(args.Event), myEvent)
	if err != nil {
		return args, err
	}
	// Send to destination

	// always return the args
	return args, nil
}

// DO NOT EDIT BELOW CODE
var handshakeConfig = plugin.HandshakeConfig{
	ProtocolVersion:  1,
	MagicCookieKey:   "BASIC_PLUGIN",
	MagicCookieValue: "hello",
}

func main() {
	runner := &DestinationImpl{}
	var pluginMap = map[string]plugin.Plugin{
		"{{runner}}": &shared.DestinationPlugin{Impl: runner},
	}
	plugin.Serve(&plugin.ServeConfig{
		HandshakeConfig: handshakeConfig,
		Plugins:         pluginMap,
	})
}

