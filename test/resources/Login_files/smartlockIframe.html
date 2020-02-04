<!DOCTYPE html>
<!-- saved from url=(0175)https://www.paypalobjects.com/unifiedlogin/smartlockIframe.html?method=hintsAvailable&mode=web&clientId=76862753678-9l8i0gh7kv9mi12drrka4pj54ee2rj9v.apps.googleusercontent.com -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <script>
        function loadSL() {
            var clientId, method, credentialOptions, renderMode;
            var Constants = {
                smartlock: 'smartlock',
                methods: {
                    hint: 'hint',
                    hintsAvailable: 'hintsAvailable'
                }
            };
            function getKey(key) {
                var regexS = '[\\?&]'+ key +'=([^&#]*)';
                var regex = new RegExp( regexS );
                var results = regex.exec(window.location.href);
                return results !== null ? results[1] : '';
            };
            clientId = getKey('clientId');
            method = getKey('method');
            credentialOptions = {
                supportedAuthMethods: ['https://accounts.google.com'],
                supportedIdTokenProviders: [{
                    uri: 'https://accounts.google.com',
                    clientId: clientId
                }]
            };
            if (!window.openyolo) {
                handleError({
                    type: 'openyolo not available'
                }, getKey('method'));
            }
            renderMode = (getKey('mode') === 'mobile') ? 'bottomSheet' : 'navPopout';
            openyolo.setRenderMode(renderMode);
            function handleHintResult(credential) {
                if (credential && credential.idToken) {
                    window.parent.postMessage(JSON.stringify({
                        source: Constants.smartlock,
                        method: Constants.methods.hint,
                        idToken: credential.idToken
                    }), '*');
                } else {
                    handleError({
                        type:'id_token absent'
                    }, Constants.methods.hint);
                }
            }
            function handleHintAvailableResult(exists) {
                var sessionExists = exists ? 'true' : 'false';
                window.parent.postMessage(JSON.stringify({
                    source: Constants.smartlock,
                    method: Constants.methods.hintsAvailable,
                    sessionExists: sessionExists
                }), '*');
            }
            function handleError(error, eventName) {
                var postMsgPayload = {
                    source: Constants.smartlock,
                    method: eventName,
                    error: error && typeof error.type === 'string' ? error.type : 'Call failed due to exception'
                };
                window.parent.postMessage(JSON.stringify(postMsgPayload), '*');
            }
            if (!window.smartlock) {
                handleError({
                    type: 'smartlock API failed to load'
                }, getKey('method'));
            }
            if (method === 'hintsAvailable') {
                smartlock.hintsAvailable(credentialOptions).then(handleHintAvailableResult).catch(function(err) {
                    handleError(err, Constants.methods.hintsAvailable);
                });
            }
            if (method === 'hint') {
                smartlock.hint(credentialOptions).then(handleHintResult).catch(function(err) {
                    handleError(err, Constants.methods.hint);
                });
            }
        
        }
    </script>
</head><body>
<script src="./client" onload="loadSL()"></script>



<iframe src="./request.html" hidden="" style="border: none; position: fixed; z-index: 9999; display: none;"></iframe></body></html>