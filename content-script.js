class Scrapper {

    /** Error flags */
    static err = {
        http: "[SCRAPPER] http error:",
        fetch: "[SCRAPPER] fetch error",
        param: "[SCRAPPER] bad function params error"
    }

    /** flag to mark what return type you want from the fetcher */
    static r_type = {
        json: 1,
        text: 0
    }

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

    /**
     * Fetch an array of urls, and return them resolved 
     * returns a promise with an array of the responses of the given urls array
     * 
     * @param {Array} urls Array of urls (a string will be converted to array)
     * @param {Scrapper.r_type} response_mode
     * 
     * @return {Promise}
     */
    static async fetcher(urls, response_mode){
        try{
            //Make sure the urls are always an array
            if( !Array.isArray(urls) ){ urls = [urls] } 
            //store all promises given by the map and wait until resolved
            //these include the fetch and .then

            const data = await Promise.all(
                urls.map( async url => { // might be slower using async instead of .then, but worth the legibility
                    
                    const res = await fetch(url)
                    if(!res.ok){ throw new Error(`${Scrapper.err.http} ${url} STATUS: ${res.status}`)}
                    
                    // Return the request body in the format specified
                    switch(response_mode){
                        case Scrapper.r_type.json: return res.json();
                        case Scrapper.r_type.text: return res.text();
                        default: throw Scrapper.err.param;
                    }
                })
            );

            return data;
        
        } catch (error){
            console.error(error);
            throw error //? delegate, should i keep this?

        }
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


function correct_text_to_json(text){
    
    let data = text;
    // Remove javascript code from the text    
    data = data.replace("window.globalProvideData('data', '","");
    data = data.replace("');","");

    // remove bad escape characters
    data = remove_bad_escaping(data);
    
    //convert to json
    let ttj = JSON.parse(data);

    return ttj
}


//loadSco loads a file that contains the desired data ID in the plugin file
async function get_loadSCO_dataID(a_param, scoid_param){

    //get private url
    let loadSCO = private_urls.loadSCO;
    
    loadSCO = loadSCO.concat("a=", a_param, "&", "scoid=",scoid_param);
    
    const response = await fetch(loadSCO)
    let page = await response.text();
    
    //from the loaded response.txt, search all the string for the id
    const data_id = page.slice(
        page.indexOf(".php/") + 5 , //account the five characters
        page.indexOf("/mod") 
    )
    
    return data_id
}


async function get_file_via_pluginfile(file_url){
    
    //get the normal course identifiers
    let identifiers = Scrapper.get_window_params();
    //get the data id, corresponding to the data files of the course
    const data_id = await get_loadSCO_dataID(identifiers.a, identifiers.scoid);
  
    //get private url
    let pluginfile = private_urls.pluginfile;
    pluginfile = pluginfile.concat(data_id, "/mod_scorm/content/5/", file_url);

    //fetch plugin file
    return Scrapper.fetcher(pluginfile, Scrapper.r_type.text);
}


const begin = async () => {

    let data_js = await get_file_via_pluginfile("html5/data/js/data.js");
    let text = data_js[0]

    let json = correct_text_to_json(text);

    //get the requierd or wanted data (currently only scenes are retrieved)
    let simplified_json = simplify_json(json);
    simplified_json = simplified_json.scenes;
    
    console.log(simplified_json);
    console.log(simplified_json[5].slides[0].html5url);


    get_file_via_pluginfile(simplified_json[5].slides[0].html5url);

}


const loadData = async () =>{
    const res = await fetch(chrome.runtime.getURL("private.json"))
    const data = await res.json();

    private_urls = data // set the script global request url to the external file urls


    begin();

}


let private_urls = {}

loadData();
