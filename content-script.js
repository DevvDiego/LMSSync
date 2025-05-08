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

    static get_slide_info(data){

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


    /**
     * Remove a certain amount of scenes from the back of the aray
     * @param {Array} scenes 
     * @param {number} elementsToRemove 
     */
    static remove_from_back(scenes, elementsToRemove = 4) {
        return scenes.slice(0, -elementsToRemove); // use - to start from the end of the array
    }

    /**
     * Simplify slide no matter its normal or title slide
     */
    // Método principal para aplanar cualquier tipo de slide
    static flattenSlide(slideData) {
        if (Scorm_parser.isNormalSlide(slideData) || Scorm_parser.isBibliographySlide(slideData)) {
            return Scorm_parser.processNormalSlide(slideData);
        }
        return Scorm_parser.processTitleSlide(slideData);
    }

    // Detección de slides normales
    static isNormalSlide(slideData) {
        return Scorm_parser.hasNestedObjectsWithText(slideData.slideLayers);
    }

    // Detección de slides de bibliografía
    static isBibliographySlide(slideData) {
        return slideData.lmsId?.startsWith("Slide1") && 
                slideData.title?.toLowerCase().includes("bibliografía");
    }

    // Búsqueda recursiva de objetos con texto
    static hasNestedObjectsWithText(layers) {
        return layers?.some(layer => {
            const checkObjects = (objs) => objs?.some(obj => {
                if (obj.textLib) return true;
                if (obj.objects) return checkObjects(obj.objects);
                return false;
            });
            return checkObjects(layer.objects);
        });
    }

    // Procesamiento de slides normales o bibliografía
    static processNormalSlide(slideData) {
        return {
            title: slideData.title,
            slideNumberInScene: slideData.slideNumberInScene || 0,
            lmsId: slideData.lmsId,
            id: slideData.id,
            slideLayers: slideData.slideLayers.map(layer => ({
                textLib: Scorm_parser.extractNestedTextLib(layer.objects),
                altText: Scorm_parser.extractNestedAltText(layer.objects)
            })).filter(layer => layer.textLib.length > 0)
        };
    }

    // Procesamiento de slides tipo título
    static processTitleSlide(slideData) {
        return {
            title: slideData.title,
            slideNumberInScene: slideData.slideNumberInScene || 0,
            lmsId: slideData.lmsId,
            id: slideData.id,
            slideLayers: (slideData.slideLayers || []).map(layer => ({
                textLib: Scorm_parser.cleanTextLib(layer.textLib || []),
                altText: layer.altText || ''
            }))
        };
    }

    // Extracción recursiva de textLib
    static extractNestedTextLib(objects, result = []) {
        objects?.forEach(obj => {
            if (obj.textLib) {
                obj.textLib.forEach(textItem => {
                    const blocks = textItem.vartext?.blocks || [];
                    blocks.forEach(block => {
                        result.push({
                            spans: block.spans.map(span => ({
                                text: span.text,
                                style: Scorm_parser.filterSpanStyle(span.style)
                            })),
                            style: Scorm_parser.filterBlockStyle(block.style)
                        });
                    });
                });
            }
            if (obj.objects) {
                Scorm_parser.extractNestedTextLib(obj.objects, result);
            }
        });
        return result;
    }

    // Extracción recursiva de altText
    static extractNestedAltText(objects) {
        return objects?.map(obj => {
            const childText = obj.objects ? Scorm_parser.extractNestedAltText(obj.objects) : '';
            return obj.data?.vectorData?.altText ? 
                    `${obj.data.vectorData.altText}\n${childText}` : 
                    childText;
        }).filter(Boolean).join('\n') || '';
    }

    // Limpieza de textLib para slides simples
    static cleanTextLib(textLib) {
        return textLib.map(item => ({
            spans: (item.spans || []).map(span => ({
                text: span.text,
                style: Scorm_parser.filterSpanStyle(span.style)
            })),
            style: Scorm_parser.filterBlockStyle(item.style)
        }));
    }

    // Filtros de estilo
    static filterSpanStyle(style) {
        return {
            fontFamily: style?.fontFamily,
            fontSize: style?.fontSize,
            fontIsBold: style?.fontIsBold ?? false,
            fontIsItalic: style?.fontIsItalic ?? false
        };
    }

    static filterBlockStyle(style) {
        return {
            flowDirection: style?.flowDirection,
            justification: style?.justification,
            lineSpacing: style?.lineSpacing,
            listLevel: style?.listLevel
        };
    }

    // Método para cargar todas las slides (de tu ejemplo anterior)
    static async loadAllSlides(scenes) {
        return Promise.all(scenes.map(async scene => ({
            ...scene,
            processedSlides: await Promise.all(
                (scene.slides || []).map(async slide => {
                    try {
                        const content = await get_file_via_pluginfile(slide.html5url, "text");
                        return Scorm_parser.flattenSlide(
                            Scorm_parser.toJson(
                                Scorm_parser.cleanse(content)
                            )
                        );
                    } catch (error) {
                        console.error(`Error loading slide ${slide.html5url}:`, error);
                        return null;
                    }
                })
            ).then(slides => slides.filter(Boolean))

        })))
    }
}


