

	package main

	import (
		"encoding/json"
		"github.com/hashicorp/go-plugin"
		"github.com/zinscky/shared"
	)
	
	type MyData struct {
		Sub string
		CharCount int
	}
	
	// Here is a real implementation of Extractor
	type ExtractorImpl struct{}
	
	// Write your implementation here. The args paramter is a struct which contains the following
	//
	//	type Args struct {
	//		Config map[string]string //key/value configuration that you added when creating a new transformation
	//		Log log.Logger //logger instance. Basic methods are provided. Debug, Info, Warn and Error
	//		Data string // your extracted data as a json string
	//	}
	func (ex *ExtractorImpl) Execute(args shared.ExtractorArgs) (shared.ExtractorArgs, error) {
		args.Log.Info("executing extractor")
	
		// Extract your data. make sure your data is in the form of a slice/array
		myData := []interface{}{}
		myData = append(myData, MyData{Sub: "abc"})
		myData = append(myData, MyData{Sub: "abcd"})
		// Convert your data into json string and Assign to argument data
		data, err := json.Marshal(myData)
		if err != nil {
			return args, err
		}
		args.Data = string(data)
	
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
		runner := &ExtractorImpl{}
		var pluginMap = map[string]plugin.Plugin{
			"{{runner}}": &shared.ExtractorPlugin{Impl: runner},
		}
		plugin.Serve(&plugin.ServeConfig{
			HandshakeConfig: handshakeConfig,
			Plugins:         pluginMap,
		})
	}
	