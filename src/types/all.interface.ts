export interface SimplifiedSCORM {
    scenes: SimplifiedScene[];
}

export interface SimplifiedScene {
    id: string | number;  // Ajusta según el tipo real de "id"
    lmsId?: string;       // Opcional por el "|| ''" en tu código
    slides: SimplifiedSlide[];
}

export interface SimplifiedSlide {
    id: string | number;  // Ajusta según el tipo real de "id"
    html5url: string;     // Obligatorio por el ".filter(slide => slide.html5url)"
    title?: string;       // Opcional por el "|| ''"
}

// Interfaz para el JSON original (SCORM_JSON)
export interface SCORM_JSON {
    scenes: {
        id: string | number;
        lmsId?: string;
        slides?: {
            id: string | number;
            html5url?: string;
            title?: string;
        }[];
    }[];
}


export interface WindowParams {
    a: string
    scoid: string

}

export interface private_urls{
    loadSCO: string,
    pluginfile: string
}

