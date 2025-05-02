class Scrapper {

    /**
     * Search the current page params 
     * @returns Object
    */
    static get_window_params(){
        let results = {};

        const window_params = new URLSearchParams(window.location.search);
        window_params.forEach((value, key) => {
            results[key] = value; 
        });

        return results
    }

}




/**
 * Simplifica un JSON de estructura SCORM, extrayendo solo datos esenciales.
 * @param {Object} jsonData - JSON original (con scenes, slides, etc.).
 * @returns {Object} JSON limpio con solo id, lmsId, y slides procesadas.
 */
function simplify_json(data) {
    return {
        scenes: (data.scenes || []).map(scene => ({
            id: scene.id,
            lmsId: scene.lmsId || "", // Valor por defecto si no existe
            slides: (scene.slides || [])
                .filter(slide => slide.html5url) // Filtramos slides con html5url
                .map(slide => ({
                    id: slide.id,
                    html5url: slide.html5url,
                    title: slide.title || "" // Valor por defecto para título
                }))
        }))
    };
}


/**
 * Finds case specific strings being badly escaped, and corrects them
 * 
 * @param {string} text 
 */
function remove_bad_escaping(text){
    
    text = text.replaceAll("\\'", "'")
    text = text.replaceAll("\\\\\"", "\\\"")

    return text;
}


//loadSco loads a file that contains the desired data ID in the plugin file
async function get_loadSCO_dataID(a_param, scoid_param){

    const res = await fetch(chrome.runtime.getURL("./urls.json"))
    const private_urls = await res.json();
    const loadSCO = private_urls.url_loadSCO;
    
    loadSCO = loadSCO.concat("a=", a_param, "&", "scoid=",scoid_param);
    let page = await res.text();
    
    //from the loaded res.txt, search all the string for the id
    const data_id = page.slice(
        page.indexOf(".php/") + 5 , //account the five characters
        page.indexOf("/mod") 
    )
    
    return data_id
}


async function get_file_via_pluginfile(data_id, file_url){
    
    //get the normal course identifiers
    let identifiers = Scrapper.get_window_params();
    //get the data id, corresponding to the data files of the course
    const data_id = await get_loadSCO_dataID(loadSCO, identifiers.a, identifiers.scoid);
  
    //get private url
    const res = await fetch(chrome.runtime.getURL("./urls.json"))
    const private_urls = await res.json();
    let pluginfile = private_urls.url_pluginfile;
    
    pluginfile = pluginfile.concat(data_id, "/mod_scorm/content/5/", file_url);
    
    //fetch plugin file
    const response = await fetch(url);

    return await response.text(); 
}


async function get_course_data_js(){
  
    let response = await get_file_via_pluginfile(data_id, "html5/data/js/data.js");
    
    return response
}


const begin = async () => {

    let text = await get_course_data_js()

    // Remove javascript code from the text    
    text = text.replace("window.globalProvideData('data', '","");
    text = text.replace("');","");

    
    // remove bad escape characters
    let corrected_text = remove_bad_escaping(text);

    //convert to json
    let json = JSON.parse(corrected_text);

    //get the requierd or wanted data (currently only scenes are retrieved)
    let simplified_json = simplify_json(json);
    simplified_json = simplified_json.scenes;
    
    console.log(simplified_json);
    console.log(simplified_json[3].slides[0].html5url);

}




begin();



// fetch("/html5/data/js/5hfZTtoNyJQ.js", { credentials: 'include' })
//   .then(response => response.text())
//   .then(jsContent => {
//     const match = jsContent.match(/window\.globalProvideData\s*=\s*({.*?});/s);
//     if (match) {
//       const jsonData = JSON.parse(match[1]);
//       chrome.runtime.sendMessage({ type: "SCORM_DATA", data: jsonData });
//     }
//   })
//   .catch(error => console.error("Error:", error));