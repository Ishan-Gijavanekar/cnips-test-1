
package main

import (
	"strings"
	"encoding/json"
	"github.com/zinscky/log"
)

// this can be defined by you based
// on your event structure
type Event struct {
	Message       string
	Count int
}

// Run function parameters
//
//  1. config - key value pair configured in the transformation
//  2. event - your event data as json string. you need to manualy 
//             unmarshal it into appropriate struct.
//  3. vars - these are global variable and can be accessed by all 
//            transformations/destination in the given pipeline.
//  4. log - the thread safe logger. log.Info, log.Debug, log.Warn, log.Error.
//
// Returns
//
//  1. the modified event. pipeline will fail if it is not returned.
//  2. vars - the global pariable passed in this fuction.
//  3. error

func Run(
	config map[string]string,
	event string,
	vars map[string]string,
	log *log.Logger,
) (string, map[string]string, error) {
	myEvent := &Event{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return event, vars, err
	}
	myEvent.Message = strings.ToUpper(myEvent.Message)
	log.Info("Inside UpperCase.")
	log.Info("incoming event %v", myEvent)
	e, _ := json.Marshal(myEvent)
	return string(e), vars, nil
}


