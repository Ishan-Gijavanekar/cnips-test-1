
package main

import (
	"encoding/json"
	"fmt"
	"github.com/pkg/errors"
	"github.com/zinscky/log"
	"io"
	"net/http"
	"net/url"
	"time"
)

// this can be defined by you based
// on your event structure
type CreateAppResponse struct {
	Data    AppInfo `json:"data"`
	Status  int64   `json:"status"`
	Success bool    `json:"success"`
}

type Event struct {
	AppId          string
	Processed      bool
	Token          string
	//RequestAppInfo RequestAppInfo
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

type DestinationEvent struct {
	AccessToken string  `json:"access_token,omitempty"`
	AppInfo     AppInfo `json:"appInfo,omitempty"`
	appId       string  `json:"sub,omitempty"`
}

type AppInfo struct {
	ID                            string        `json:"_id,omitempty"`
	ClientID                      string        `json:"client_id,omitempty"`
	ClientSecret                  string        `json:"client_secret,omitempty"`
	ApplicationType               string        `json:"application_type,omitempty"`
	RedirectUris                  []interface{} `json:"redirect_uris,omitempty"`
	ResponseTypes                 []string      `json:"response_types,omitempty"`
	GrantTypes                    []string      `json:"grant_types,omitempty"`
	ClientName                    string        `json:"client_name,omitempty"`
	ClientDisplayName             string        `json:"client_display_name,omitempty"`
	PolicyURI                     string        `json:"policy_uri,omitempty"`
	TosURI                        string        `json:"tos_uri,omitempty"`
	DefaultMaxAge                 int           `json:"default_max_age,omitempty"`
	TokenLifetimeInSeconds        int           `json:"token_lifetime_in_seconds,omitempty"`
	IDTokenLifetimeInSeconds      int           `json:"id_token_lifetime_in_seconds,omitempty"`
	RefreshTokenLifetimeInSeconds int           `json:"refresh_token_lifetime_in_seconds,omitempty"`
	Contacts                      interface{}   `json:"contacts,omitempty"`
	RequestUris                   interface{}   `json:"request_uris,omitempty"`
	TokenEndpointAuthMethod       string        `json:"token_endpoint_auth_method,omitempty"`
	TokenEndpointAuthSigningAlg   string        `json:"token_endpoint_auth_signing_alg,omitempty"`
	DefaultAcrValues              interface{}   `json:"default_acr_values,omitempty"`
	//HTTPSCrmsNetidDePropertiesActive bool          `json:"https://crms.netid.de/properties/active,omitempty"`
	Editable                bool          `json:"editable,omitempty"`
	ClientType              string        `json:"client_type,omitempty"`
	CompanyAddress          string        `json:"company_address,omitempty"`
	CompanyName             string        `json:"company_name,omitempty"`
	CompanyWebsite          string        `json:"company_website,omitempty"`
	Description             string        `json:"description,omitempty"`
	AllowedWebOrigins       []interface{} `json:"allowed_web_origins,omitempty"`
	WebMessageUris          interface{}   `json:"web_message_uris,omitempty"`
	AllowedLogoutUrls       []interface{} `json:"allowed_logout_urls,omitempty"`
	AllowedOrigins          []interface{} `json:"allowed_origins,omitempty"`
	LoginProviders          []interface{} `json:"login_providers,omitempty"`
	SocialProviders         interface{}   `json:"social_providers,omitempty"`
	CustomProviders         interface{}   `json:"custom_providers,omitempty"`
	SamlProviders           interface{}   `json:"saml_providers,omitempty"`
	AdProviders             interface{}   `json:"ad_providers,omitempty"`
	AllowedScopes           []string      `json:"allowed_scopes,omitempty"`
	DefaultScopes           interface{}   `json:"default_scopes,omitempty"`
	PendingScopes           interface{}   `json:"pending_scopes,omitempty"`
	AppOwner                string        `json:"app_owner,omitempty"`
	AllowedGroups           interface{}   `json:"allowed_groups,omitempty"`
	OperationsAllowedGroups interface{}   `json:"operations_allowed_groups,omitempty"`
	Deleted                 bool          `json:"deleted,omitempty"`
	Enabled                 bool          `json:"enabled,omitempty"`
	HostedPageGroup         string        `json:"hosted_page_group,omitempty"`
	AppKey                  struct {
		ID           string `json:"_id,omitempty"`
		ClassName    string `json:"class_name,omitempty"`
		KeyType      string `json:"keyType,omitempty"`
		KeyLen       int    `json:"keyLen,omitempty"`
		PublicKey    string `json:"publicKey,omitempty"`
		PublicKeyJWK struct {
			Kid string `json:"kid,omitempty"`
			Kty string `json:"kty,omitempty"`
			Alg string `json:"alg,omitempty"`
			Use string `json:"use,omitempty"`
			N   string `json:"n,omitempty"`
			E   string `json:"e,omitempty"`
		} `json:"publicKeyJWK,omitempty"`
		PrivateKeyJWK struct {
		} `json:"privateKeyJWK,omitempty"`
	} `json:"appKey,omitempty"`
	AlwaysAskMfa                 bool        `json:"always_ask_mfa,omitempty"`
	AutoLoginAfterRegister       bool        `json:"auto_login_after_register,omitempty"`
	AllowLoginWith               []string    `json:"allow_login_with,omitempty"`
	RegisterWithLoginInformation bool        `json:"register_with_login_information,omitempty"`
	FdsEnabled                   bool        `json:"fds_enabled,omitempty"`
	EnablePasswordlessAuth       bool        `json:"enable_passwordless_auth,omitempty"`
	EnableDeduplication          bool        `json:"enable_deduplication,omitempty"`
	AllowedMfa                   interface{} `json:"allowed_mfa,omitempty"`
	CaptchaRefs                  interface{} `json:"captcha_refs,omitempty"`
	ConsentRefs                  interface{} `json:"consent_refs,omitempty"`
	EmailVerificationRequired    bool        `json:"email_verification_required,omitempty"`
	AllowedRoles                 interface{} `json:"allowed_roles,omitempty"`
	DefaultRoles                 interface{} `json:"default_roles,omitempty"`
	EnableClassicalProvider      bool        `json:"enable_classical_provider,omitempty"`
	IsHybridApp                  bool        `json:"is_hybrid_app,omitempty"`
	IsRememberMeSelected         bool        `json:"is_remember_me_selected,omitempty"`
	TemplateGroupID              string      `json:"template_group_id,omitempty"`
	SuggestMfa                   interface{} `json:"suggest_mfa,omitempty"`
	BotProvider                  string      `json:"bot_provider,omitempty"`
	AllowGuestLogin              bool        `json:"allow_guest_login,omitempty"`
	AllowGuestLoginGroups        interface{} `json:"allow_guest_login_groups,omitempty"`
	PrimaryColor                 string      `json:"primaryColor,omitempty"`
	AccentColor                  string      `json:"accentColor,omitempty"`
	ContentAlign                 string      `json:"contentAlign,omitempty"`
	MediaType                    string      `json:"mediaType,omitempty"`
	GroupIds                     interface{} `json:"groupIds,omitempty"`
	CreatedTime                  time.Time   `json:"createdTime,omitempty"`
	UpdatedTime                  time.Time   `json:"updatedTime,omitempty"`
	PostLogoutRedirectUris       interface{} `json:"post_logout_redirect_uris,omitempty"`
	LogoAlign                    string      `json:"logoAlign,omitempty"`
	Mfa                          struct {
		Setting        string      `json:"setting,omitempty"`
		AllowedMethods interface{} `json:"allowed_methods,omitempty"`
	} `json:"mfa"`
	Webfinger      string `json:"webfinger,omitempty"`
	MobileSettings struct {
	} `json:"mobile_settings,omitempty"`
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

func Run(config map[string]string, event string, vars map[string]string, log *log.Logger) (string, map[string]string, error) {
	baseUrl := config["base_url"]
	clientId := config["client_id"]
	clientSecret := config["client_secret"]
	log.Debug("")
	//1. Unmarshal Incoming event
	var incomingEvent Event
	err := json.Unmarshal([]byte(event), &incomingEvent)
	if err != nil {
		return "", nil, fmt.Errorf("failed to unmarshal incoming event body: %v", err)
	}
	log.Debug("incomingEvent: ", incomingEvent)
	//fmt.Println("incoming Event: ", incomingEvent)
	token, err := GenerateToken(baseUrl, clientId, clientSecret)
	if err != nil {
		//fmt.Println("error generating token: ", err)
		return "", nil, fmt.Errorf("error generating token: %v", err)
	}
	incomingEvent.Token = token
	appResp, err := GetAppInfo(baseUrl, incomingEvent.AppId, token)
	if err != nil {
		log.Debug(fmt.Sprintf("error getting app: %v ", err))
		return "", nil, fmt.Errorf("error getting app: %v", err)
	}
	log.Debug(fmt.Sprintf("created app response: %v ", appResp))
	destinationEvent := DestinationEvent{
		AccessToken: token,
		AppInfo:     appResp.Data,
		appId:       appResp.Data.ID,
	}
	jsonData, err := json.Marshal(destinationEvent)
	if err != nil {
		log.Debug("error marshaling AppInfo response to JSON: %v", err)
	}
	fmt.Println(destinationEvent)
	return string(jsonData), vars, nil
}

func GetAppInfo(baseURL, appId, token string) (*CreateAppResponse, error) {
	apiURL, _ := url.JoinPath(baseURL, "apps-srv", "clients", appId)
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		fmt.Println("Error creating read app request:", err)
		return nil, errors.Errorf("error creating read app request %s - error %s", apiURL, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	// Create an HTTP client
	client := &http.Client{}

	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Errorf("error making read app request %s - error %s", apiURL, err)
	}
	defer resp.Body.Close()
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		fmt.Println("error unmarshalling app response", resp.StatusCode)

		return nil, errors.Errorf("non success status from api %s - status code is %s", apiURL, resp.Status)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("error parsing read app response body for api:", err)
		return nil, errors.Errorf("error parsing read app response body for api %s - (%v)", apiURL, err)
	}
	var appResponse CreateAppResponse
	err = json.Unmarshal(body, &appResponse)
	if err != nil {
		fmt.Println("error unmarshalling app response", err)
		return nil, errors.Errorf("error unmarshalling response body for api %s - (%v)", apiURL, err)
	}
	fmt.Println("App Response: ", appResponse)
	return &appResponse, nil
}

func GenerateToken(baseUrl, clientId, clientSecret string) (string, error) {
	tokenReq := url.Values{
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"grant_type":    []string{"client_credentials"},
	}
	tokenURL, _ := url.JoinPath(baseUrl, "token-srv", "token")
	//resp, err := httpclient.PostForm(tokenURL, tokenReq)
	resp, err := http.PostForm(tokenURL, tokenReq)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		return "", errors.Errorf("non success status code from token api - status code is (%s)", resp.Status)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("error parsing response body for api:", err)
		return "", errors.Errorf("error parsing response body for api %s - (%v)", tokenURL, err)
	}
	var tokenResponse TokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return "", errors.Errorf("error unmarshalling response body for api %s - (%v)", tokenURL, err)

	}
	return tokenResponse.AccessToken, nil
}