/**
 * loads a file from the current window that contains the desired data ID for the pluginfile
 * @returns data id of the course in the current window
 */
async function get_course_data_id(){

    //get the normal course identifiers
    let identifiers = Scrapper.get_window_params();

    //get private url
    let loadSCO = private_urls.loadSCO;
    
    loadSCO = loadSCO.concat("a=", identifiers.a, "&", "scoid=", identifiers.scoid);
    
    let page = await Scrapper.str_fetch(loadSCO, Scrapper.r_type.text);
    
    //from the loaded response.txt, search all the string for the id
    let data_id = page.slice(
        page.indexOf(".php/") + 5 , //account the five characters
        page.indexOf("/mod") 
    )
    
    return data_id
}


/**
 * Fetch a url or an array of urls. 
 * 
 * @param {string} data_id The course id to use in pluginfile
 * @param {string|string[]} urls The url or array of urls to request inside the pluginfile api
 * @param {"json"|"text"} response_mode The response you expect, a json or plain text
 * @returns file in the requested format
 */
async function get_file_via_pluginfile(data_id, urls, response_mode){
  
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
    let data_id = await get_course_data_id();


    let raw_file = await get_file_via_pluginfile(data_id, "html5/data/js/data.js", "text");
    
    json = Scorm_parser.get_scenes(
        Scorm_parser.toJson(
            Scorm_parser.cleanse(raw_file)
        )
    )
    console.log("file from datajs")
    console.log(json)


}


const loadData = async () =>{
    const res = await fetch(chrome.runtime.getURL("private.json"))
    const data = await res.json();

    private_urls = data // set the script global request url to the external file urls


    begin();

}


let private_urls = {}

loadData();








async function doAllFetch(){
    let text;
    let json; 

    let data_js = await get_file_via_pluginfile("html5/data/js/data.js", "text");
    text = data_js;

    text = Scorm_parser.cleanse(text);
    json = Scorm_parser.toJson(text);
    json = Scorm_parser.get_scenes(json);
    let scenes = json.scenes;
    
    // Remove four to only leave the actual scenes
    scenes = Scorm_parser.remove_from_back(scenes, 4);
    
    // Procesamiento paralelo de todas las escenas y slides
    const processedScenes = await Promise.all(
        scenes.map(async scene => (
            
            // We want to skip the last scenes, they contain nothing of interest
            
            {
            slides: await Promise.all(
                (scene.slides || []).map(async slide => {
                    
                    try {

                        if(slide.title){

                        }

                        const slideContent = await get_file_via_pluginfile(slide.html5url, "text");

                        return Scorm_parser.flattenSlide(
                            Scorm_parser.toJson(
                                Scorm_parser.cleanse(slideContent)
                            )
                        );

                    } catch (error) {
                        console.error(`Error loading slide ${slide.html5url}:`, error);
                        return null;  // Mantenemos el fallo controlado
                    }

                })

            ).then(slides => slides.filter(Boolean))  // Filtramos slides fallidas
        }))
    );

    return processedScenes;
}