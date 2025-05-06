class Scrapper {
    /** Error flags */
    static err = {
        http: "[SCRAPPER] http error:",
        fetch: "[SCRAPPER] fetch error",
        param: "[SCRAPPER] bad function params error",
        r_type: "[SCRAPPER] unknown r_type",
        url_type: "[SCRAPPER] bad url type" 

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
     * @param {Array} urls Array of urls
     * @param {Scrapper.r_type} response_mode
     * 
     * @return {Promise}
     */
    static async array_fetch(urls, response_mode){
        try{
            //Make sure the urls are always an array
            if( !Array.isArray(urls) ){ throw Error(Scrapper.err.url_type) } 
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
                        default: throw Scrapper.err.r_type;
                    }
                })
            );

            return data;
        
        } catch (error){
            console.error(error);
            throw error //? delegate, should i keep this?

        }
    }


    /**
     * Fetch a single url 
     * returns a promise with the response of the fetched url
     * 
     * @param {string} url The url as a string to fetch
     * @param {Scrapper.r_type} response_mode Scrapper.err value
     * 
     * @return {Promise}
     */
    static async str_fetch(url, response_mode){
        //wrapper function of array_fetch, just to return the first index

        if(typeof url !== "string"){ throw Error(Scrapper.err.url_type) }

        let result = await Scrapper.array_fetch([url], response_mode);
    
        return result[0] //as array fetch returns an array, just give the first index.
    
    }


}


class Scorm_parser {
        
    /**
     * Remove javascript code from the text  
    */ 
    static remove_js(text){

        // ! REMEMBER: replace doesnt throw errors, if the string isnt found, it wont replace anything.
        // case 1, its a data file
        text = text.replace("window.globalProvideData('data', '", "");
        // case 2, its a slides file
        text = text.replace("window.globalProvideData('slide', '", "");
        
        text = text.replace("');","");

        return text
    }


    /**
     * Finds specific strings being badly escaped, and corrects them
     * 
     * @param {string} text 
     */
    static remove_bad_escaping(text){
        
        text = text.replaceAll("\\'", "'")
        text = text.replaceAll("\\\\\"", "\\\"")

        return text;
    }



    /**
     * Simplifica un JSON de estructura SCORM, extrayendo solo datos esenciales.
     * @param {Object} jsonData - JSON original (con scenes, slides, etc.).
     * @returns {Object} JSON limpio con solo id, lmsId, y slides procesadas.
     */
    static get_scenes(data) {
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
     * 
     * @param {string} text 
     * @returns correct format json
     */
    static cleanse(text){
        text = Scorm_parser.remove_js(text);
        text = Scorm_parser.remove_bad_escaping(text);

        return text
    }


    static toJson(text){
        //convert to json
        return JSON.parse(text);

    }

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


/**
 * Fetch a url or an array of urls. 
 * 
 * @param {string|string[]} urls The url or array of urls to request inside the pluginfile api
 * @param {"json"|"text"} response_mode The response you expect, a json or plain text
 * @returns file in the requested format
 */
async function get_file_via_pluginfile(urls, response_mode){


    //get the normal course identifiers
    let identifiers = Scrapper.get_window_params();
    //get the data id, corresponding to the data files of the course
    const data_id = await get_loadSCO_dataID(identifiers.a, identifiers.scoid);
  
    let pluginfile_url = private_urls.pluginfile;
    pluginfile_url = pluginfile_url.concat(data_id, "/mod_scorm/content/5/");
    let req_url = "";

    // parameter is a single url 
    if( typeof urls === "string" ){
        //add final data to the req url 
        req_url = pluginfile_url.concat(urls)        
    
        switch(response_mode){
            case "json": return await Scrapper.str_fetch(req_url, Scrapper.r_type.json);
            case "text": return await Scrapper.str_fetch(req_url, Scrapper.r_type.text);
        }
    
    }

    if( Array.isArray(urls) ){

        //map array and concat the pluginfile base url
        req_url = urls.map((url) => {
            return pluginfile_url.concat(url);
        });

        switch(response_mode){
            case "json": return Scrapper.array_fetch(req_url, Scrapper.r_type.json);
            case "text": return Scrapper.array_fetch(req_url, Scrapper.r_type.text);
        }

    }


}


const begin = async () => {
    let text;
    let json; 


    let data_js = await get_file_via_pluginfile("html5/data/js/data.js", "text");
    text = data_js;

    text = Scorm_parser.cleanse(text);
    json = Scorm_parser.toJson(text);

    json = Scorm_parser.get_scenes(json);
    let scenes = json.scenes;

    let file = await get_file_via_pluginfile(scenes[3].slides[0].html5url, "text");
    console.log(file)
    // file = correct_text_to_json(file);
    
    
    // data.slideLayers[0].objects[0].textLib[0].vartext.blocks[0].spans[0].text
    // console.log(file) 

}


const loadData = async () =>{
    const res = await fetch(chrome.runtime.getURL("private.json"))
    const data = await res.json();

    private_urls = data // set the script global request url to the external file urls


    begin();

}


let private_urls = {}

loadData();
