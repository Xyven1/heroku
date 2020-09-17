var auth2;
const params = {
  client_id: '***REMOVED***'
}
//creates and injects script for google auth2 implementation
function createScript(){
  var gplatformScript = document.createElement('script');
  gplatformScript.setAttribute('src', 'https://apis.google.com/js/platform.js?onload=onGapiLoad');
  gplatformScript.setAttribute("async", true);
  gplatformScript.setAttribute("defer", "defer");
  gplatformScript.setAttribute("id", "auth2_script_id");
  document.head.appendChild(gplatformScript);
}
//returns promise which resolves to google oauth2 object
function getAuth(){              
  return new Promise(function (resolve, reject) {
    if(auth2) resolve(auth2)
    else {
      window.onGapiLoad = function () {
        window.gapi.load('auth2', function () {
          try {
            auth2 = window.gapi.auth2.init(params);
          } catch (err) {
            reject({
              err: 'client_id missing or is incorrect, or if you added extra params maybe they are written incorrectly, did you add it to the component or plugin?'
            })
          }
          console.log("auth intiated")
          resolve(auth2)
        })
      }
    }
  })
}

createScript()
export default getAuth(params)