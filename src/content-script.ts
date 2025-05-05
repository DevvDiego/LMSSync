import type { WindowParams, SCORM_JSON, SimplifiedSCORM, private_urls } from "./types/all.interface";


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

   
    // ! FIND BETTER WAY TO TYPE URL PARAMS 
    static get_window_params(): WindowParams {
        
        const window_params = new URLSearchParams(window.location.search);
        
    
        let results: WindowParams = {
            a: window_params.get("a") || "",
            scoid: window_params.get("scoid") || ""
        };
    
        // window_params.forEach((value, key) => {
        //     results[key] = value;
        // });
    
        return results;
    }

    /**
     * Fetch an array of urls, and return them resolved 
     * returns a promise with an array of the responses of the given urls array
     * 
    */
    static async array_fetch(urls: Array<string>, response_mode:any){
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
    */
    static async str_fetch(url: string, response_mode:any){
        //wrapper function of array_fetch, just to return the first index

        if(typeof url !== "string"){ throw Error(Scrapper.err.url_type) }

        let result = await Scrapper.array_fetch([url], response_mode);
    
        return result[0] //as array fetch returns an array, just give the first index.
    
    }


}




/**
 * Simplifica un JSON de estructura SCORM, extrayendo solo datos esenciales.
 * @param {Object} jsonData - JSON original (con scenes, slides, etc.).
 * @returns {Object} JSON limpio con solo id, lmsId, y slides procesadas.
 */
function simplify_json(data: SCORM_JSON): SimplifiedSCORM {
    return {
        scenes: (data.scenes || []).map(scene => ({
            id: scene.id,
            lmsId: scene.lmsId || "",
            slides: (scene.slides || [])
                .filter(slide => slide.html5url)
                .map(slide => ({
                    id: slide.id,
                    html5url: slide.html5url!, // "!" porque .filter() asegura que existe
                    title: slide.title || ""
                }))
        }))
    };
}


/**
 * Finds case specific strings being badly escaped, and corrects them
 * 
 * @param {string} text 
 */
function remove_bad_escaping(text: string): string{
    
    text = text.replaceAll("\\'", "'")
    text = text.replaceAll("\\\\\"", "\\\"")

    return text;
}

/**
 * 
 * @param {string} text 
 * @returns correct format json
 */
function correct_text_to_json(text: string): any{
    // Remove javascript code from the text    
    
    let data = text;
    
    // ! REMEMBER: replace doesnt throw errors, if the string isnt found, it wont replace anything.
    // case 1, its a data file
    data = data.replace("window.globalProvideData('data', '", "");
    // case 2, its a slides file
    data = data.replace("window.globalProvideData('slide', '", "");
    
    data = data.replace("');","");

    // remove bad escape characters
    data = remove_bad_escaping(data);
    
    //convert to json
    let ttj = JSON.parse(data);

    return ttj
}


//loadSco loads a file that contains the desired data ID in the plugin file
async function get_loadSCO_dataID(page_params: WindowParams){

    //get private url
    let loadSCO = p_urls.loadSCO;
    
    let url = loadSCO.concat("a=", page_params.a, "&", "scoid=", page_params.scoid);
    
    const response = await fetch(url)
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
 */
async function get_file_via_pluginfile(urls: string|string[], response_mode: string): Promise<any>{
    // ! change param types into the class scrapper types

    //get the normal course identifiers
    let identifiers = Scrapper.get_window_params();
    //get the data id, corresponding to the data files of the course
    const data_id = await get_loadSCO_dataID(identifiers);
  
    let pluginfile_url = p_urls.pluginfile;
    pluginfile_url = pluginfile_url.concat(data_id, "/mod_scorm/content/5/");
    let req_url;

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

    let data_js = await get_file_via_pluginfile("html5/data/js/data.js", "text");
    let text = data_js

    // full json
    let json:SCORM_JSON = correct_text_to_json(text);

    //get the requierd or wanted data (currently only scenes are retrieved)
    let simplified_json = simplify_json(json);

    //access the retrieved obj to get all the scenes of the course scenes
    let scenes = simplified_json.scenes;
    console.log(scenes)

    let file = await get_file_via_pluginfile(scenes[3].slides[0].html5url, "text");
    console.log(file)
    // file = correct_text_to_json(file[0]);
    // console.log(file)

}


const loadData = async () =>{
    const res = await fetch(chrome.runtime.getURL("private.json"))
    const data = await res.json();

    p_urls = data // set the script global request url to the external file urls


    begin();

}


let p_urls:private_urls;

loadData(); 
